import { describe, expect, it } from "vitest";
import { bringOnScreen, visibleFraction, type Rect } from "./edges";

const left: Rect = { x: 0, y: 0, w: 1920, h: 1040 };
const right: Rect = { x: 1920, y: 0, w: 1920, h: 1040 };
const pet = (x: number, y: number): Rect => ({ x, y, w: 100, h: 100 });

describe("visibleFraction", () => {
  it("is 1 in the middle of a screen and drops as the pet slides off an edge", () => {
    expect(visibleFraction(pet(500, 500), [left])).toBe(1);
    expect(visibleFraction(pet(-50, 500), [left])).toBe(0.5);
    expect(visibleFraction(pet(-50, -50), [left])).toBe(0.25);
    expect(visibleFraction(pet(5000, 500), [left])).toBe(0);
  });

  it("counts both monitors, so straddling the line between them is fully visible", () => {
    expect(visibleFraction(pet(1870, 500), [left, right])).toBe(1);
    expect(visibleFraction(pet(1870, 500), [left])).toBe(0.5);
  });

  it("treats the space under the taskbar as off screen (work areas end above it)", () => {
    expect(visibleFraction(pet(500, 1000), [left])).toBe(0.4);
  });
});

describe("bringOnScreen", () => {
  it("pulls a pet hanging off an edge back inside, with a margin", () => {
    expect(bringOnScreen(pet(-60, 500), [left], 8)).toEqual({ x: 8, y: 500 });
    expect(bringOnScreen(pet(1880, 1000), [left], 8)).toEqual({ x: 1812, y: 932 });
  });

  it("uses the monitor the pet overlaps most", () => {
    expect(bringOnScreen(pet(3800, -40), [left, right], 8)).toEqual({ x: 3732, y: 8 });
  });

  it("goes to the nearest monitor when the pet is on none", () => {
    expect(bringOnScreen(pet(5000, 500), [left, right], 8)).toEqual({ x: 3732, y: 500 });
  });

  it("leaves a pet that is already inside where it is", () => {
    expect(bringOnScreen(pet(500, 500), [left], 8)).toEqual({ x: 500, y: 500 });
  });
});
