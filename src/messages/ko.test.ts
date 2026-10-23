import { describe, expect, it } from "vitest";
import { petColors, petIds } from "../pet/anim/pets";
import {
  calendarMessage,
  colorNames,
  defaultLunchMenus,
  greetingMessage,
  leaveMessage,
  levelUpMessage,
  lunchReply,
  momentMessage,
  quipsFor,
  reminderLine,
  nextWeek,
  scheduleMessage,
  sharedLines,
  weekMessage,
} from "./ko";

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

describe("asking the pet", () => {
  const first = () => 0;
  it("says how long until leaving, in hours and minutes", () => {
    expect(leaveMessage({ kind: "working", min: 135 }, first)).toBe("퇴근까지 2시간 15분 남았어요");
    expect(leaveMessage({ kind: "working", min: 120 }, first)).toBe("퇴근까지 2시간 남았어요");
    expect(leaveMessage({ kind: "working", min: 7 }, first)).toBe("퇴근까지 7분 남았어요");
    expect(leaveMessage({ kind: "after" }, first)).not.toContain("{d}");
  });

  it("next week runs Monday to Monday, from any day of this week (weekends included)", () => {
    const day = (d: number) => new Date(`2026-10-${d}T15:00:00`); // 19 = Mon … 25 = Sun
    for (const d of [19, 21, 24, 25]) {
      const [from, to] = nextWeek(day(d));
      expect([from.getDate(), from.getDay(), from.getHours(), to.getDate()]).toEqual([26, 1, 0, 2]);
    }
  });

  it("lists next week's events a line each, with the rest counted", () => {
    const at = (d: number, h: number) => new Date(2026, 9, d, h, 30);
    expect(weekMessage([], true, () => 0)).toContain("다음 주");
    expect(weekMessage([], false)).toContain("일정 탭");
    expect(weekMessage([{ title: "주간회의", start: at(26, 10) }], true)).toBe("다음 주 일정은 1개예요\n월 10시 30분 주간회의");
    const many = Array.from({ length: 8 }, (_, i) => ({ title: `회의${i}`, start: at(26 + (i % 5), 9 + i) }));
    const msg = weekMessage(many, true);
    expect(msg.split("\n")).toHaveLength(1 + 6 + 1);
    expect(msg).toContain("외 2개");
  });

  it("names the next event of the day, or says there is none / no calendar", () => {
    const at = (hhmm: string) => new Date(`2026-10-20T${hhmm}:00`);
    expect(scheduleMessage([{ title: "주간회의", start: at("10:30") }, { title: "1:1", start: at("15:00") }], true)).toBe(
      "오늘 남은 일정은 2개예요. 다음은 10시 30분 '주간회의'",
    );
    expect(scheduleMessage([{ title: "주간회의", start: at("10:00") }], true)).toContain("하나");
    expect(scheduleMessage([], true, first)).toContain("남은 일정이 없어요");
    expect(scheduleMessage([], false)).toContain("일정 탭");
  });
});

describe("closeness tone", () => {
  it("adds tone lines by level and record lines from Lv.7", () => {
    expect(quipsFor("cat", 1)).toContain("아직 어색하지만 잘 부탁해요");
    expect(quipsFor("cat", 5)).toContain("저도 이제 이 정도는 아는 짬이에요");
    expect(quipsFor("cat", 5)).not.toContain("아직 어색하지만 잘 부탁해요");
    const totals = { done: { water: 23 }, streak: 3 };
    expect(quipsFor("cat", 6, totals).some((q) => q.includes("23번"))).toBe(false);
    expect(quipsFor("cat", 7, totals)).toContain("물 마시기, 지금까지 23번 챙겼어요");
    expect(quipsFor("cat", 7, totals)).toContain("3일째 잘 챙기고 있어요");
  });

  it("says reminders in the closer tone only from Lv.5, and only some of the time", () => {
    expect(reminderLine("water", 4, () => 0)).toBeUndefined();
    expect(reminderLine("water", 5, () => 0)).toBeDefined();
    expect(reminderLine("water", 9, () => 0.9)).toBeUndefined();
    expect(reminderLine("custom-uuid", 9, () => 0)).toBeUndefined();
  });

  it("keeps the time-of-day greeting when no level is given", () => {
    expect(greetingMessage(new Date("2026-10-20T09:00:00"), undefined, () => 0)).toBe("좋은 아침이에요");
    expect(greetingMessage(new Date("2026-10-20T09:00:00"), undefined, () => 0, 9)).toBe("왔군요! 오늘도 같이 버텨 봐요");
  });
});

describe("levelUpMessage", () => {
  it("puts the level and the name in, never leaving a placeholder", () => {
    for (let i = 0; i < 5; i++) {
      const line = levelUpMessage(7, "나비", () => i / 5);
      expect(line).toContain("Lv.7");
      expect(line).not.toMatch(/\{n\}|\{name\}/);
    }
    expect(levelUpMessage(3, "나비", () => 0.45)).toContain("나비");
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

  it("every pet has at least four named coat colours", () => {
    for (const id of petIds) {
      expect(petColors[id].length).toBeGreaterThanOrEqual(4);
      for (const c of petColors[id]) expect(colorNames[c.id]).toBeTruthy();
    }
  });

  it("every selectable pet has lines of its own", () => {
    for (const id of petIds) expect(quipsFor(id).length).toBeGreaterThan(quipsFor("none").length);
  });
});
