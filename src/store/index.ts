import { emit } from "@tauri-apps/api/event";
import { LazyStore } from "@tauri-apps/plugin-store";
import { normalizeProgress, type Progress } from "../pet/progress";
import { defaultSettings, migrateSettings, type Settings } from "./settings";

/*
 * Everything is kept twice. A file half-written when the PC lost power loads as empty, and the next save would make the
 * loss permanent; so every write goes to the main file and then to the backup, and a read falls back to the backup when
 * the main file has nothing for that key. Only one of the two can be half-written at any moment.
 */
const main = new LazyStore("settings.json");
const backup = new LazyStore("settings.backup.json");

/*
 * The last line of defence: if both files read as empty although this PC has saved before (say an antivirus held them
 * at start-up), the app would start from the defaults and its next save would overwrite the real data. So such a start
 * retries the reading for a few seconds, and if the files still look empty, nothing is written until the next start.
 */
const SAVED_MARK = "hasSavedData";
const markSaved = () => {
  try {
    localStorage.setItem(SAVED_MARK, "1");
  } catch {
    // shortcut: without localStorage the guard cannot tell a first run from a failed read, so it lets writes through
  }
};
const savedBefore = () => {
  try {
    return localStorage.getItem(SAVED_MARK) === "1";
  } catch {
    return false;
  }
};

let readable: Promise<boolean> | undefined;
async function checkReadable(): Promise<boolean> {
  for (let tries = 0; tries < 5; tries++) {
    if ((await main.length()) > 0 || (await backup.length()) > 0) {
      markSaved();
      return true;
    }
    if (!savedBefore()) return true; // a first run really is empty
    await new Promise((r) => setTimeout(r, 1000));
    await Promise.all([main.reload(), backup.reload()]).catch(() => {});
  }
  console.warn("store: saved data cannot be read right now; not writing until the next start");
  return false;
}
/** resolved once per window: whether the files could be read (or this is a genuine first run) */
const canWrite = () => (readable ??= checkReadable());

/**
 * A value found in only one of the two files is copied into the other: one saved before the backup existed fills the
 * backup, and one recovered from the backup rewrites the broken main file.
 */
async function read<T>(key: string): Promise<T | undefined> {
  const writable = await canWrite(); // also waits out the retries of a suspicious start
  const fromMain = await main.get<T>(key);
  const fromBackup = await backup.get<T>(key);
  const value = fromMain ?? fromBackup;
  if (value === undefined || !writable) return value;
  for (const [file, had] of [[main, fromMain], [backup, fromBackup]] as const) {
    if (had !== undefined) continue;
    await file.set(key, value);
    await file.save();
  }
  return value;
}

async function write(key: string, value: unknown): Promise<void> {
  if (!(await canWrite())) return;
  await main.set(key, value);
  await main.save();
  await backup.set(key, value);
  await backup.save();
  markSaved();
}

export async function loadSettings(): Promise<Settings> {
  const saved = await read<Partial<Settings>>("settings");
  // shortcut: shallow merge, except `moments`, which grows new switches (chatter); deep-merge more when another object does
  return migrateSettings({ ...defaultSettings, ...saved, moments: { ...defaultSettings.moments, ...saved?.moments } });
}

export type Pos = { x: number; y: number };

export const loadPetPos = () => read<Pos>("petPos");

export const savePetPos = (p: Pos) => write("petPos", p);

/** closeness lives apart from the settings: the app writes it, so the settings window's 저장/취소 never touches it */
export const loadProgress = async () => normalizeProgress(await read<Partial<Progress>>("progress"), new Date());

/** also tells an open settings window, so its level and wardrobe follow the pet live */
export async function saveProgress(p: Progress): Promise<void> {
  await write("progress", p);
  await emit("progress-changed", p);
}

export const saveSettings = (s: Settings) => write("settings", s);
