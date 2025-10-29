import { PoseLandmark, angle, avg } from './utils';

export function analyzeStance(landmarks: Record<string, PoseLandmark>) {
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

  const knee_ok = avg_knee >= 90 && avg_knee <= 140;
  const hip_ok = avg_hip >= 140 && avg_hip <= 170;

  const feedback: string[] = [];
  if (!knee_ok) {
    if (avg_knee < 90) feedback.push('Too low!');
    else feedback.push('Bend knees more!');
  }
  if (!hip_ok) {
    if (avg_hip < 140) feedback.push('Hinge at hips, chest forward!');
    else feedback.push('Stand taller!');
  }

  return { ok: knee_ok && hip_ok, feedback: feedback.length ? feedback : ['GREAT STANCE!'], values: { avg_knee, avg_hip } };
}
