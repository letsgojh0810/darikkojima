export type ReminderId = "legs" | "posture" | "water" | "stretch";

export interface Settings {
  reminders: Record<ReminderId, { enabled: boolean; intervalMin: number }>;
  /** "HH:MM"; days use Date#getDay (0=Sun) */
  workHours: { start: string; end: string; days: number[] };
  lunch: { start: string; end: string };
  icsUrls: string[];
  calendarLeadMin: number;
}

export const defaultSettings: Settings = {
  reminders: {
    legs: { enabled: true, intervalMin: 30 },
    posture: { enabled: true, intervalMin: 45 },
    water: { enabled: true, intervalMin: 60 },
    stretch: { enabled: true, intervalMin: 90 },
  },
  workHours: { start: "09:00", end: "18:00", days: [1, 2, 3, 4, 5] },
  lunch: { start: "12:00", end: "13:00" },
  icsUrls: [],
  calendarLeadMin: 10,
};
