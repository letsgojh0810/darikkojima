import { LazyStore } from "@tauri-apps/plugin-store";
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

export async function saveSettings(s: Settings): Promise<void> {
  await store.set("settings", s);
  await store.save();
}
