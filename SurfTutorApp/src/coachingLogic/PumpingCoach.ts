import { PoseLandmark, angle, avg } from './utils';

let pumpState: 'HIGH' | 'LOW' = 'HIGH';

export function analyzePumping(landmarks: Record<string, PoseLandmark>) {
  const l_hip = landmarks['left_hip'];
  const r_hip = landmarks['right_hip'];
  const l_knee = landmarks['left_knee'];
  const r_knee = landmarks['right_knee'];
  const l_ankle = landmarks['left_ankle'];
  const r_ankle = landmarks['right_ankle'];

  if (!l_hip || !r_hip || !l_knee || !r_knee || !l_ankle || !r_ankle) {
    return { ok: false, feedback: ['Ensure legs visible'] };
  }

  const left_knee_angle = angle(l_hip, l_knee, l_ankle);
  const right_knee_angle = angle(r_hip, r_knee, r_ankle);
  const avg_knee = avg([left_knee_angle, right_knee_angle]);

  const feedback: string[] = [];

  if (pumpState === 'HIGH') {
    feedback.push('Action: Compress DOWN!');
    if (avg_knee < 110) {
      pumpState = 'LOW';
      feedback.push('Good Compression!');
    }
  } else {
    feedback.push('Action: Extend UP!');
    if (avg_knee > 140) {
      pumpState = 'HIGH';
      feedback.push('Good Extension!');
    }
  }

  return { ok: true, state: pumpState, feedback, values: { avg_knee } };
}
