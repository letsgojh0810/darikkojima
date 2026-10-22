import { describe, expect, it } from "vitest";
import { isIcs, parseEvents } from "./ics";

describe("isIcs", () => {
  it("accepts a feed, with or without a byte order mark or leading blank lines", () => {
    expect(isIcs("BEGIN:VCALENDAR\r\nVERSION:2.0")).toBe(true);
    expect(isIcs("﻿BEGIN:VCALENDAR")).toBe(true);
    expect(isIcs("\r\n  begin:vcalendar")).toBe(true);
  });

  it("rejects the web pages a wrong address returns", () => {
    expect(isIcs("<!doctype html><html><head>")).toBe(false);
    expect(isIcs("")).toBe(false);
    expect(isIcs("404 Not Found")).toBe(false);
  });
});

const wrap = (...events: string[]) =>
  ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//test//EN", ...events, "END:VCALENDAR"].join("\r\n");
const vevent = (...lines: string[]) => ["BEGIN:VEVENT", ...lines, "END:VEVENT"].join("\r\n");

const from = new Date("2026-10-19T00:00:00Z");
const to = new Date("2026-10-26T00:00:00Z");

describe("parseEvents", () => {
  it("skips Outlook's free and working-elsewhere blocks but keeps busy and tentative ones", () => {
    const at = (h: number) => [`DTSTART:20261020T0${h}0000Z`, `DTEND:20261020T0${h}3000Z`];
    const ics = wrap(
      vevent("UID:free", "SUMMARY:약속 없음", "X-MICROSOFT-CDO-BUSYSTATUS:FREE", ...at(1)),
      vevent("UID:away", "SUMMARY:다른 위치에서 근무 중", ...at(2)),
      vevent("UID:transp", "SUMMARY:점심", "TRANSP:TRANSPARENT", ...at(3)),
      vevent("UID:busy", "SUMMARY:바쁨", "X-MICROSOFT-CDO-BUSYSTATUS:BUSY", ...at(4)),
      vevent("UID:tent", "SUMMARY:임시", "X-MICROSOFT-CDO-BUSYSTATUS:TENTATIVE", ...at(5)),
    );
    expect(parseEvents(ics, from, to).map((e) => e.uid)).toEqual(["busy", "tent"]);
  });

  it("reads a single UTC event", () => {
    const ics = wrap(vevent("UID:a", "SUMMARY:주간회의", "DTSTART:20261020T010000Z", "DTEND:20261020T020000Z"));
    const [e] = parseEvents(ics, from, to);
    expect(e.title).toBe("주간회의");
    expect(e.start.toISOString()).toBe("2026-10-20T01:00:00.000Z");
    expect(e.end.toISOString()).toBe("2026-10-20T02:00:00.000Z");
  });

  it("drops events outside the range, all-day events and cancelled events", () => {
    const ics = wrap(
      vevent("UID:old", "SUMMARY:old", "DTSTART:20260101T010000Z", "DTEND:20260101T020000Z"),
      vevent("UID:allday", "SUMMARY:allday", "DTSTART;VALUE=DATE:20261020", "DTEND;VALUE=DATE:20261021"),
      vevent("UID:gone", "SUMMARY:gone", "STATUS:CANCELLED", "DTSTART:20261020T010000Z", "DTEND:20261020T020000Z"),
    );
    expect(parseEvents(ics, from, to)).toEqual([]);
  });

  it("expands a weekly rule that started long ago, honoring EXDATE", () => {
    const ics = wrap(
      vevent(
        "UID:w",
        "SUMMARY:스탠드업",
        "DTSTART:20250106T010000Z",
        "DTEND:20250106T013000Z",
        "RRULE:FREQ=WEEKLY;BYDAY=MO,WE",
        "EXDATE:20261021T010000Z",
      ),
    );
    const days = parseEvents(ics, from, new Date("2026-10-27T00:00:00Z")).map((e) => e.start.toISOString().slice(0, 10));
    expect(days).toEqual(["2026-10-19", "2026-10-26"]);
  });

  it("applies a moved occurrence (RECURRENCE-ID)", () => {
    const ics = wrap(
      vevent("UID:m", "SUMMARY:정기", "DTSTART:20260105T010000Z", "DTEND:20260105T020000Z", "RRULE:FREQ=WEEKLY"),
      vevent("UID:m", "SUMMARY:정기(변경)", "RECURRENCE-ID:20261019T010000Z", "DTSTART:20261019T060000Z", "DTEND:20261019T070000Z"),
    );
    const mon = parseEvents(ics, from, to).find((e) => e.start.toISOString().startsWith("2026-10-19"));
    expect(mon?.title).toBe("정기(변경)");
    expect(mon?.start.toISOString()).toBe("2026-10-19T06:00:00.000Z");
  });

  it("converts a TZID event using its VTIMEZONE", () => {
    const tz = [
      "BEGIN:VTIMEZONE",
      "TZID:Asia/Seoul",
      "BEGIN:STANDARD",
      "DTSTART:19700101T000000",
      "TZOFFSETFROM:+0900",
      "TZOFFSETTO:+0900",
      "TZNAME:KST",
      "END:STANDARD",
      "END:VTIMEZONE",
    ].join("\r\n");
    const ics = wrap(tz, vevent("UID:k", "SUMMARY:kst", "DTSTART;TZID=Asia/Seoul:20261020T100000", "DTEND;TZID=Asia/Seoul:20261020T110000"));
    expect(parseEvents(ics, from, to)[0].start.toISOString()).toBe("2026-10-20T01:00:00.000Z");
  });
});
