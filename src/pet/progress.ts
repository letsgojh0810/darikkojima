/**
 * Closeness (친밀도) with the pet: points from everyday actions, turned into a level. Shared by every pet.
 * Pure functions; the pet window keeps the value and the store persists it (store/index.ts).
 * Points are only ever added: missing a day never takes anything away.
 */
export interface Progress {
  exp: number;
  /** counters of the current day, reset when the date changes */
  day: { date: string; clicks: number; spins: number; greeted: boolean; fired: number; done: number; bonus: boolean };
}

export type ProgressEvent = "fired" | "done" | "click" | "spin" | "greet";

const POINTS = { done: 2, click: 1, spin: 1, greet: 3, bonus: 5 };
/** per day, so clicking the pet all afternoon does not replace actually taking care of yourself */
const CAP = { click: 5, spin: 3 };
/** total points needed to reach Lv.1 … Lv.10 */
export const LEVELS = [0, 10, 30, 60, 100, 150, 210, 280, 360, 450];

export const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

export const emptyProgress = (now: Date): Progress => ({
  exp: 0,
  day: { date: dayKey(now), clicks: 0, spins: 0, greeted: false, fired: 0, done: 0, bonus: false },
});

/** `into` / `need`: points inside the current level and the size of that level (0 at the top level) */
export function levelOf(exp: number) {
  let level = 1;
  while (level < LEVELS.length && exp >= LEVELS[level]) level++;
  const max = level === LEVELS.length;
  return { level, max, into: exp - LEVELS[level - 1], need: max ? 0 : LEVELS[level] - LEVELS[level - 1] };
}

export function award(p: Progress, e: ProgressEvent, now: Date, count = 1): Progress {
  const date = dayKey(now);
  const day = p.day.date === date ? { ...p.day } : emptyProgress(now).day;
  let exp = p.exp;
  switch (e) {
    case "fired":
      day.fired += count;
      break;
    case "done":
      day.done += count;
      exp += POINTS.done * count;
      break;
    case "click":
      if (day.clicks < CAP.click) exp += POINTS.click;
      day.clicks++;
      break;
    case "spin":
      if (day.spins < CAP.spin) exp += POINTS.spin;
      day.spins++;
      break;
    case "greet":
      if (!day.greeted) exp += POINTS.greet;
      day.greeted = true;
      break;
  }
  // a day where at least half of the reminders were answered "했어요" earns a one-time bonus
  if (!day.bonus && day.fired >= 2 && day.done * 2 >= day.fired) {
    day.bonus = true;
    exp += POINTS.bonus;
  }
  return { exp, day };
}
