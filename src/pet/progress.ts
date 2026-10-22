/**
 * Closeness (친밀도) with the pet: points from everyday actions, turned into a level, plus running totals that
 * secrets (pet/titles.ts) are earned from. Shared by every pet. Pure functions; the pet window keeps the value and
 * the store persists it (store/index.ts). Points are only ever added: missing a day never takes anything away.
 *
 * Tuned so an ordinary user (answers some reminders, gets the morning greeting, pets now and then: ~35 points a
 * work day) reaches Lv.10 in about a week; the daily caps stop a very keen user from doing it in two days.
 */
export interface Totals {
  /** "했어요" per reminder id (built-in or custom) */
  done: Record<string, number>;
  clicks: number;
  spins: number;
  /** days with three or more roulette spins */
  spinDays: number;
  /** days where at least half of the reminders were answered */
  bonusDays: number;
  /** such days in a row; a weekend in between does not break it */
  streak: number;
  lastBonus: string;
  /** calendar alerts shown */
  calendar: number;
  /** end-of-day goodbyes shown */
  goodbyes: number;
}

export interface Progress {
  exp: number;
  /** counters of the current day, reset when the date changes */
  day: { date: string; clicks: number; spins: number; greeted: boolean; fired: number; done: number; bonus: boolean };
  totals: Totals;
  /** secrets already found (and announced); named before they became secrets */
  titles: string[];
}

export type ProgressEvent = "fired" | "done" | "click" | "spin" | "greet" | "calendar" | "goodbye";

const POINTS = { done: 2, click: 1, spin: 1, greet: 3, bonus: 5 };
/** per day, so clicking the pet all afternoon does not replace actually taking care of yourself */
const CAP = { done: 15, click: 5, spin: 3 };
/** total points needed to reach Lv.1 … Lv.10 */
export const LEVELS = [0, 8, 20, 35, 55, 80, 105, 135, 165, 200];
/** shortcut: a gap of up to 3 days keeps a streak (Fri → Mon); a custom work week with longer gaps breaks it */
const STREAK_GAP_DAYS = 3;

export const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

const daysBetween = (a: string, b: string) => {
  const toDate = (k: string) => {
    const [y, m, d] = k.split("-").map(Number);
    return new Date(y, m - 1, d).getTime();
  };
  return Math.round((toDate(b) - toDate(a)) / 86_400_000);
};

const emptyTotals = (): Totals => ({
  done: {},
  clicks: 0,
  spins: 0,
  spinDays: 0,
  bonusDays: 0,
  streak: 0,
  lastBonus: "",
  calendar: 0,
  goodbyes: 0,
});

export const emptyProgress = (now: Date): Progress => ({
  exp: 0,
  day: { date: dayKey(now), clicks: 0, spins: 0, greeted: false, fired: 0, done: 0, bonus: false },
  totals: emptyTotals(),
  titles: [],
});

/** fills in what an older saved file does not have yet */
export function normalizeProgress(saved: Partial<Progress> | undefined, now: Date): Progress {
  const base = emptyProgress(now);
  if (!saved) return base;
  return {
    ...base,
    ...saved,
    day: { ...base.day, ...saved.day },
    totals: { ...base.totals, ...saved.totals, done: { ...saved.totals?.done } },
    titles: saved.titles ?? [],
  };
}

/** `into` / `need`: points inside the current level and the size of that level (0 at the top level) */
export function levelOf(exp: number) {
  let level = 1;
  while (level < LEVELS.length && exp >= LEVELS[level]) level++;
  const max = level === LEVELS.length;
  return { level, max, into: exp - LEVELS[level - 1], need: max ? 0 : LEVELS[level] - LEVELS[level - 1] };
}

/** `id` is the reminder for "done" */
export function award(p: Progress, e: ProgressEvent, now: Date, id?: string): Progress {
  const date = dayKey(now);
  const day = p.day.date === date ? { ...p.day } : emptyProgress(now).day;
  const totals: Totals = { ...p.totals, done: { ...p.totals.done } };
  let exp = p.exp;
  switch (e) {
    case "fired":
      day.fired++;
      break;
    case "done":
      if (day.done < CAP.done) exp += POINTS.done;
      day.done++;
      if (id) totals.done[id] = (totals.done[id] ?? 0) + 1;
      break;
    case "click":
      if (day.clicks < CAP.click) exp += POINTS.click;
      day.clicks++;
      totals.clicks++;
      break;
    case "spin":
      if (day.spins < CAP.spin) exp += POINTS.spin;
      day.spins++;
      totals.spins++;
      if (day.spins === 3) totals.spinDays++;
      break;
    case "greet":
      if (!day.greeted) exp += POINTS.greet;
      day.greeted = true;
      break;
    case "calendar":
      totals.calendar++;
      break;
    case "goodbye":
      totals.goodbyes++;
      break;
  }
  // a day where at least half of the reminders were answered "했어요" earns a one-time bonus and feeds the streak
  if (!day.bonus && day.fired >= 2 && day.done * 2 >= day.fired) {
    day.bonus = true;
    exp += POINTS.bonus;
    totals.bonusDays++;
    const gap = totals.lastBonus ? daysBetween(totals.lastBonus, date) : Infinity;
    totals.streak = gap <= STREAK_GAP_DAYS ? totals.streak + 1 : 1;
    totals.lastBonus = date;
  }
  return { ...p, exp, day, totals };
}
