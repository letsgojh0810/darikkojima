import { defaultLunchMenus } from "../messages/ko";
import type { Outfit } from "../pet/outfit";
import type { ThemeMode } from "../theme";

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
  /** now and then during work hours: "심심하네요, 바쁘신가요?" */
  chatter: boolean;
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
  /** per pet id; an empty name falls back to the species name */
  petProfiles: Record<string, { name: string; outfit?: Outfit; color?: string }>;
  /** what the small tag under the pet shows */
  petLabel: "both" | "name" | "level" | "off";
  /** light/dark of both windows; "system" follows Windows */
  theme: ThemeMode;
  /** accent colour id from src/theme.ts ACCENTS */
  accent: string;
  reminders: Record<ReminderId, { enabled: boolean; intervalMin: number }>;
  custom: CustomReminder[];
  moments: Moments;
  lunchMenus: string[];
  /** "HH:MM"; days use Date#getDay (0=Sun) */
  workHours: { start: string; end: string; days: number[] };
  lunch: { start: string; end: string };
  icsUrls: string[];
  /** names given to calendars ("내 캘린더", "팀 캘린더"), by URL; a missing one shows the URL's host */
  icsNames: Record<string, string>;
  calendarLeadMin: number;
  /** when the app starts, list what is left on today's calendar */
  calendarDigest: boolean;
}

/** coat colours that were renamed: the dog's colours became breeds (0.2.6), the tabby cat became the calico (0.2.5) */
const RENAMED_COLORS: Record<string, Record<string, string>> = {
  dog: { golden: "corgi", jindo: "bichon", choco: "poodle", black: "pom" },
  cat: { tabby: "calico" },
};

/**
 * The turtle became the AI bot (0.2.1): whoever had it picked gets the bot, keeping the name and clothes given to it.
 * A renamed coat colour moves to its new name.
 */
export function migrateSettings(s: Settings): Settings {
  const { turtle, ...profiles } = s.petProfiles;
  let changed = false;
  for (const [pet, renames] of Object.entries(RENAMED_COLORS)) {
    const to = renames[profiles[pet]?.color ?? ""];
    if (to) {
      profiles[pet] = { ...profiles[pet], color: to };
      changed = true;
    }
  }
  if (s.pet !== "turtle" && !turtle && !changed) return s;
  if (turtle && !profiles.robot) profiles.robot = { name: turtle.name, outfit: turtle.outfit };
  return { ...s, pet: s.pet === "turtle" ? "robot" : s.pet, petProfiles: profiles };
}

/** changes part of one pet's profile and keeps the rest (renaming must not undress it) */
export const withProfile = (s: Settings, pet: string, patch: Partial<Settings["petProfiles"][string]>): Settings => ({
  ...s,
  petProfiles: { ...s.petProfiles, [pet]: { ...s.petProfiles[pet], name: s.petProfiles[pet]?.name ?? "", ...patch } },
});

/** what the settings window sends to the pet window while the pet tab is being edited, before 저장 */
export type PetPreview = Pick<Settings, "pet" | "petScale" | "petProfiles" | "petLabel" | "theme" | "accent">;

export const defaultSettings: Settings = {
  pet: "cat",
  petScale: 1,
  petProfiles: {},
  petLabel: "both",
  theme: "system",
  accent: "coral",
  reminders: {
    legs: { enabled: true, intervalMin: 30 },
    posture: { enabled: true, intervalMin: 45 },
    water: { enabled: true, intervalMin: 60 },
    stretch: { enabled: true, intervalMin: 90 },
  },
  custom: [],
  moments: { greeting: true, lunch: true, countdown: true, goodbye: true, chatter: true },
  lunchMenus: defaultLunchMenus,
  workHours: { start: "09:00", end: "18:00", days: [1, 2, 3, 4, 5] },
  lunch: { start: "12:00", end: "13:00" },
  icsUrls: [],
  icsNames: {},
  calendarLeadMin: 30,
  calendarDigest: true,
};
