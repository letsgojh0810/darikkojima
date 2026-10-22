import { describe, expect, it } from "vitest";
import { defaultSettings, type Settings } from "../store/settings";
import { leaveStatus, momentsOf, nextMoment } from "./moments";

describe("leaveStatus", () => {
  const at = (day: number, hhmm: string) => new Date(`2026-10-${day}T${hhmm}:00`);
  it("counts down to the end of work, and says so during lunch", () => {
    expect(leaveStatus(at(20, "15:45"), defaultSettings)).toEqual({ kind: "working", min: 135 });
    expect(leaveStatus(at(20, "12:30"), defaultSettings)).toEqual({ kind: "lunch", min: 330 });
  });

  it("knows before work, after work and days off", () => {
    expect(leaveStatus(at(20, "08:30"), defaultSettings)).toEqual({ kind: "before", min: 30 });
    expect(leaveStatus(at(20, "18:00"), defaultSettings)).toEqual({ kind: "after" });
    expect(leaveStatus(at(24, "10:00"), defaultSettings)).toEqual({ kind: "off" });
  });

  it("rounds a part of a minute up", () => {
    expect(leaveStatus(new Date("2026-10-20T17:59:30"), defaultSettings)).toEqual({ kind: "working", min: 1 });
  });
});

// 2026-10-20 is a Tuesday; 2026-10-24 a Saturday. Default work 09:00-18:00, lunch 12:00-13:00.
const at = (day: number, hhmm: string) => new Date(`2026-10-${day}T${hhmm}:00`);
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const off = (patch: Partial<Settings["moments"]>): Settings => ({ ...defaultSettings, moments: { ...defaultSettings.moments, ...patch } });

describe("momentsOf", () => {
  it("places the moments relative to lunch and the end of work", () => {
    const got = momentsOf(at(20, "08:00"), defaultSettings).map((m) => [m.id, hhmm(m.at)]);
    expect(got).toEqual([
      ["lunch", "11:30"],
      ["countdown3h", "15:00"],
      ["countdown1h", "17:00"],
      ["goodbye", "17:55"],
    ]);
  });

  it("is empty on a day that is not a work day", () => {
    expect(momentsOf(at(24, "10:00"), defaultSettings)).toEqual([]);
  });

  it("drops switched-off moments", () => {
    const ids = momentsOf(at(20, "08:00"), off({ countdown: false, goodbye: false })).map((m) => m.id);
    expect(ids).toEqual(["lunch"]);
  });

  it("drops a moment that would fall before work starts", () => {
    const short: Settings = { ...defaultSettings, workHours: { ...defaultSettings.workHours, start: "16:00" } };
    const ids = momentsOf(at(20, "08:00"), short).map((m) => m.id);
    expect(ids).not.toContain("lunch");
    expect(ids).not.toContain("countdown3h");
    expect(ids).toContain("goodbye");
  });
});

describe("nextMoment", () => {
  const none = new Set<string>();

  it("returns the next one ahead", () => {
    expect(nextMoment(at(20, "09:00"), defaultSettings, none)?.id).toBe("lunch");
  });

  it("returns a moment that is due now, up to the end of its window", () => {
    expect(nextMoment(at(20, "11:50"), defaultSettings, none)?.id).toBe("lunch");
    // lunch has begun: roulette is stale, the next is the 3h countdown
    expect(nextMoment(at(20, "12:05"), defaultSettings, none)?.id).toBe("countdown3h");
  });

  it("skips a countdown that was missed by more than 10 minutes", () => {
    expect(nextMoment(at(20, "15:05"), defaultSettings, none)?.id).toBe("countdown3h");
    expect(nextMoment(at(20, "15:20"), defaultSettings, none)?.id).toBe("countdown1h");
  });

  it("skips what was already said", () => {
    expect(nextMoment(at(20, "09:00"), defaultSettings, new Set(["lunch"]))?.id).toBe("countdown3h");
  });

  it("has nothing left after the goodbye window", () => {
    expect(nextMoment(at(20, "18:00"), defaultSettings, none)).toBeUndefined();
    expect(nextMoment(at(24, "11:30"), defaultSettings, none)).toBeUndefined();
  });
});
