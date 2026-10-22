import ICAL from "ical.js";
import type { CalEvent } from "./CalendarSource";

// RRULE iteration starts at DTSTART, so a years-old daily event needs thousands of steps to reach today.
const MAX_STEPS = 20_000;

/**
 * True when the text starts like a calendar feed. A wrong address often returns a web page instead
 * (a login or error page), which the parser would choke on with a message nobody can act on.
 */
export const isIcs = (text: string) => /^﻿?\s*BEGIN:VCALENDAR/i.test(text);

/**
 * Outlook marks blocks that are not real commitments as free / working elsewhere; with an availability-only feed the
 * status is also all the title says. Such blocks are no event to be told about.
 */
const NOT_BUSY = new Set(["FREE", "WORKINGELSEWHERE"]);
const NOT_BUSY_TITLES = new Set(["약속 없음", "다른 위치에서 근무 중", "free", "working elsewhere"]);
const notBusy = (v: ICAL.Component) =>
  v.getFirstPropertyValue("transp") === "TRANSPARENT" ||
  NOT_BUSY.has(String(v.getFirstPropertyValue("x-microsoft-cdo-busystatus") ?? "").toUpperCase()) ||
  NOT_BUSY_TITLES.has(String(v.getFirstPropertyValue("summary") ?? "").trim().toLowerCase());

/** Timed events overlapping [from, to], recurrences expanded. All-day, cancelled and free (Outlook) events are skipped. */
export function parseEvents(ics: string, from: Date, to: Date): CalEvent[] {
  const root = new ICAL.Component(ICAL.parse(ics));
  for (const tz of root.getAllSubcomponents("vtimezone")) ICAL.TimezoneService.register(tz);

  const masters = new Map<string, ICAL.Event>();
  const exceptions: ICAL.Event[] = [];
  for (const v of root.getAllSubcomponents("vevent")) {
    if (v.getFirstPropertyValue("status") === "CANCELLED" || notBusy(v)) continue;
    const e = new ICAL.Event(v);
    if (e.startDate.isDate) continue;
    if (e.isRecurrenceException()) exceptions.push(e);
    else masters.set(e.uid, e);
  }

  const out: CalEvent[] = [];
  const add = (uid: string, title: string, s: ICAL.Time, e: ICAL.Time) => {
    const start = s.toJSDate();
    const end = e.toJSDate();
    if (end >= from && start <= to) out.push({ uid, title: title || "(제목 없음)", start, end });
  };

  const orphans = exceptions.filter((x) => !masters.get(x.uid)?.relateException(x));
  for (const o of orphans) add(o.uid, o.summary, o.startDate, o.endDate);

  for (const m of masters.values()) {
    if (!m.isRecurring()) {
      add(m.uid, m.summary, m.startDate, m.endDate);
      continue;
    }
    const it = m.iterator();
    for (let n = 0, t = it.next(); t && n < MAX_STEPS; t = it.next(), n++) {
      const d = m.getOccurrenceDetails(t);
      if (d.startDate.toJSDate() > to) break;
      add(m.uid, d.item.summary, d.startDate, d.endDate);
    }
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}
