import { describe, expect, it } from "vitest";
import { isGoogleCalendarPage, normalizeIcsUrl } from "./url";

describe("isGoogleCalendarPage", () => {
  it("flags the web app address but not the private feed", () => {
    expect(isGoogleCalendarPage("https://calendar.google.com/calendar/u/0/r")).toBe(true);
    expect(isGoogleCalendarPage("https://calendar.google.com/calendar/ical/me%40gmail.com/private-abc123/basic.ics")).toBe(false);
    expect(isGoogleCalendarPage("https://example.com/a.ics")).toBe(false);
    expect(isGoogleCalendarPage("not a url")).toBe(false);
  });
});

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
