import { describe, expect, it } from "vitest";
import { petIds } from "../pet/anim/pets";
import { calendarMessage, defaultLunchMenus, greetingMessage, lunchReply, momentMessage, quipsFor, sharedLines } from "./ko";

describe("shared lines", () => {
  it("no line said by every pet names a species", () => {
    const bad = sharedLines().filter((q) => /멍!|왈왈|야옹|냥!|등껍질|거북(?!목)|토끼|고양이|강아지/.test(q));
    expect(bad).toEqual([]);
  });

  it("has plenty of variety and no duplicates inside a pool", () => {
    const all = sharedLines();
    expect(all.length).toBeGreaterThan(350);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("lunchReply", () => {
  const first = () => 0;
  it("names the menu inside the line for the first two spins", () => {
    for (const spin of [1, 2]) {
      const r = lunchReply("칼국수", spin, first);
      expect(r.line).toContain("칼국수");
      expect(r.showMenu).toBe(false);
    }
  });

  it("teases from the third spin, with the menu on its own line, and escalates", () => {
    const lines = [3, 4, 5, 6, 7, 12].map((n) => lunchReply("칼국수", n, first));
    expect(lines.every((r) => r.showMenu)).toBe(true);
    expect(lines[0].line).toBe("이럴 거면 그냥 드시고 싶은 거 드세요...");
    expect(new Set(lines.map((r) => r.line)).size).toBe(4); // tiers: 3rd, 4th, 5th-6th, 7th and beyond
  });

  it("has 40 default menus without duplicates", () => {
    expect(defaultLunchMenus).toHaveLength(40);
    expect(new Set(defaultLunchMenus).size).toBe(40);
  });
});

describe("calendarMessage", () => {
  it("fills in the title and the minutes, and shortens a long title", () => {
    expect(calendarMessage("주간회의", 10, () => 0)).toBe("'주간회의' 일정이 10분 뒤에 있어요");
    expect(calendarMessage("가".repeat(30), 5, () => 0)).toContain(`${"가".repeat(20)}…`);
  });
});

const first = () => 0; // always the first line of a pool

describe("greetingMessage", () => {
  const at = (day: number, hhmm: string) => new Date(`2026-10-${day}T${hhmm}:00`); // 20 = Tue, 19 = Mon, 23 = Fri, 24 = Sat

  it("changes with the time of day", () => {
    expect(greetingMessage(at(20, "09:00"), undefined, first)).toBe("좋은 아침이에요");
    expect(greetingMessage(at(20, "12:00"), undefined, first)).toBe("점심시간이 가까워요");
    expect(greetingMessage(at(20, "15:00"), undefined, first)).toBe("오후도 같이 버텨요");
    expect(greetingMessage(at(20, "19:00"), undefined, first)).toBe("아직 일하고 있어요? 고생이 많아요");
    expect(greetingMessage(at(20, "23:30"), undefined, first)).toBe("이 시간엔 쉬는 게 좋아요");
  });

  it("has its own lines for Monday, Friday and the weekend, but the night comes first", () => {
    expect(greetingMessage(at(19, "09:00"), undefined, first)).toContain("월요일");
    expect(greetingMessage(at(23, "09:00"), undefined, first)).toContain("금요일");
    expect(greetingMessage(at(24, "09:00"), undefined, first)).toContain("주말");
    expect(greetingMessage(at(19, "02:00"), undefined, first)).toBe("이 시간엔 쉬는 게 좋아요");
  });

  it("names the first event of the day with a short title", () => {
    const e = { title: "주간회의", start: at(20, "10:30") };
    expect(greetingMessage(at(20, "09:00"), e, first)).toBe("좋은 아침이에요. 오늘 첫 일정은 10시 30분 '주간회의'예요");
    expect(greetingMessage(at(20, "09:00"), { title: "가".repeat(30), start: at(20, "14:00") }, first)).toContain(`${"가".repeat(20)}…`);
  });
});

describe("momentMessage", () => {
  it("uses the Friday goodbye only on Fridays", () => {
    expect(momentMessage("goodbye", true, first)).toContain("주말");
    expect(momentMessage("goodbye", false, first)).not.toContain("주말");
  });
});

describe("click quips", () => {
  it("shared lines never name a species", () => {
    // an unknown pet id gets the shared lines only
    expect(quipsFor("none").filter((q) => /거북|토끼|고양이|강아지|멍|야옹|등껍질/.test(q))).toEqual([]);
  });

  it("every selectable pet has lines of its own", () => {
    for (const id of petIds) expect(quipsFor(id).length).toBeGreaterThan(quipsFor("none").length);
  });
});
