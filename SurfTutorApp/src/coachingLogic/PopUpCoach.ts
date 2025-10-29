// PopUpCoach
// Translate pop-up coaching logic from Python prototype to TypeScript.

import { PoseLandmark, angle, avg } from './utils';

// Module-level state for the pop-up state machine (kept simple here)
let popupStage: 'DOWN' | 'PUSH' | 'UP' = 'DOWN';
let repCounter = 0;
let feedbackTimer: number | null = null;

export function analyzePopUp(landmarks: Record<string, PoseLandmark>) {
  // Required landmarks
  const l_shoulder = landmarks['left_shoulder'];
  const r_shoulder = landmarks['right_shoulder'];
  const l_hip = landmarks['left_hip'];
  const r_hip = landmarks['right_hip'];
  const l_knee = landmarks['left_knee'];
  const r_knee = landmarks['right_knee'];
  const l_elbow = landmarks['left_elbow'];
  const r_elbow = landmarks['right_elbow'];
  const l_wrist = landmarks['left_wrist'];
  const r_wrist = landmarks['right_wrist'];
  const l_ankle = landmarks['left_ankle'];
  const r_ankle = landmarks['right_ankle'];

  if (!l_shoulder || !r_shoulder || !l_hip || !r_hip || !l_knee || !r_knee) {
    return { ok: false, feedback: ['Ensure full body (torso/legs) is visible'] };
  }

  // Compute angles
  const left_hip_angle = angle(l_shoulder, l_hip, l_knee);
  const right_hip_angle = angle(r_shoulder, r_hip, r_knee);
  const avg_hip_angle = avg([left_hip_angle, right_hip_angle]);

  // Stage machine
  if (popupStage === 'DOWN') {
    // Down: body relatively straight: Shoulder-Hip-Knee > 160
    if (avg_hip_angle > 160) {
      popupStage = 'PUSH';
      return { ok: true, stage: 'PUSH', feedback: ['Good start — begin push up'] };
    }
    return { ok: false, stage: 'DOWN', feedback: ['Straighten your body.'] };
  }

  if (popupStage === 'PUSH') {
    if (!l_elbow || !r_elbow || !l_wrist || !r_wrist) {
      return { ok: false, stage: 'PUSH', feedback: ['Ensure arms are visible for PUSH stage'] };
    }
    const left_elbow_angle = angle(l_shoulder, l_elbow, l_wrist);
    const right_elbow_angle = angle(r_shoulder, r_elbow, r_wrist);
    if (left_elbow_angle < 100 && right_elbow_angle < 100) {
      popupStage = 'UP';
      return { ok: true, stage: 'UP', feedback: ['Push well — now jump to your feet'] };
    }
    return { ok: false, stage: 'PUSH', feedback: ['Push strongly with both arms!'] };
  }

  // UP stage: land and check stance
  if (popupStage === 'UP') {
    if (!l_ankle || !r_ankle) {
      return { ok: false, stage: 'UP', feedback: ['Ensure feet/ankles visible for landing check'] };
    }
    const left_knee_angle = angle(l_hip, l_knee, l_ankle);
    const right_knee_angle = angle(r_hip, r_knee, r_ankle);
    const avg_knee_angle = avg([left_knee_angle, right_knee_angle]);
    const left_hip_hinge = angle(l_shoulder, l_hip, l_knee);
    const right_hip_hinge = angle(r_shoulder, r_hip, r_knee);
    const avg_hip_hinge = avg([left_hip_hinge, right_hip_hinge]);

    const knee_ok = avg_knee_angle >= 90 && avg_knee_angle <= 140;
    const hip_ok = avg_hip_hinge >= 140 && avg_hip_hinge <= 170;

    if (knee_ok && hip_ok) {
      repCounter += 1;
      // reset to DOWN after a short pause
      setTimeout(() => {
        popupStage = 'DOWN';
      }, 1200);
      return { ok: true, stage: 'COMPLETE', feedback: ['POP-UP SUCCESS!'], reps: repCounter };
    }

    const feedback = [] as string[];
    if (!knee_ok) feedback.push('Bend knees more!');
    if (!hip_ok) feedback.push('Hinge hips!');
    return { ok: false, stage: 'UP', feedback };
  }

  return { ok: false, feedback: ['Unknown stage'] };
}
