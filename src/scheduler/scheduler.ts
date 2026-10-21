import { reminderMessages } from "../messages/ko";
import type { ReminderId, Settings } from "../store/settings";
import { blockReason, type RuleContext } from "./rules";

type Env = Pick<RuleContext, "fullscreen" | "inMeeting">;

export interface SchedulerDeps {
  getSettings(): Settings;
  getEnv(): Promise<Env> | Env;
  /** `id` is a built-in ReminderId or a custom reminder's uuid */
  onFire(id: string, message: string): void;
}

// shortcut: a blocked reminder (quiet, lunch, off-hours...) is retried every minute rather than
// computed to the exact unblock time; replace with next-boundary math if idle wakeups matter.
const RETRY_MS = 60_000;
const MIN = 60_000;

interface Active {
  id: string;
  intervalMin: number;
  messages: string[];
}

export function createScheduler(d: SchedulerDeps) {
  const due = new Map<string, number>();
  const skipped = new Set<string>();
  let quietUntil: number | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  /** enabled built-in and custom reminders, one shape for both */
  const enabled = (): Active[] => {
    const st = d.getSettings();
    const builtin = (Object.keys(st.reminders) as ReminderId[])
      .filter((id) => st.reminders[id].enabled)
      .map((id) => ({ id, intervalMin: st.reminders[id].intervalMin, messages: reminderMessages[id] }));
    const custom = st.custom.filter((c) => c.enabled).map((c) => ({ id: c.id, intervalMin: c.intervalMin, messages: [c.text] }));
    return [...builtin, ...custom];
  };

  function arm() {
    clearTimeout(timer);
    const now = Date.now();
    const live = new Set<string>();
    for (const r of enabled()) {
      live.add(r.id);
      if (!due.has(r.id)) due.set(r.id, now + r.intervalMin * MIN);
    }
    for (const id of due.keys()) if (!live.has(id)) due.delete(id);
    if (!due.size) return;
    timer = setTimeout(tick, Math.max(0, Math.min(...due.values()) - now));
  }

  async function tick() {
    const settings = d.getSettings();
    const env = await d.getEnv();
    const now = Date.now();
    for (const r of enabled()) {
      if ((due.get(r.id) ?? Infinity) > now) continue;
      skipped.delete(r.id);
      const blocked = blockReason({ now: new Date(now), settings, kind: "reminder", quietUntil, ...env });
      if (blocked) {
        due.set(r.id, now + RETRY_MS);
      } else {
        d.onFire(r.id, r.messages[Math.floor(Math.random() * r.messages.length)]);
        due.set(r.id, now + r.intervalMin * MIN);
      }
    }
    arm();
  }

  return {
    start: arm,
    /** call after the settings changed: a shortened interval takes effect now, a snooze/skip is kept otherwise */
    refresh() {
      const now = Date.now();
      for (const r of enabled()) {
        const cap = now + r.intervalMin * MIN;
        if ((due.get(r.id) ?? Infinity) > cap && !skipped.has(r.id)) due.set(r.id, cap);
      }
      arm();
    },
    stop: () => clearTimeout(timer),
    snooze(id: string, minutes = 5) {
      due.set(id, Date.now() + minutes * MIN);
      arm();
    },
    /** "오늘은 그만": next fire is one full interval after the coming midnight */
    skipToday(id: string) {
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const interval = enabled().find((r) => r.id === id)?.intervalMin ?? 0;
      due.set(id, midnight.getTime() + interval * MIN);
      skipped.add(id);
      arm();
    },
    quietFor(minutes: number) {
      quietUntil = Date.now() + minutes * MIN;
    },
    /** same gate the reminders go through, for alerts that are not scheduled here (calendar) */
    async canNotify(kind: RuleContext["kind"]) {
      const env = await d.getEnv();
      return !blockReason({ now: new Date(), settings: d.getSettings(), kind, quietUntil, ...env });
    },
  };
}
