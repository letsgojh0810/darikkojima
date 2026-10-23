import { describe, expect, it } from "vitest";
import { ITEMS, unlockedIds, wearable } from "./outfit";
import { award, emptyProgress, LEVELS, levelOf, normalizeProgress, type Progress, type ProgressEvent } from "./progress";
import { earnedTitles, newTitles, TITLES } from "./titles";
import { itemNames, secretHints, secretMessage } from "../messages/ko";

const tue = new Date("2026-10-20T10:00:00");
const wed = new Date("2026-10-21T10:00:00");
const run = (events: ProgressEvent[], start: Progress = emptyProgress(tue), now = tue, id?: string) =>
  events.reduce((p, e) => award(p, e, now, id), start);

describe("levelOf", () => {
  it("starts at Lv.1 and climbs at the thresholds", () => {
    expect(levelOf(0)).toMatchObject({ level: 1, into: 0, need: 8, max: false });
    expect(levelOf(7).level).toBe(1);
    expect(levelOf(8)).toMatchObject({ level: 2, into: 0, need: 12 });
    expect(levelOf(25)).toMatchObject({ level: 3, into: 5, need: 15 });
  });

  it("stops at the top level", () => {
    const top = LEVELS[LEVELS.length - 1];
    expect(levelOf(top)).toMatchObject({ level: LEVELS.length, max: true, need: 0 });
    expect(levelOf(top * 5).level).toBe(LEVELS.length);
  });
});

describe("pace", () => {
  // an ordinary work day: 12 reminders answered out of ~30, the greeting, 5 pats, one roulette spin
  const ordinaryDay = (p: Progress, now: Date) =>
    run([...Array(30).fill("fired"), ...Array(12).fill("done"), "greet", ...Array(5).fill("click"), "spin"], p, now, "water");

  it("takes an ordinary user about a week (5 to 8 work days) to reach Lv.10", () => {
    let p = emptyProgress(tue);
    let days = 0;
    while (!levelOf(p.exp).max) p = ordinaryDay(p, new Date(2026, 9, 20 + days++, 10));
    expect(days).toBeGreaterThanOrEqual(5);
    expect(days).toBeLessThanOrEqual(8);
  });

  it("does not let a very keen day count for more than its caps", () => {
    const keen = run([...Array(40).fill("fired"), ...Array(40).fill("done"), "greet", ...Array(30).fill("click"), ...Array(10).fill("spin")]);
    // 15 done x2 + greet 3 + 5 clicks + 3 spins + bonus 5
    expect(keen.exp).toBe(46);
  });
});

describe("award", () => {
  it("gives points per action and counts them per reminder", () => {
    const p = run(["done", "done"], undefined, tue, "water");
    expect(p.exp).toBe(4);
    expect(p.totals.done.water).toBe(2);
    expect(run(["greet", "greet"]).exp).toBe(3);
  });

  it("caps clicks at 5 and roulette spins at 3 a day, then resets the next day", () => {
    const clicked = run(Array(9).fill("click"));
    expect(clicked.exp).toBe(5);
    expect(clicked.totals.clicks).toBe(9);
    expect(award(clicked, "click", wed).exp).toBe(6);
    const spun = run(Array(6).fill("spin"));
    expect(spun.exp).toBe(3);
    expect(spun.totals.spinDays).toBe(1);
  });

  it("adds a one-time bonus when half the day's reminders were answered, and builds a streak over a weekend", () => {
    const fri = new Date("2026-10-23T10:00:00");
    const mon = new Date("2026-10-26T10:00:00");
    const goodDay = (p: Progress, now: Date) => run(["fired", "fired", "done"], p, now);
    let p = goodDay(emptyProgress(fri), fri);
    expect(p.exp).toBe(7);
    expect(p.totals.streak).toBe(1);
    p = goodDay(p, mon);
    expect(p.totals.streak).toBe(2);
    p = goodDay(p, new Date("2026-11-02T10:00:00"));
    expect(p.totals.streak).toBe(1);
  });

  it("counts calendar alerts and goodbyes without points", () => {
    const p = run(["calendar", "goodbye", "goodbye"]);
    expect(p.exp).toBe(0);
    expect(p.totals).toMatchObject({ calendar: 1, goodbyes: 2 });
  });
});

describe("normalizeProgress", () => {
  it("upgrades a file saved before totals and titles existed", () => {
    const old = { exp: 42, day: { date: "2026-10-20", clicks: 1, spins: 0, greeted: true, fired: 3, done: 1, bonus: false } };
    const p = normalizeProgress(old as Partial<Progress>, tue);
    expect(p.exp).toBe(42);
    expect(p.totals.done).toEqual({});
    expect(p.titles).toEqual([]);
  });
});

describe("secrets and clothes", () => {
  it("finds secrets from totals and announces each only once", () => {
    let p = run(Array(10).fill("done"), undefined, tue, "water");
    expect(earnedTitles(p)).toContain("water10");
    expect(newTitles(p)).toEqual(["water10"]);
    p = { ...p, titles: [...p.titles, ...newTitles(p)] };
    expect(newTitles(p)).toEqual([]);
  });

  it("opens nine items at each of Lv.1, 3, 5 and 10, and one per secret", () => {
    expect(unlockedIds(1, [])).toHaveLength(9);
    expect(unlockedIds(1, [])).toContain("badge");
    expect(unlockedIds(2, [])).toHaveLength(9);
    expect(unlockedIds(3, [])).toHaveLength(18);
    expect(unlockedIds(5, [])).toHaveLength(27);
    expect(unlockedIds(10, [])).toHaveLength(36);
    expect(unlockedIds(10, TITLES.map((t) => t.id))).toHaveLength(ITEMS.length);
    expect(TITLES.every((t) => ITEMS.filter((it) => it.title === t.id).length === 1)).toBe(true);
    expect(wearable({ head: "crown", neck: "tie", face: "goggles" }, 3, [])).toEqual({ neck: "tie" });
  });

  it("names every item and gives every secret its own line", () => {
    for (const it of ITEMS) expect(itemNames[it.id]).toBeTruthy();
    for (const t of TITLES) expect(secretMessage(t.id)).not.toBe(secretMessage("nope"));
    for (const t of TITLES) expect(secretHints[t.id]).toBeTruthy();
  });
});
