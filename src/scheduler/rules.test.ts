import { describe, expect, it } from "vitest";
import { defaultSettings } from "../store/settings";
import { blockReason, type RuleContext } from "./rules";

// 2026-10-20 is a Tuesday; 2026-10-24 a Saturday
const at = (day: number, hhmm: string) => new Date(`2026-10-${day}T${hhmm}:00`);
const ctx = (over: Partial<RuleContext> = {}): RuleContext => ({
  now: at(20, "10:00"),
  settings: defaultSettings,
  kind: "reminder",
  fullscreen: false,
  inMeeting: false,
  quietUntil: null,
  ...over,
});

describe("blockReason for greetings", () => {
  it("ignores work hours, weekends, lunch and meetings", () => {
    expect(blockReason(ctx({ kind: "greeting", now: at(20, "23:00") }))).toBeNull();
    expect(blockReason(ctx({ kind: "greeting", now: at(24, "10:00") }))).toBeNull();
    expect(blockReason(ctx({ kind: "greeting", now: at(20, "12:30") }))).toBeNull();
    expect(blockReason(ctx({ kind: "greeting", inMeeting: true }))).toBeNull();
  });

  it("still respects quiet mode and fullscreen", () => {
    expect(blockReason(ctx({ kind: "greeting", fullscreen: true }))).toBe("fullscreen");
    expect(blockReason(ctx({ kind: "greeting", quietUntil: at(20, "11:00").getTime() }))).toBe("quiet");
  });
});

describe("blockReason", () => {
  it("allows during work hours", () => expect(blockReason(ctx())).toBeNull());

  it("blocks outside work hours, boundaries inclusive start / exclusive end", () => {
    expect(blockReason(ctx({ now: at(20, "08:59") }))).toBe("off-hours");
    expect(blockReason(ctx({ now: at(20, "09:00") }))).toBeNull();
    expect(blockReason(ctx({ now: at(20, "17:59") }))).toBeNull();
    expect(blockReason(ctx({ now: at(20, "18:00") }))).toBe("off-hours");
  });

  it("blocks weekends", () => expect(blockReason(ctx({ now: at(24, "10:00") }))).toBe("off-hours"));

  it("blocks lunch, reopens at 13:00", () => {
    expect(blockReason(ctx({ now: at(20, "12:30") }))).toBe("lunch");
    expect(blockReason(ctx({ now: at(20, "13:00") }))).toBeNull();
  });

  it("blocks fullscreen, even for calendar alerts", () => {
    expect(blockReason(ctx({ fullscreen: true }))).toBe("fullscreen");
    expect(blockReason(ctx({ fullscreen: true, kind: "calendar" }))).toBe("fullscreen");
  });

  it("holds reminders in a meeting but not calendar alerts", () => {
    expect(blockReason(ctx({ inMeeting: true }))).toBe("meeting");
    expect(blockReason(ctx({ inMeeting: true, kind: "calendar" }))).toBeNull();
  });

  it("quiet mode blocks until quietUntil", () => {
    const quietUntil = at(20, "11:00").getTime();
    expect(blockReason(ctx({ quietUntil }))).toBe("quiet");
    expect(blockReason(ctx({ quietUntil, now: at(20, "11:00") }))).toBeNull();
  });
});
