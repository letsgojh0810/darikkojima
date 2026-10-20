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

  it("quiet mode holds reminders, then resumes", async () => {
    const { s, fired } = setup("2026-10-20T10:00:00");
    s.start();
    s.quietFor(60);
    await vi.advanceTimersByTimeAsync(59 * MIN);
    expect(fired).toEqual([]);
    await vi.advanceTimersByTimeAsync(2 * MIN);
    expect(fired.length).toBeGreaterThan(0);
    s.stop();
  });
});
