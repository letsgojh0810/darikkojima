import { describe, expect, it } from "vitest";
import { normalizeIcsUrl } from "./url";

describe("normalizeIcsUrl", () => {
  it("keeps http(s) and trims", () => {
    expect(normalizeIcsUrl("  https://example.com/a.ics ")).toBe("https://example.com/a.ics");
    expect(normalizeIcsUrl("http://example.com/a.ics")).toBe("http://example.com/a.ics");
  });
  it("turns webcal into https", () => {
    expect(normalizeIcsUrl("webcal://example.com/a.ics")).toBe("https://example.com/a.ics");
  });
  it("rejects other schemes and garbage", () => {
    expect(normalizeIcsUrl("file:///c:/a.ics")).toBeNull();
    expect(normalizeIcsUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeIcsUrl("not a url")).toBeNull();
    expect(normalizeIcsUrl("")).toBeNull();
  });
});
