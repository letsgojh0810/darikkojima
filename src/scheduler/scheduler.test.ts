import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultSettings, type Settings } from "../store/settings";
import { createScheduler } from "./scheduler";

const MIN = 60_000;
const only = (id: keyof Settings["reminders"], intervalMin: number): Settings => ({
  ...defaultSettings,
  reminders: Object.fromEntries(
    Object.keys(defaultSettings.reminders).map((k) => [k, { enabled: k === id, intervalMin }]),
  ) as Settings["reminders"],
});

function setup(startAt: string, env = { fullscreen: false, inMeeting: false }) {
  vi.setSystemTime(new Date(startAt));
  const fired: string[] = [];
  const s = createScheduler({
    getSettings: () => only("water", 1),
    getEnv: () => env,
    onFire: (id) => fired.push(id),
  });
  return { s, fired, env };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("scheduler", () => {
  it("fires a custom reminder with its own text, and skips a disabled one", async () => {
    vi.setSystemTime(new Date("2026-10-20T10:00:00"));
    const base = only("water", 1);
    const settings: Settings = {
      ...base,
      reminders: { ...base.reminders, water: { enabled: false, intervalMin: 1 } },
      custom: [
        { id: "c1", text: "약 먹을 시간이에요", enabled: true, intervalMin: 2 },
        { id: "c2", text: "꺼진 것", enabled: false, intervalMin: 1 },
      ],
    };
    const fired: [string, string][] = [];
    const s = createScheduler({ getSettings: () => settings, getEnv: () => ({ fullscreen: false, inMeeting: false }), onFire: (id, m) => fired.push([id, m]) });
    s.start();
    await vi.advanceTimersByTimeAsync(2 * MIN);
    expect(fired).toEqual([["c1", "약 먹을 시간이에요"]]);
    s.stop();
  });

  it("fires after the interval, then repeats", async () => {
    const { s, fired } = setup("2026-10-20T10:00:00");
    s.start();
    await vi.advanceTimersByTimeAsync(MIN);
    expect(fired).toEqual(["water"]);
    await vi.advanceTimersByTimeAsync(MIN);
    expect(fired).toEqual(["water", "water"]);
    s.stop();
  });

  it("stays silent off-hours and fullscreen", async () => {
    const off = setup("2026-10-20T20:00:00");
    off.s.start();
    await vi.advanceTimersByTimeAsync(5 * MIN);
    expect(off.fired).toEqual([]);
    off.s.stop();

    const fs = setup("2026-10-20T10:00:00", { fullscreen: true, inMeeting: false });
    fs.s.start();
    await vi.advanceTimersByTimeAsync(3 * MIN);
    expect(fs.fired).toEqual([]);
    fs.env.fullscreen = false;
    await vi.advanceTimersByTimeAsync(MIN);
    expect(fs.fired).toEqual(["water"]);
    fs.s.stop();
  });

  it("snooze delays by 5 minutes", async () => {
    const { s, fired } = setup("2026-10-20T10:00:00");
    s.start();
    s.snooze("water");
    await vi.advanceTimersByTimeAsync(4 * MIN);
    expect(fired).toEqual([]);
    await vi.advanceTimersByTimeAsync(MIN);
    expect(fired).toEqual(["water"]);
    s.stop();
  });

  it("skipToday silences until after midnight", async () => {
    const { s, fired } = setup("2026-10-20T10:00:00");
    s.start();
    s.skipToday("water");
    await vi.advanceTimersByTimeAsync(10 * 60 * MIN);
    expect(fired).toEqual([]);
    s.stop();
  });

  it("quiet mode holds reminders for as long as it is on, then resumes", async () => {
    const { s, fired } = setup("2026-10-20T10:00:00");
    s.start();
    s.setQuiet(true);
    await vi.advanceTimersByTimeAsync(90 * MIN); // 11:30, still before lunch
    expect(fired).toEqual([]);
    expect(await s.canNotify("greeting")).toBe(false);
    s.setQuiet(false);
    await vi.advanceTimersByTimeAsync(2 * MIN);
    expect(fired.length).toBeGreaterThan(0);
    s.stop();
  });
});
