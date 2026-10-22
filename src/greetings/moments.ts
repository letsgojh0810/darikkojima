import type { Settings } from "../store/settings";

export type MomentId = "countdown3h" | "countdown1h" | "lunch" | "goodbye";

/** `at` is when the pet speaks; `until` is how long it is still worth saying (a late start skips stale ones). */
export interface Moment {
  id: MomentId;
  at: Date;
  until: Date;
}

const MIN = 60_000;
const RETRY_MS = 60_000;

const atClock = (day: Date, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
};

/** The moments of one day in time order. Weekdays outside the work days, switched-off moments, and ones before work starts are left out. */
export function momentsOf(day: Date, s: Settings): Moment[] {
  if (!s.workHours.days.includes(day.getDay())) return [];
  const start = atClock(day, s.workHours.start);
  const end = atClock(day, s.workHours.end);
  const lunch = atClock(day, s.lunch.start);
  const out: Moment[] = [];
  const add = (id: MomentId, at: Date, windowMin: number) => {
    if (at >= start) out.push({ id, at, until: new Date(at.getTime() + windowMin * MIN) });
  };
  if (s.moments.lunch) add("lunch", new Date(lunch.getTime() - 30 * MIN), 30); // still useful until lunch starts
  if (s.moments.countdown) {
    add("countdown3h", new Date(end.getTime() - 180 * MIN), 10);
    add("countdown1h", new Date(end.getTime() - 60 * MIN), 10);
  }
  if (s.moments.goodbye) add("goodbye", new Date(end.getTime() - 5 * MIN), 5);
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** The first moment of today not yet said that is still worth saying: due now or the next one ahead. */
export function nextMoment(now: Date, s: Settings, said: ReadonlySet<string>): Moment | undefined {
  return momentsOf(now, s).find((m) => m.until > now && !said.has(m.id));
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// shortcut: "already said today" lives in localStorage, so clearing site data replays the day's moments once
function loadSaid(now: Date): Set<string> {
  try {
    const saved = JSON.parse(localStorage.getItem("momentsSaid") ?? "null");
    if (saved?.day === dayKey(now)) return new Set(saved.ids);
  } catch {
    /* unreadable: start the day fresh */
  }
  return new Set();
}

function saveSaid(now: Date, said: Set<string>) {
  try {
    localStorage.setItem("momentsSaid", JSON.stringify({ day: dayKey(now), ids: [...said] }));
  } catch {
    /* storage unavailable: the moment may repeat after a restart */
  }
}

export interface MomentsDeps {
  getSettings(): Settings;
  /** quiet mode / fullscreen gate */
  canShow(): Promise<boolean>;
  onMoment(id: MomentId): void;
}

/** One timer aimed at the next moment; no polling. A blocked moment retries every minute until its window closes. */
export function createMoments(d: MomentsDeps) {
  let said = loadSaid(new Date());
  let timer: ReturnType<typeof setTimeout> | undefined;

  function arm() {
    clearTimeout(timer);
    const now = new Date();
    const next = nextMoment(now, d.getSettings(), said);
    if (next) {
      timer = setTimeout(() => fire(next), Math.max(0, next.at.getTime() - now.getTime()));
      return;
    }
    // nothing left today: look again just after midnight with a fresh slate
    const midnight = new Date(now);
    midnight.setHours(24, 0, 1, 0);
    timer = setTimeout(() => {
      said = new Set();
      saveSaid(new Date(), said);
      arm();
    }, midnight.getTime() - now.getTime());
  }

  async function fire(m: Moment) {
    if (new Date() >= m.until) return arm();
    if (!(await d.canShow())) {
      timer = setTimeout(() => fire(m), RETRY_MS);
      return;
    }
    said.add(m.id);
    saveSaid(new Date(), said);
    d.onMoment(m.id);
    arm();
  }

  return {
    start: arm,
    /** call after the settings changed */
    refresh: arm,
    stop: () => clearTimeout(timer),
  };
}
