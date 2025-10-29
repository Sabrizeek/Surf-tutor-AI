import { PoseLandmark, angle, avg, distance } from './utils';

export function analyzeBottomTurn(landmarks: Record<string, PoseLandmark>) {
  const l_shoulder = landmarks['left_shoulder'];
  const r_shoulder = landmarks['right_shoulder'];
  const l_hip = landmarks['left_hip'];
  const r_hip = landmarks['right_hip'];
  const l_knee = landmarks['left_knee'];
  const r_knee = landmarks['right_knee'];
  const l_ankle = landmarks['left_ankle'];
  const r_ankle = landmarks['right_ankle'];

  if (!l_shoulder || !r_shoulder || !l_hip || !r_hip || !l_knee || !r_knee || !l_ankle || !r_ankle) {
    return { ok: false, feedback: ['Ensure full body visible'] };
  }

  const left_knee_angle = angle(l_hip, l_knee, l_ankle);
  const right_knee_angle = angle(r_hip, r_knee, r_ankle);
  const avg_knee = avg([left_knee_angle, right_knee_angle]);

  // Shoulder rotation heuristic: shoulder horizontal distance smaller than hip distance
  const shoulder_width = Math.abs(l_shoulder.x - r_shoulder.x);
  const hip_width = Math.abs(l_hip.x - r_hip.x);
  const shoulders_rotated = shoulder_width < hip_width * 0.9 || shoulder_width < 0.15;

  const feedback: string[] = [];
  if (avg_knee >= 120) feedback.push('Bend knees DEEPER!');
  if (!shoulders_rotated) feedback.push('Rotate shoulders into the turn!');

  return { ok: avg_knee < 120 && shoulders_rotated, feedback: feedback.length ? feedback : ['GOOD TURN POSTURE!'], values: { avg_knee, shoulder_width, hip_width } };
}
