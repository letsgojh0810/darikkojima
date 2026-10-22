import type { Progress } from "./progress";

/**
 * Secrets: hidden milestones earned from what the user actually did. Never listed anywhere; when one is reached the pet
 * says so (messages/ko.ts secretLines) and hands over its item (pet/outfit.ts). Kept in `Progress.titles` (the old name).
 */
export const TITLES: { id: string; earned(p: Progress): boolean }[] = [
  { id: "water10", earned: (p) => (p.totals.done.water ?? 0) >= 10 },
  { id: "water100", earned: (p) => (p.totals.done.water ?? 0) >= 100 },
  { id: "posture50", earned: (p) => (p.totals.done.posture ?? 0) >= 50 },
  { id: "legs100", earned: (p) => (p.totals.done.legs ?? 0) >= 100 },
  { id: "stretch50", earned: (p) => (p.totals.done.stretch ?? 0) >= 50 },
  { id: "streak7", earned: (p) => p.totals.streak >= 7 },
  { id: "streak30", earned: (p) => p.totals.streak >= 30 },
  { id: "roulette", earned: (p) => p.totals.spinDays >= 10 },
  { id: "goodbye20", earned: (p) => p.totals.goodbyes >= 20 },
  { id: "petter", earned: (p) => p.totals.clicks >= 500 },
  { id: "meetings", earned: (p) => p.totals.calendar >= 30 },
];

export const earnedTitles = (p: Progress) => TITLES.filter((t) => t.earned(p)).map((t) => t.id);

/** secrets reached by `p` that are not announced yet (they are added to `p.titles` by the caller) */
export const newTitles = (p: Progress) => earnedTitles(p).filter((id) => !p.titles.includes(id));
