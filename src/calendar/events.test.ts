import { describe, expect, it } from "vitest";
import type { CalEvent } from "./CalendarSource";
import { eventKey, isInMeeting, pendingAlerts } from "./events";

const at = (hhmm: string) => new Date(`2026-10-20T${hhmm}:00`);
const ev = (uid: string, s: string, e: string): CalEvent => ({ uid, title: uid, start: at(s), end: at(e) });

describe("isInMeeting", () => {
  const evs = [ev("a", "10:00", "11:00")];
  it("is true from start until end (exclusive)", () => {
    expect(isInMeeting(evs, at("09:59"))).toBe(false);
    expect(isInMeeting(evs, at("10:00"))).toBe(true);
    expect(isInMeeting(evs, at("10:59"))).toBe(true);
    expect(isInMeeting(evs, at("11:00"))).toBe(false);
  });
});

describe("pendingAlerts", () => {
  const evs = [ev("late", "15:00", "16:00"), ev("soon", "10:30", "11:00"), ev("past", "09:00", "09:30")];

  it("orders by alert time and skips started events", () => {
    const r = pendingAlerts(evs, at("10:00"), 10, new Set());
    expect(r.map((x) => x.event.uid)).toEqual(["soon", "late"]);
    expect(r[0].at).toEqual(at("10:20"));
  });

  it("alerts immediately when inside the lead window", () => {
    const [r] = pendingAlerts(evs, at("10:25"), 10, new Set());
    expect(r.at).toEqual(at("10:25"));
  });

  it("skips already fired", () => {
    const r = pendingAlerts(evs, at("10:00"), 10, new Set([eventKey(evs[1])]));
    expect(r.map((x) => x.event.uid)).toEqual(["late"]);
  });
});
