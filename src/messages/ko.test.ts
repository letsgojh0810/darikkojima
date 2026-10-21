import { describe, expect, it } from "vitest";
import { petIds } from "../pet/anim/pets";
import { quipsFor } from "./ko";

describe("click quips", () => {
  it("shared lines never name a species", () => {
    // an unknown pet id gets the shared lines only
    expect(quipsFor("none").filter((q) => /거북|토끼|고양이|강아지|멍|야옹|등껍질/.test(q))).toEqual([]);
  });

  it("every selectable pet has lines of its own", () => {
    for (const id of petIds) expect(quipsFor(id).length).toBeGreaterThan(quipsFor("none").length);
  });
});
