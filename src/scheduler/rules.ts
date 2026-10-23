import type { Settings } from "../store/settings";

export interface RuleContext {
  now: Date;
  settings: Settings;
  /**
   * calendar alerts are not held back by a running meeting, posture reminders are;
   * greetings (app start, lunch, countdown) also ignore work hours and lunch, they only respect quiet mode and fullscreen
   */
  kind: "reminder" | "calendar" | "greeting";
  fullscreen: boolean;
  inMeeting: boolean;
  /** no keyboard or mouse input for a while (or the screen is locked): nobody is there to be told anything */
  away?: boolean;
  /** epoch ms until which "조용히 하기" holds everything back (Infinity while the switch is on) */
  quietUntil: number | null;
}

export type BlockReason = "quiet" | "away" | "fullscreen" | "off-hours" | "lunch" | "meeting";

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const within = (t: number, start: string, end: string) => t >= minutes(start) && t < minutes(end);

export function blockReason(c: RuleContext): BlockReason | null {
  if (c.quietUntil !== null && c.now.getTime() < c.quietUntil) return "quiet";
  if (c.away) return "away";
  if (c.fullscreen) return "fullscreen";
  if (c.kind === "greeting") return null;
  const { workHours, lunch } = c.settings;
  const t = c.now.getHours() * 60 + c.now.getMinutes();
  if (!workHours.days.includes(c.now.getDay()) || !within(t, workHours.start, workHours.end)) return "off-hours";
  if (within(t, lunch.start, lunch.end)) return "lunch";
  if (c.kind === "reminder" && c.inMeeting) return "meeting";
  return null;
}
