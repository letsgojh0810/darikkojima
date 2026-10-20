import type { CalEvent } from "./CalendarSource";

export const eventKey = (e: CalEvent) => `${e.uid}@${e.start.getTime()}`;

export const isInMeeting = (events: CalEvent[], now: Date) => events.some((e) => e.start <= now && now < e.end);

/** Events that have not started and were not alerted yet, earliest alert first. An alert time already past means "now". */
export function pendingAlerts(events: CalEvent[], now: Date, leadMin: number, fired: Set<string>) {
  return events
    .filter((e) => e.start > now && !fired.has(eventKey(e)))
    .map((event) => ({ event, at: new Date(Math.max(event.start.getTime() - leadMin * 60_000, now.getTime())) }))
    .sort((a, b) => a.at.getTime() - b.at.getTime());
}
