import { describe, expect, it } from "vitest";
import { award, emptyProgress, LEVELS, levelOf, type Progress, type ProgressEvent } from "./progress";

const tue = new Date("2026-10-20T10:00:00");
const wed = new Date("2026-10-21T10:00:00");
const run = (events: ProgressEvent[], start: Progress = emptyProgress(tue), now = tue) => events.reduce((p, e) => award(p, e, now), start);

describe("levelOf", () => {
  it("starts at Lv.1 and climbs at the thresholds", () => {
    expect(levelOf(0)).toMatchObject({ level: 1, into: 0, need: 10, max: false });
    expect(levelOf(9).level).toBe(1);
    expect(levelOf(10)).toMatchObject({ level: 2, into: 0, need: 20 });
    expect(levelOf(45)).toMatchObject({ level: 3, into: 15, need: 30 });
  });

  it("stops at the top level", () => {
    const top = LEVELS[LEVELS.length - 1];
    expect(levelOf(top)).toMatchObject({ level: LEVELS.length, max: true, need: 0 });
    expect(levelOf(top * 5).level).toBe(LEVELS.length);
  });
});

describe("award", () => {
  it("gives points per action", () => {
    expect(run(["done"]).exp).toBe(2);
    expect(run(["greet"]).exp).toBe(3);
    expect(run(["click", "spin"]).exp).toBe(2);
  });

  it("caps clicks at 5 and roulette spins at 3 a day, then resets the next day", () => {
    const clicked = run(Array(9).fill("click"));
    expect(clicked.exp).toBe(5);
    expect(run(Array(6).fill("spin")).exp).toBe(3);
    expect(award(clicked, "click", wed).exp).toBe(6);
  });

  it("greets for points once a day", () => {
    expect(run(["greet", "greet"]).exp).toBe(3);
  });

  it("adds a one-time bonus when half the day's reminders were answered", () => {
    // 4 fired, 2 done: 2*2 points + 5 bonus; a third done does not pay the bonus again
    const p = run(["fired", "fired", "fired", "fired", "done", "done"]);
    expect(p.exp).toBe(9);
    expect(award(p, "done", tue).exp).toBe(11);
  });

  it("never takes points away when a day is missed", () => {
    const p = run(["done", "done"]);
    expect(award(p, "fired", wed).exp).toBe(p.exp);
  });
});
