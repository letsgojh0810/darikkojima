import { calendarMessage } from "../messages/ko";
import type { Settings } from "../store/settings";
import type { CalEvent } from "./CalendarSource";
import { eventKey, isInMeeting, pendingAlerts } from "./events";
import { IcsSource } from "./IcsSource";

const REFRESH_MS = 15 * 60_000;
const RETRY_MS = 60_000;
const DAY = 24 * 60 * 60_000;

export interface CalendarDeps {
  getSettings(): Settings;
  /** quiet / fullscreen / hours check for a calendar alert */
  canAlert(): Promise<boolean>;
  onAlert(message: string): void;
}

export function createCalendar(d: CalendarDeps) {
  const bySource = new Map<string, CalEvent[]>();
  const fired = new Set<string>();
  let refreshTimer: ReturnType<typeof setInterval> | undefined;
  let alertTimer: ReturnType<typeof setTimeout> | undefined;

  const events = () => [...bySource.values()].flat();

  function arm() {
    clearTimeout(alertTimer);
    const now = new Date();
    const next = pendingAlerts(events(), now, d.getSettings().calendarLeadMin, fired)[0];
    if (next) alertTimer = setTimeout(() => fire(next.event), next.at.getTime() - now.getTime());
  }

  async function fire(e: CalEvent) {
    const now = Date.now();
    if (now < e.start.getTime() && !(await d.canAlert())) {
      // shortcut: a blocked alert retries every minute and holds back later alerts until its event starts
      alertTimer = setTimeout(() => fire(e), RETRY_MS);
      return;
    }
    fired.add(eventKey(e));
    if (now < e.start.getTime()) d.onAlert(calendarMessage(e.title, Math.max(1, Math.ceil((e.start.getTime() - now) / 60_000))));
    arm();
  }

  async function refresh() {
    const urls = d.getSettings().icsUrls;
    for (const u of bySource.keys()) if (!urls.includes(u)) bySource.delete(u);
    const now = Date.now();
    await Promise.all(
      urls.map(async (u) => {
        try {
          bySource.set(u, await new IcsSource(u).getEvents(new Date(now - DAY), new Date(now + 2 * DAY)));
        } catch (err) {
          console.warn("ICS fetch failed", err); // keep the last good events for this source
        }
      }),
    );
    arm();
  }

  return {
    start() {
      refresh();
      refreshTimer = setInterval(refresh, REFRESH_MS);
    },
    /** call after the settings changed */
    refresh,
    stop() {
      clearInterval(refreshTimer);
      clearTimeout(alertTimer);
    },
    inMeeting: () => isInMeeting(events(), new Date()),
  };
}
