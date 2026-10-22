import { afterEach, describe, expect, it } from "vitest";
import { addNotice, MAX_NOTICES, nextExpiry, pruneNotices, setTtlOverride, type Notice } from "./notices";

const MIN = 60_000;
const n = (key: string, kind: Notice["kind"], at: number): Notice => ({ key, kind, message: key, at });
const add = (list: Notice[], x: Notice) => addNotice(list, x, x.at);

afterEach(() => setTtlOverride(null));

describe("addNotice", () => {
  it("refreshes a row with the same key instead of adding one", () => {
    let l = add([], n("r:water", "reminder", 0));
    l = add(l, { ...n("r:water", "reminder", 5000), message: "again" });
    expect(l).toHaveLength(1);
    expect(l[0]).toMatchObject({ message: "again", at: 5000 });
  });

  it("keeps at most three rows and drops the oldest reminder first", () => {
    let l: Notice[] = [];
    for (const [i, key] of ["a", "b", "c", "d"].entries()) l = add(l, n(key, "reminder", i * 1000));
    expect(l.map((x) => x.key)).toEqual(["b", "c", "d"]);
    expect(l).toHaveLength(MAX_NOTICES);
  });

  it("protects a calendar alert when reminders pile up", () => {
    let l = add([], n("c:meeting", "calendar", 0));
    for (const [i, key] of ["a", "b", "c"].entries()) l = add(l, n(key, "reminder", 1000 + i));
    expect(l.map((x) => x.key)).toContain("c:meeting");
    expect(l).toHaveLength(MAX_NOTICES);
  });

  it("pins calendar above greetings above reminders", () => {
    let l = add([], n("r", "reminder", 0));
    l = add(l, n("h", "hello", 1));
    l = add(l, n("c", "calendar", 2));
    expect(l.map((x) => x.key)).toEqual(["c", "h", "r"]);
  });
});

describe("lifetimes", () => {
  it("a greeting lasts 1 minute, a reminder and a calendar alert 3", () => {
    const l = [n("h", "hello", 0), n("r", "reminder", 0), n("c", "calendar", 0)];
    expect(pruneNotices(l, 59_000).map((x) => x.key)).toEqual(["h", "r", "c"]);
    expect(pruneNotices(l, MIN + 1).map((x) => x.key)).toEqual(["r", "c"]);
    expect(pruneNotices(l, 3 * MIN + 1)).toEqual([]);
  });

  it("each row runs on its own clock, and a new one does not extend the others", () => {
    let l = add([], n("r1", "reminder", 0));
    l = add(l, n("r2", "reminder", 2 * MIN));
    expect(pruneNotices(l, 3 * MIN + 1).map((x) => x.key)).toEqual(["r2"]);
  });

  it("nextExpiry is the soonest row", () => {
    expect(nextExpiry([])).toBeUndefined();
    expect(nextExpiry([n("r", "reminder", 0), n("h", "hello", 0)])).toBe(MIN);
  });

  it("the test override shortens everything", () => {
    setTtlOverride(5000);
    expect(pruneNotices([n("r", "reminder", 0)], 6000)).toEqual([]);
  });
});
