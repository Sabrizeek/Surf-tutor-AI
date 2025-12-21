import cv2
import mediapipe as mp
import numpy as np
import time

# Initialize MediaPipe Pose and Drawing utilities
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

# --- Define Colors, Fonts, and Enhanced Drawing Styles ---
RED = (0, 0, 255)
GREEN = (0, 255, 0)
WHITE = (255, 255, 255)
BLUE = (255, 191, 0)
YELLOW = (0, 255, 255)
FONT = cv2.FONT_HERSHEY_SIMPLEX
CUSTOM_DRAWING_SPEC = mp_drawing.DrawingSpec(thickness=2, circle_radius=2, color=BLUE)

# --- Configuration / Thresholds ---
DETECTION_CONFIDENCE = 0.5
TRACKING_CONFIDENCE = 0.5

# Stance & Pop-Up 'UP' stage
STANCE_KNEE_MIN, STANCE_KNEE_MAX = 90, 140
STANCE_HIP_MIN, STANCE_HIP_MAX = 140, 170
# Pop-Up Stages
PUSH_ELBOW_MAX = 100
DOWN_HIP_MIN = 160
# Paddling
PADDLE_ARCH_MAX = 165
# Bottom Turn
TURN_KNEE_MAX = 120 # Deeper bend than stance
TURN_SHOULDER_DIFF_MIN = 0.1 # Shoulders rotated more than hips (X-coord diff)
# Pumping
PUMP_KNEE_LOW_MAX = 110
PUMP_KNEE_HIGH_MIN = 140
# Tube Stance
TUBE_KNEE_MAX = 90
TUBE_HIP_MAX = 100

PANEL_WIDTH = 500
LINE_HEIGHT = 30
PANEL_PADDING = 20

# --- State Variables ---
current_drill = 'stance'
popup_stage = 'DOWN'
pump_state = 'HIGH' # Track if user is in 'HIGH' or 'LOW' pumping phase
rep_counter = 0
feedback_message = ""
feedback_timer = None
prev_hip_mid = None  # For falling detection we keep the previous hip midpoint

