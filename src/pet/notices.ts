/**
 * The notices shown together in one bubble. Pure functions so the rules can be tested without a window:
 * same key refreshes a row, each row lives on its own clock, at most three rows, important rows stay on top.
 */
export type NoticeKind = "reminder" | "calendar" | "hello";

export interface Notice {
  /** same key = same notice: it refreshes the row instead of adding one */
  key: string;
  kind: NoticeKind;
  /** set for recurring reminders (snooze and skip-today apply to them) */
  id?: string;
  message: string;
  /** epoch ms when it was shown or last refreshed */
  at: number;
}

const MIN = 60_000;
/** How long a notice waits unanswered. A greeting is read at a glance; a reminder may sit through a meeting. */
const TTL: Record<NoticeKind, number> = { reminder: 3 * MIN, calendar: 3 * MIN, hello: 1 * MIN };
const LUNCH_TTL = 3 * MIN;
export const MAX_NOTICES = 3;

let override: number | null = null;
/** dev-only: the test tab shortens every lifetime to see one expire quickly; null restores the real ones */
export const setTtlOverride = (ms: number | null) => {
  override = ms;
};
export const ttlOf = (kind: NoticeKind) => override ?? TTL[kind];
export const lunchTtl = () => override ?? LUNCH_TTL;

/** pinned order: calendar alerts first, then greetings / goodbyes, then ordinary reminders */
const rank: Record<NoticeKind, number> = { reminder: 0, hello: 1, calendar: 2 };

export const isLive = (n: Notice, now: number) => n.at + ttlOf(n.kind) > now;
export const pruneNotices = (list: Notice[], now: number) => list.filter((n) => isLive(n, now));

export function addNotice(list: Notice[], n: Notice, now: number): Notice[] {
  const next = [...pruneNotices(list, now).filter((x) => x.key !== n.key), n];
  while (next.length > MAX_NOTICES) {
    // the oldest ordinary reminder goes first (it comes back at its next interval); important rows only when nothing else is left
    const pool = next.some((x) => x.kind === "reminder") ? next.filter((x) => x.kind === "reminder") : next;
    next.splice(next.indexOf(pool.reduce((a, b) => (b.at < a.at ? b : a))), 1);
  }
  return next.sort((a, b) => rank[b.kind] - rank[a.kind] || a.at - b.at);
}

/** when the soonest row runs out, so one timer is enough */
export const nextExpiry = (list: Notice[]) => (list.length ? Math.min(...list.map((n) => n.at + ttlOf(n.kind))) : undefined);
