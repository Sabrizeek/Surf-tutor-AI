import { PoseLandmark, distance } from './utils';

// Detect falling motion by comparing previous hip position to current one; caller should provide prevLandmarks when available.
export function analyzeFalling(landmarks: Record<string, PoseLandmark>, prev?: Record<string, PoseLandmark>) {
  const l_hip = landmarks['left_hip'];
  const r_hip = landmarks['right_hip'];
  const l_wrist = landmarks['left_wrist'];
  const r_wrist = landmarks['right_wrist'];
  const nose = landmarks['nose'] || landmarks['head'] || null;

  if (!l_hip || !r_hip || !l_wrist || !r_wrist || !nose) {
    return { ok: false, feedback: ['Ensure hips, hands and head are visible'] };
  }

  // Simple falling detection: compare hip midpoint movement between frames (requires prev)
  if (!prev || !prev['left_hip'] || !prev['right_hip']) {
    return { ok: false, feedback: ['Need previous frame to detect falling motion'] };
  }

  const hip_mid = { x: (l_hip.x + r_hip.x) / 2, y: (l_hip.y + r_hip.y) / 2 } as PoseLandmark;
  const prev_mid = { x: (prev['left_hip'].x + prev['right_hip'].x) / 2, y: (prev['left_hip'].y + prev['right_hip'].y) / 2 } as PoseLandmark;

  const dx = Math.abs(hip_mid.x - prev_mid.x);
  const dy = hip_mid.y - prev_mid.y; // positive if moved downwards

  const falling = dx > 0.08 || dy > 0.05; // heuristic thresholds for normalized coords

  // Head cover: wrists close to nose/head
  const left_hand_dist = distance(l_wrist, nose);
  const right_hand_dist = distance(r_wrist, nose);
  const hands_cover = left_hand_dist < 0.12 && right_hand_dist < 0.12;

  const feedback: string[] = [];
  if (!falling) feedback.push('No falling motion detected');
  if (!hands_cover) feedback.push('Cover your head!');

  return { ok: falling && hands_cover, feedback: feedback.length ? feedback : ['Good fall & cover detected'], values: { dx, dy, left_hand_dist, right_hand_dist } };
}