# --- Helper Functions ---
def calculate_angle(a, b, c):
    """Calculates the angle between three points."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    # Check if points are distinct to avoid division by zero or invalid atan2 input
    if np.array_equal(a, b) or np.array_equal(b, c):
        return 0.0 # Return 0 or some default if points overlap

    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    return 360 - angle if angle > 180.0 else angle

def draw_panel(image, text_lines):
    """Draws a semi-transparent panel for better text readability."""
    panel_height = len(text_lines) * LINE_HEIGHT + PANEL_PADDING
    sub_img = image[0:panel_height, 0:PANEL_WIDTH]
    black_rect = np.ones(sub_img.shape, dtype=np.uint8) * 50
    res = cv2.addWeighted(sub_img, 0.7, black_rect, 0.3, 1.0)
    image[0:panel_height, 0:PANEL_WIDTH] = res
    
    y0 = LINE_HEIGHT
    for i, line in enumerate(text_lines):
        y = y0 + i * LINE_HEIGHT
        cv2.putText(image, line['text'], (10, y), FONT, 0.7, line['color'], 2, cv2.LINE_AA)

def get_coords(landmarks, landmark_enum):
    """Safely get landmark coordinates."""
    try:
        lm = landmarks[landmark_enum.value]
        # Check visibility before returning coordinates
        if lm.visibility < 0.5: # Visibility threshold
             return None
        return [lm.x, lm.y]
    except:
        return None

# --- Coaching Logic Functions ---

def coach_stance_drill(landmarks):
    """Analyzes surfing stance."""
    lines = [{"text": "Goal: Hold a balanced surf stance.", "color": WHITE}]
    l_shoulder, l_hip, l_knee, l_ankle = (get_coords(landmarks, lm) for lm in [mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.LEFT_HIP, mp_pose.PoseLandmark.LEFT_KNEE, mp_pose.PoseLandmark.LEFT_ANKLE])
    r_shoulder, r_hip, r_knee, r_ankle = (get_coords(landmarks, lm) for lm in [mp_pose.PoseLandmark.RIGHT_SHOULDER, mp_pose.PoseLandmark.RIGHT_HIP, mp_pose.PoseLandmark.RIGHT_KNEE, mp_pose.PoseLandmark.RIGHT_ANKLE])

    if not all([l_shoulder, l_hip, l_knee, l_ankle, r_shoulder, r_hip, r_knee, r_ankle]):
        lines.append({"text": "Ensure full body is visible", "color": RED})
        return lines

    left_knee_angle = calculate_angle(l_hip, l_knee, l_ankle)
    right_knee_angle = calculate_angle(r_hip, r_knee, r_ankle)
    left_hip_angle = calculate_angle(l_shoulder, l_hip, l_knee)
    right_hip_angle = calculate_angle(r_shoulder, r_hip, r_knee)
    
    avg_knee_angle = (left_knee_angle + right_knee_angle) / 2
    avg_hip_angle = (left_hip_angle + right_hip_angle) / 2

    knee_correct = STANCE_KNEE_MIN < avg_knee_angle < STANCE_KNEE_MAX
    hip_correct = STANCE_HIP_MIN < avg_hip_angle < STANCE_HIP_MAX

    lines.append({"text": f"Knee Bend (Avg): {int(avg_knee_angle)}", "color": GREEN if knee_correct else RED})
    lines.append({"text": f"Hip Hinge (Avg): {int(avg_hip_angle)}", "color": GREEN if hip_correct else RED})
    if knee_correct and hip_correct:
        lines.append({"text": "GREAT STANCE!", "color": GREEN})
    return lines

def coach_popup_drill(landmarks):
    """Coaches the multi-stage pop-up."""
    global popup_stage, rep_counter, feedback_timer, feedback_message
    lines = [{"text": f"Reps: {rep_counter}", "color": GREEN}]

    l_shoulder = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_SHOULDER)
    l_hip = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_HIP)
    l_knee = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_KNEE)
    l_elbow = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_ELBOW)
    l_wrist = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_WRIST)
    r_shoulder = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_SHOULDER)
    r_elbow = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_ELBOW)
    r_wrist = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_WRIST)
    l_ankle = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_ANKLE)
    r_hip = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_HIP)
    r_knee = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_KNEE)
    r_ankle = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_ANKLE)


    if not all([l_shoulder, l_hip, l_knee, l_elbow, l_wrist, r_shoulder, r_elbow, r_wrist, l_ankle, r_hip, r_knee, r_ankle]):
         lines.append({"text": "Ensure full body is visible", "color": RED})
         return lines

    if popup_stage == 'DOWN':
        lines.append({"text": "Stage: Lie Down (Press Up Position)", "color": WHITE})
        hip_angle = calculate_angle(l_shoulder, l_hip, l_knee)
        if hip_angle > DOWN_HIP_MIN:
            lines.append({"text": "Good start! Now PUSH UP!", "color": GREEN})
            popup_stage = 'PUSH'
        else:
            lines.append({"text": "Straighten your body.", "color": RED})
    elif popup_stage == 'PUSH':
        lines.append({"text": "Stage: PUSH UP!", "color": WHITE})
        l_elbow_angle = calculate_angle(l_shoulder, l_elbow, l_wrist)
        r_elbow_angle = calculate_angle(r_shoulder, r_elbow, r_wrist)
        if l_elbow_angle < PUSH_ELBOW_MAX and r_elbow_angle < PUSH_ELBOW_MAX:
            lines.append({"text": "Now JUMP to your feet!", "color": GREEN})
            popup_stage = 'UP'
        else:
            lines.append({"text": "Push with your arms!", "color": RED})
    elif popup_stage == 'UP':
        lines.append({"text": "Stage: Land in Surf Stance", "color": WHITE})
        avg_knee_angle = (calculate_angle(l_hip, l_knee, l_ankle) + calculate_angle(r_hip, r_knee, r_ankle)) / 2
        if STANCE_KNEE_MIN < avg_knee_angle < STANCE_KNEE_MAX:
            if feedback_timer is None:
                feedback_timer = time.time()
                rep_counter += 1
                feedback_message = "POP-UP SUCCESS!"
            lines.append({"text": feedback_message, "color": GREEN})
            if time.time() - feedback_timer > 2:
                popup_stage = 'DOWN'; feedback_timer = None
        else:
            lines.append({"text": "Bend your knees more!", "color": RED})
    return lines

def coach_paddling_drill(landmarks):
    """Coaches paddling posture."""
    lines = [{"text": "Goal: Arch back & look forward.", "color": WHITE}]
    l_ear = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_EAR)
    l_shoulder = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_SHOULDER)
    l_hip = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_HIP)
    r_shoulder = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_SHOULDER)
    nose = get_coords(landmarks, mp_pose.PoseLandmark.NOSE)

    if not all([l_ear, l_shoulder, l_hip, r_shoulder, nose]):
        lines.append({"text": "Ensure torso and head visible", "color": RED})
        return lines
        
    back_arch_angle = calculate_angle(l_ear, l_shoulder, l_hip)
    back_is_arched = back_arch_angle < PADDLE_ARCH_MAX
    shoulder_y = (l_shoulder[1] + r_shoulder[1]) / 2
    head_is_up = nose[1] < shoulder_y

    lines.append({"text": f"Back Arch Angle: {int(back_arch_angle)}", "color": GREEN if back_is_arched else RED})
    lines.append({"text": "Head Position: " + ("UP" if head_is_up else "DOWN"), "color": GREEN if head_is_up else RED})
    if back_is_arched and head_is_up:
        lines.append({"text": "GOOD PADDLE POSTURE!", "color": GREEN})
    elif not back_is_arched: lines.append({"text": "Lift your chest and head!", "color": RED})
    elif not head_is_up: lines.append({"text": "Look forward!", "color": RED})
    return lines

def coach_bottom_turn_drill(landmarks):
    """Coaches the compressed and rotated posture for a bottom turn."""
    lines = [{"text": "Goal: Compress & Rotate (Bottom Turn Prep).", "color": WHITE}]
    l_shoulder, l_hip, l_knee, l_ankle = (get_coords(landmarks, lm) for lm in [mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.LEFT_HIP, mp_pose.PoseLandmark.LEFT_KNEE, mp_pose.PoseLandmark.LEFT_ANKLE])
    r_shoulder, r_hip, r_knee, r_ankle = (get_coords(landmarks, lm) for lm in [mp_pose.PoseLandmark.RIGHT_SHOULDER, mp_pose.PoseLandmark.RIGHT_HIP, mp_pose.PoseLandmark.RIGHT_KNEE, mp_pose.PoseLandmark.RIGHT_ANKLE])

    if not all([l_shoulder, l_hip, l_knee, l_ankle, r_shoulder, r_hip, r_knee, r_ankle]):
        lines.append({"text": "Ensure full body is visible", "color": RED})
        return lines

    avg_knee_angle = (calculate_angle(l_hip, l_knee, l_ankle) + calculate_angle(r_hip, r_knee, r_ankle)) / 2
    # Check rotation by comparing the horizontal distance between shoulders
    shoulder_width = abs(l_shoulder[0] - r_shoulder[0])

    knees_compressed = avg_knee_angle < TURN_KNEE_MAX
    shoulders_rotated = shoulder_width < 0.15 # Heuristic: shoulders are less wide when turned

    lines.append({"text": f"Knee Bend (Avg): {int(avg_knee_angle)}", "color": GREEN if knees_compressed else RED})
    lines.append({"text": f"Shoulder Rotation: {'YES' if shoulders_rotated else 'NO'}", "color": GREEN if shoulders_rotated else RED})

    if knees_compressed and shoulders_rotated:
        lines.append({"text": "GOOD TURN POSTURE!", "color": GREEN})
    elif not knees_compressed: lines.append({"text": "Bend knees DEEPER!", "color": RED})
    elif not shoulders_rotated: lines.append({"text": "Rotate shoulders more!", "color": RED})
    return lines

def coach_pumping_drill(landmarks):
    """Coaches the up/down motion of pumping."""
    global pump_state
    lines = [{"text": "Goal: Practice Pumping Motion (Up/Down).", "color": WHITE},
             {"text": f"Current State: {pump_state}", "color": WHITE}]
             
    l_hip, l_knee, l_ankle = (get_coords(landmarks, lm) for lm in [mp_pose.PoseLandmark.LEFT_HIP, mp_pose.PoseLandmark.LEFT_KNEE, mp_pose.PoseLandmark.LEFT_ANKLE])
    r_hip, r_knee, r_ankle = (get_coords(landmarks, lm) for lm in [mp_pose.PoseLandmark.RIGHT_HIP, mp_pose.PoseLandmark.RIGHT_KNEE, mp_pose.PoseLandmark.RIGHT_ANKLE])

    if not all([l_hip, l_knee, l_ankle, r_hip, r_knee, r_ankle]):
        lines.append({"text": "Ensure legs are visible", "color": RED})
        return lines

    avg_knee_angle = (calculate_angle(l_hip, l_knee, l_ankle) + calculate_angle(r_hip, r_knee, r_ankle)) / 2

    if pump_state == 'HIGH':
        lines.append({"text": "Action: Compress DOWN!", "color": YELLOW})
        if avg_knee_angle < PUMP_KNEE_LOW_MAX:
            pump_state = 'LOW'
            lines.append({"text": "Good Compression!", "color": GREEN})
    elif pump_state == 'LOW':
        lines.append({"text": "Action: Extend UP!", "color": YELLOW})
        if avg_knee_angle > PUMP_KNEE_HIGH_MIN:
            pump_state = 'HIGH'
            lines.append({"text": "Good Extension!", "color": GREEN})
            
    lines.append({"text": f"Knee Angle (Avg): {int(avg_knee_angle)}", "color": WHITE})
    return lines

def coach_tube_stance_drill(landmarks):
    """Coaches the deep crouch for a tube stance."""
    lines = [{"text": "Goal: Hold deep crouch (Tube Stance).", "color": WHITE}]
    l_hip, l_knee, l_ankle = (get_coords(landmarks, lm) for lm in [mp_pose.PoseLandmark.LEFT_HIP, mp_pose.PoseLandmark.LEFT_KNEE, mp_pose.PoseLandmark.LEFT_ANKLE])
    r_hip, r_knee, r_ankle = (get_coords(landmarks, lm) for lm in [mp_pose.PoseLandmark.RIGHT_HIP, mp_pose.PoseLandmark.RIGHT_KNEE, mp_pose.PoseLandmark.RIGHT_ANKLE])
    l_shoulder = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_SHOULDER)
    r_shoulder = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_SHOULDER)


    if not all([l_hip, l_knee, l_ankle, r_hip, r_knee, r_ankle, l_shoulder, r_shoulder]):
        lines.append({"text": "Ensure full body is visible", "color": RED})
        return lines

    avg_knee_angle = (calculate_angle(l_hip, l_knee, l_ankle) + calculate_angle(r_hip, r_knee, r_ankle)) / 2
    avg_hip_angle = (calculate_angle(l_shoulder, l_hip, l_knee) + calculate_angle(r_shoulder, r_hip, r_knee)) / 2

    knees_low = avg_knee_angle < TUBE_KNEE_MAX
    hips_low = avg_hip_angle < TUBE_HIP_MAX

    lines.append({"text": f"Knee Bend (Avg): {int(avg_knee_angle)}", "color": GREEN if knees_low else RED})
    lines.append({"text": f"Hip Hinge (Avg): {int(avg_hip_angle)}", "color": GREEN if hips_low else RED})

    if knees_low and hips_low:
        lines.append({"text": "GREAT TUBE STANCE!", "color": GREEN})
    elif not knees_low: lines.append({"text": "Get LOWER! Bend knees more!", "color": RED})
    elif not hips_low: lines.append({"text": "Crouch! Bring chest to knees!", "color": RED})
    return lines

def coach_falling_drill(landmarks):
    """Coaches falling and head-covering motion. Uses simple frame-to-frame hip movement detection."""
    global prev_hip_mid
    lines = [{"text": "Goal: Fall safely & cover your head.", "color": WHITE}]

    l_hip = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_HIP)
    r_hip = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_HIP)
    l_wrist = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_WRIST)
    r_wrist = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_WRIST)
    nose = get_coords(landmarks, mp_pose.PoseLandmark.NOSE)

    if not all([l_hip, r_hip, l_wrist, r_wrist, nose]):
        lines.append({"text": "Ensure hips, hands and head are visible", "color": RED})
        return lines

    hip_mid = [(l_hip[0] + r_hip[0]) / 2.0, (l_hip[1] + r_hip[1]) / 2.0]

    falling_detected = False
    if prev_hip_mid is not None:
        dx = abs(hip_mid[0] - prev_hip_mid[0])
        dy = hip_mid[1] - prev_hip_mid[1]
        # Heuristic thresholds for normalized landmark coords
        if dx > 0.06 or dy > 0.05:
            falling_detected = True

    # Head cover check: both wrists close to nose
    def dist(a, b):
        return ((a[0]-b[0])**2 + (a[1]-b[1])**2) ** 0.5

    left_dist = dist(l_wrist, nose)
    right_dist = dist(r_wrist, nose)
    hands_cover = left_dist < 0.12 and right_dist < 0.12

    if not falling_detected:
        lines.append({"text": "No falling motion detected", "color": RED})
    else:
        lines.append({"text": "Falling motion detected", "color": YELLOW})

    if not hands_cover:
        lines.append({"text": "Cover your head!", "color": RED})
    else:
        lines.append({"text": "Hands covering head", "color": GREEN})

    if falling_detected and hands_cover:
        lines.append({"text": "Safe fall: GOOD", "color": GREEN})

    prev_hip_mid = hip_mid
    return lines


def coach_cutback_drill(landmarks):
    """Coaches the cutback: lead with head/shoulders and maintain stance."""
    lines = [{"text": "Goal: Lead turn with head & shoulders, keep stance.", "color": WHITE}]

    l_shoulder = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_SHOULDER)
    r_shoulder = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_SHOULDER)
    l_hip = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_HIP)
    r_hip = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_HIP)
    nose = get_coords(landmarks, mp_pose.PoseLandmark.NOSE)
    l_knee = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_KNEE)
    r_knee = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_KNEE)
    l_ankle = get_coords(landmarks, mp_pose.PoseLandmark.LEFT_ANKLE)
    r_ankle = get_coords(landmarks, mp_pose.PoseLandmark.RIGHT_ANKLE)

    if not all([l_shoulder, r_shoulder, l_hip, r_hip, nose, l_knee, r_knee, l_ankle, r_ankle]):
        lines.append({"text": "Ensure shoulders, hips, head and legs are visible", "color": RED})
        return lines

    # Shoulder and hip line angles (radians)
    sh_ang = np.arctan2(r_shoulder[1]-l_shoulder[1], r_shoulder[0]-l_shoulder[0])
    hip_ang = np.arctan2(r_hip[1]-l_hip[1], r_hip[0]-l_hip[0])
    rot_deg = abs((sh_ang - hip_ang) * 180.0 / np.pi)

    # Nose ahead of hip midpoint horizontally
    hip_mid_x = (l_hip[0] + r_hip[0]) / 2.0
    nose_ahead = abs(nose[0] - hip_mid_x) > 0.05

    # Stance maintenance
    avg_knee = (calculate_angle(l_hip, l_knee, l_ankle) + calculate_angle(r_hip, r_knee, r_ankle)) / 2.0
    stance_ok = STANCE_KNEE_MIN < avg_knee < STANCE_KNEE_MAX

    if rot_deg < 10:
        lines.append({"text": "Turn head and shoulders first!", "color": RED})
    else:
        lines.append({"text": f"Shoulder-Hip rotation: {int(rot_deg)}deg", "color": GREEN})

    if not nose_ahead:
        lines.append({"text": "Lead with head toward the turn!", "color": RED})

    if not stance_ok:
        lines.append({"text": "Stay low and balanced!", "color": RED})
    else:
        lines.append({"text": "Stance OK", "color": GREEN})

    if rot_deg >= 10 and nose_ahead and stance_ok:
        lines.append({"text": "GOOD CUTBACK!", "color": GREEN})

    return lines


# --- Main Application Loop ---
def main():
    global current_drill, popup_stage, rep_counter, pump_state

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Cannot open webcam")
        return

    # Dictionary to map drill names to functions
    drill_functions = {
        'stance': coach_stance_drill,
        'popup': coach_popup_drill,
        'paddling': coach_paddling_drill,
        'bottom_turn': coach_bottom_turn_drill,
        'pumping': coach_pumping_drill,
        'tube_stance': coach_tube_stance_drill,
        'falling': coach_falling_drill,
        'cutback': coach_cutback_drill,
        # Add 'cutback' and 'snap' later
    }
    
    # Define keys for drills - Use numbers for more drills
    drill_keys = {
        ord('1'): 'stance',
        ord('2'): 'popup',
        ord('3'): 'paddling',
        ord('4'): 'bottom_turn',
        ord('5'): 'pumping',
        ord('6'): 'tube_stance',
        ord('7'): 'falling',
        ord('8'): 'cutback'
        # Add more keys as needed
    }
    drill_key_text = "Drills: 1:Stance 2:PopUp 3:Paddle 4:BtmTurn 5:Pump 6:Tube 7:Falling 8:Cutback | r:Reset | q:Quit"


    with mp_pose.Pose(min_detection_confidence=DETECTION_CONFIDENCE, min_tracking_confidence=TRACKING_CONFIDENCE) as pose:
        while cap.isOpened():
            success, frame = cap.read()
            if not success: continue

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(frame_rgb)

            if results.pose_landmarks:
                mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS, landmark_drawing_spec=CUSTOM_DRAWING_SPEC)

            text_lines_to_display = [
                {"text": f"Current Drill: {current_drill.upper()}", "color": WHITE},
                {"text": drill_key_text, "color": YELLOW}
            ]

            try:
                if results.pose_landmarks:
                    landmarks = results.pose_landmarks.landmark
                    # Call the appropriate coaching function
                    coach_function = drill_functions.get(current_drill)
                    if coach_function:
                         # Pass landmarks (MediaPipe list) to coach; some coaches may need previous frame data
                         # Convert landmarks list to simple dict of needed names to coordinates for coaches that expect them
                         # For backward compatibility we'll pass the raw landmarks list into existing coaches
                         text_lines_to_display.extend(coach_function(landmarks))
                    else:
                         text_lines_to_display.append({"text": "Selected drill not implemented", "color": RED})
                else:
                    text_lines_to_display.append({"text": "No pose detected", "color": RED})
            except Exception as e:
                # Basic error handling during development
                # print(f"Error in coaching logic: {e}") # Uncomment to debug
                text_lines_to_display.append({"text": "Ensure body is fully visible", "color": RED})

            draw_panel(frame, text_lines_to_display)
            cv2.imshow('Surf AI Pose Coach', frame)

            key = cv2.waitKey(10) & 0xFF
            if key == ord('q'): break
            elif key == ord('r'): # Generic Reset
                 popup_stage = 'DOWN'; rep_counter = 0; pump_state = 'HIGH'
            elif key in drill_keys:
                 current_drill = drill_keys[key]
                 # Reset states when changing drill
                 popup_stage = 'DOWN'; rep_counter = 0; pump_state = 'HIGH'


    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

