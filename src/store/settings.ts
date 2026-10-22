import { defaultLunchMenus } from "../messages/ko";

export type ReminderId = "legs" | "posture" | "water" | "stretch";

/** Things the pet says on its own at fixed times, each with its own switch. */
export interface Moments {
  /** when the app starts */
  greeting: boolean;
  /** 30 minutes before lunch */
  lunch: boolean;
  /** 3 hours and 1 hour before the end of work */
  countdown: boolean;
  /** 5 minutes before the end of work */
  goodbye: boolean;
}

/** A user-defined reminder: `text` is both its name in settings and what the pet says. */
export interface CustomReminder {
  id: string;
  text: string;
  enabled: boolean;
  intervalMin: number;
}

export interface Settings {
  /** id of the character, see pet/anim/pets.ts */
  pet: string;
  /** 0.5 to 1.5, 1 = the drawn size */
  petScale: number;
  reminders: Record<ReminderId, { enabled: boolean; intervalMin: number }>;
  custom: CustomReminder[];
  moments: Moments;
  lunchMenus: string[];
  /** "HH:MM"; days use Date#getDay (0=Sun) */
  workHours: { start: string; end: string; days: number[] };
  lunch: { start: string; end: string };
  icsUrls: string[];
  calendarLeadMin: number;
}

export const defaultSettings: Settings = {
  pet: "turtle",
  petScale: 1,
  reminders: {
    legs: { enabled: true, intervalMin: 30 },
    posture: { enabled: true, intervalMin: 45 },
    water: { enabled: true, intervalMin: 60 },
    stretch: { enabled: true, intervalMin: 90 },
  },
  custom: [],
  moments: { greeting: true, lunch: true, countdown: true, goodbye: true },
  lunchMenus: defaultLunchMenus,
  workHours: { start: "09:00", end: "18:00", days: [1, 2, 3, 4, 5] },
  lunch: { start: "12:00", end: "13:00" },
  icsUrls: [],
  calendarLeadMin: 10,
};
