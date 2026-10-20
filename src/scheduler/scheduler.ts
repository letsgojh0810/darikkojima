import { reminderMessages } from "../messages/ko";
import type { ReminderId, Settings } from "../store/settings";
import { blockReason, type RuleContext } from "./rules";

type Env = Pick<RuleContext, "fullscreen" | "inMeeting">;

export interface SchedulerDeps {
  getSettings(): Settings;
  getEnv(): Promise<Env> | Env;
  onFire(id: ReminderId, message: string): void;
}

// shortcut: a blocked reminder (quiet, lunch, off-hours...) is retried every minute rather than
// computed to the exact unblock time; replace with next-boundary math if idle wakeups matter.
const RETRY_MS = 60_000;
const MIN = 60_000;

export function createScheduler(d: SchedulerDeps) {
  const due = new Map<ReminderId, number>();
  const skipped = new Set<ReminderId>();
  let quietUntil: number | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const enabled = () =>
    (Object.entries(d.getSettings().reminders) as [ReminderId, { enabled: boolean; intervalMin: number }][])
      .filter(([, r]) => r.enabled);

  function arm() {
    clearTimeout(timer);
    const now = Date.now();
    const live = new Set<ReminderId>();
    for (const [id, r] of enabled()) {
      live.add(id);
      if (!due.has(id)) due.set(id, now + r.intervalMin * MIN);
    }
    for (const id of due.keys()) if (!live.has(id)) due.delete(id);
    if (!due.size) return;
    timer = setTimeout(tick, Math.max(0, Math.min(...due.values()) - now));
  }

  async function tick() {
    const settings = d.getSettings();
    const env = await d.getEnv();
    const now = Date.now();
    for (const [id, r] of enabled()) {
      if ((due.get(id) ?? Infinity) > now) continue;
      skipped.delete(id);
      const blocked = blockReason({ now: new Date(now), settings, kind: "reminder", quietUntil, ...env });
      if (blocked) {
        due.set(id, now + RETRY_MS);
      } else {
        const msgs = reminderMessages[id];
        d.onFire(id, msgs[Math.floor(Math.random() * msgs.length)]);
        due.set(id, now + r.intervalMin * MIN);
      }
    }
    arm();
  }

  return {
    start: arm,
    /** call after the settings changed: a shortened interval takes effect now, a snooze/skip is kept otherwise */
    refresh() {
      const now = Date.now();
      for (const [id, r] of enabled()) {
        const cap = now + r.intervalMin * MIN;
        if ((due.get(id) ?? Infinity) > cap && !skipped.has(id)) due.set(id, cap);
      }
      arm();
    },
    stop: () => clearTimeout(timer),
    snooze(id: ReminderId, minutes = 5) {
      due.set(id, Date.now() + minutes * MIN);
      arm();
    },
    /** "오늘은 그만": next fire is one full interval after the coming midnight */
    skipToday(id: ReminderId) {
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      due.set(id, midnight.getTime() + d.getSettings().reminders[id].intervalMin * MIN);
      skipped.add(id);
      arm();
    },
    quietFor(minutes: number) {
      quietUntil = Date.now() + minutes * MIN;
    },
  };
}
