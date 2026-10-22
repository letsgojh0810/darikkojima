/**
 * Keeping the pet on screen. All rects are in physical pixels; `screens` are the monitors' work areas
 * (without the taskbar), so moving to a second monitor is fine and only the space with no screen at all counts.
 */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** below this share of the pet visible, it is "too far into the corner" */
export const TOO_HIDDEN = 0.7;
/** dropping it in the corner again this soon after being pushed back means the user really wants it there */
export const FORCE_WINDOW_MS = 15_000;

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

/** share of the pet (0..1) that lies on some screen; monitors do not overlap, so the parts add up */
export function visibleFraction(pet: Rect, screens: Rect[]): number {
  const area = pet.w * pet.h;
  if (!area) return 1;
  return Math.min(1, screens.reduce((sum, s) => sum + overlap(pet, s), 0) / area);
}

/**
 * Where the pet's top-left should go to be fully on screen, `margin` px from the edges: on the screen it
 * overlaps most, or the nearest one when it is on none.
 */
export function bringOnScreen(pet: Rect, screens: Rect[], margin: number): { x: number; y: number } {
  if (!screens.length) return { x: pet.x, y: pet.y };
  const centre = (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
  const c = centre(pet);
  const best = screens.reduce((a, b) => {
    const oa = overlap(pet, a);
    const ob = overlap(pet, b);
    if (oa !== ob) return ob > oa ? b : a;
    const da = Math.hypot(centre(a).x - c.x, centre(a).y - c.y);
    const db = Math.hypot(centre(b).x - c.x, centre(b).y - c.y);
    return db < da ? b : a;
  });
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));
  return {
    x: clamp(pet.x, best.x + margin, best.x + best.w - pet.w - margin),
    y: clamp(pet.y, best.y + margin, best.y + best.h - pet.h - margin),
  };
}
