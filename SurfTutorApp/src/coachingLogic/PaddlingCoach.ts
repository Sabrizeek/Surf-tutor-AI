import { PoseLandmark, angle, midpoint, avg } from './utils';

export function analyzePaddling(landmarks: Record<string, PoseLandmark>) {
  const l_ear = landmarks['left_ear'];
  const r_ear = landmarks['right_ear'];
  const l_shoulder = landmarks['left_shoulder'];
  const r_shoulder = landmarks['right_shoulder'];
  const l_hip = landmarks['left_hip'];
  const r_hip = landmarks['right_hip'];
  const nose = landmarks['nose'];

  if (!l_ear || !r_ear || !l_shoulder || !r_shoulder || !l_hip || !r_hip || !nose) {
    return { ok: false, feedback: ['Ensure torso and head are visible'] };
  }

  // Compute ear-shoulder-hip angles
  const left_back_angle = angle(l_ear, l_shoulder, l_hip);
  const right_back_angle = angle(r_ear, r_shoulder, r_hip);
  const avg_back = avg([left_back_angle, right_back_angle]);

  // Head: Nose y smaller (higher) than shoulder midpoint y
  const shoulder_mid = midpoint(l_shoulder, r_shoulder);
  const head_up = shoulder_mid ? nose.y < shoulder_mid.y : false;

  const back_ok = avg_back < 165;

  const feedback: string[] = [];
  if (!back_ok) feedback.push('Lift your chest and head!');
  if (!head_up) feedback.push('Look forward!');

  return { ok: back_ok && head_up, feedback: feedback.length ? feedback : ['GOOD PADDLE POSTURE'], values: { avg_back, head_up } };
}
