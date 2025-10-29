export type PoseLandmark = { x: number; y: number; z?: number; score?: number };

export function angle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark) {
  // Calculate angle at point b formed by points a-b-c in degrees (2D)
  if (!a || !b || !c) return NaN;
  const ax = a.x - b.x;
  const ay = a.y - b.y;
  const cx = c.x - b.x;
  const cy = c.y - b.y;
  const dot = ax * cx + ay * cy;
  const magA = Math.hypot(ax, ay);
  const magC = Math.hypot(cx, cy);
  if (magA === 0 || magC === 0) return NaN;
  let cos = dot / (magA * magC);
  cos = Math.max(-1, Math.min(1, cos));
  const radians = Math.acos(cos);
  return (radians * 180) / Math.PI;
}

export function avg(values: number[]) {
  const valid = values.filter((v) => typeof v === 'number' && !isNaN(v));
  if (valid.length === 0) return NaN;
  return valid.reduce((s, v) => s + v, 0) / valid.length;
}

export function midpoint(a: PoseLandmark, b: PoseLandmark) {
  if (!a || !b) return null;
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } as PoseLandmark;
}

export function distance(a: PoseLandmark, b: PoseLandmark) {
  if (!a || !b) return NaN;
  return Math.hypot(a.x - b.x, a.y - b.y);
}
