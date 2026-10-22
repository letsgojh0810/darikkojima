import { describe, expect, it } from "vitest";
import { settingsText } from "../messages/ko";
import { checkIcs } from "./IcsSource";

const now = new Date("2026-10-20T09:00:00Z");
const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:a
DTSTART:20261021T010000Z
DTEND:20261021T020000Z
SUMMARY:주간회의
END:VEVENT
END:VCALENDAR`;
const reply = (body: string, status = 200) => async () => new Response(body, { status });
const reason = async (get: () => Promise<Response>) => {
  const r = await checkIcs("https://x", get, now);
  return r.ok ? null : r.reason;
};

describe("checkIcs", () => {
  it("lists the next week's events when the feed is good", async () => {
    const r = await checkIcs("https://x", reply(ics), now);
    expect(r.ok && r.events.map((e) => e.title)).toEqual(["주간회의"]);
  });

  it("names the cause of each failure", async () => {
    const c = settingsText.check;
    expect(await reason(() => Promise.reject(new Error("dns")))).toBe(c.offline);
    expect(await reason(reply("", 403))).toBe(c.denied);
    expect(await reason(reply("", 404))).toBe(c.gone);
    expect(await reason(reply("", 500))).toBe(c.status(500));
    expect(await reason(reply("<html>login</html>"))).toBe(settingsText.notFeed);
    expect(await reason(reply("BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:garbage"))).toBe(c.broken);
  });
});
