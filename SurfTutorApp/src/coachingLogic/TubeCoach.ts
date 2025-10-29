import { PoseLandmark, angle, avg } from './utils';

export function analyzeTube(landmarks: Record<string, PoseLandmark>) {
  const l_shoulder = landmarks['left_shoulder'];
  const r_shoulder = landmarks['right_shoulder'];
  const l_hip = landmarks['left_hip'];
  const r_hip = landmarks['right_hip'];
  const l_knee = landmarks['left_knee'];
  const r_knee = landmarks['right_knee'];
  const l_ankle = landmarks['left_ankle'];
  const r_ankle = landmarks['right_ankle'];

  if (!l_shoulder || !r_shoulder || !l_hip || !r_hip || !l_knee || !r_knee || !l_ankle || !r_ankle) {
    return { ok: false, feedback: ['Ensure full body is visible'] };
  }

  const left_knee_angle = angle(l_hip, l_knee, l_ankle);
  const right_knee_angle = angle(r_hip, r_knee, r_ankle);
  const left_hip_angle = angle(l_shoulder, l_hip, l_knee);
  const right_hip_angle = angle(r_shoulder, r_hip, r_knee);

  const avg_knee = avg([left_knee_angle, right_knee_angle]);
  const avg_hip = avg([left_hip_angle, right_hip_angle]);

  const knees_low = avg_knee < 90;
  const hips_low = avg_hip < 100;

  const feedback: string[] = [];
  if (!knees_low) feedback.push('Get LOWER! Bend knees!');
  if (!hips_low) feedback.push('Crouch! Chest towards knees!');

  return { ok: knees_low && hips_low, feedback: feedback.length ? feedback : ['GREAT TUBE STANCE!'], values: { avg_knee, avg_hip } };
}
