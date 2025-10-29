import { PoseLandmark, angle, avg } from './utils';

export function analyzeCutback(landmarks: Record<string, PoseLandmark>) {
  const l_shoulder = landmarks['left_shoulder'];
  const r_shoulder = landmarks['right_shoulder'];
  const l_hip = landmarks['left_hip'];
  const r_hip = landmarks['right_hip'];
  const nose = landmarks['nose'];
  const l_knee = landmarks['left_knee'];
  const r_knee = landmarks['right_knee'];

  if (!l_shoulder || !r_shoulder || !l_hip || !r_hip || !nose || !l_knee || !r_knee) {
    return { ok: false, feedback: ['Ensure shoulders, hips, head and knees are visible'] };
  }

  // Shoulder line angle and hip line angle
  const shoulder_angle = angle(l_shoulder, { x: (l_shoulder.x + r_shoulder.x) / 2, y: (l_shoulder.y + r_shoulder.y) / 2 } as PoseLandmark, r_shoulder);
  const hip_angle = angle(l_hip, { x: (l_hip.x + r_hip.x) / 2, y: (l_hip.y + r_hip.y) / 2 } as PoseLandmark, r_hip);
  const rotation_diff = Math.abs(shoulder_angle - hip_angle);

  // Nose direction: check if nose is significantly offset horizontally from hips midpoint
  const hip_mid_x = (l_hip.x + r_hip.x) / 2;
  const nose_ahead = Math.abs(nose.x - hip_mid_x) > 0.05;

  // Stance check (reuse stance ranges)
  const left_knee_angle = angle(l_hip, l_knee, landmarks['left_ankle']);
  const right_knee_angle = angle(r_hip, r_knee, landmarks['right_ankle']);
  const avg_knee = avg([left_knee_angle, right_knee_angle]);
  const stance_ok = avg_knee >= 90 && avg_knee <= 140;

  const feedback: string[] = [];
  if (rotation_diff < 10) feedback.push('Turn head and shoulders first!');
  if (!stance_ok) feedback.push('Stay low and balanced!');
  if (!nose_ahead) feedback.push('Lead with head toward the turn!');

  return { ok: rotation_diff >= 10 && stance_ok && nose_ahead, feedback: feedback.length ? feedback : ['Good cutback'], values: { rotation_diff, avg_knee } };
}
