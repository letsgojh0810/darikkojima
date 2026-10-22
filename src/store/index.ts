import { LazyStore } from "@tauri-apps/plugin-store";
import { emptyProgress, type Progress } from "../pet/progress";
import { defaultSettings, type Settings } from "./settings";

const store = new LazyStore("settings.json");

export async function loadSettings(): Promise<Settings> {
  const saved = await store.get<Partial<Settings>>("settings");
  // shortcut: shallow merge, so a new nested default is missed for old files; deep-merge when the schema first changes
  return { ...defaultSettings, ...saved };
}

export type Pos = { x: number; y: number };

export const loadPetPos = () => store.get<Pos>("petPos");

export async function savePetPos(p: Pos): Promise<void> {
  await store.set("petPos", p);
  await store.save();
}

/** closeness lives apart from the settings: the app writes it, so the settings window's 저장/취소 never touches it */
export const loadProgress = async () => (await store.get<Progress>("progress")) ?? emptyProgress(new Date());

export async function saveProgress(p: Progress): Promise<void> {
  await store.set("progress", p);
  await store.save();
}

export async function saveSettings(s: Settings): Promise<void> {
  await store.set("settings", s);
  await store.save();
}
