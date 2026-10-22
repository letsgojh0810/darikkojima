import { emit } from "@tauri-apps/api/event";
import type { MomentId } from "./greetings/moments";
import type { PetState } from "./pet/anim/types";

/** Commands the dev-only "테스트" settings tab sends to the pet window. Nothing here exists in a production build. */
export type DebugCmd =
  | { type: "greeting"; event?: { title: string; start: number } }
  | { type: "lunch" }
  | { type: "moment"; id: Exclude<MomentId, "lunch">; friday?: boolean }
  | { type: "reminder"; id: string }
  | { type: "calendar"; title?: string; min?: number }
  | { type: "pile" }
  | { type: "clear" }
  | { type: "ttl"; ms: number | null }
  | { type: "state"; state: PetState | null }
  | { type: "quip" }
  | { type: "exp"; amount: number }
  /** jumps straight to the first point of a level (Lv.1 = 0 points, i.e. a reset) */
  | { type: "level"; level: number }
  | { type: "levelUp" }
  /** shows another pet without saving, to look at each one's moods and moves */
  | { type: "pet"; id: string }
  /** null = follow Windows again */
  | { type: "theme"; mode: "light" | "dark" | null };

/** Forces (or releases) light/dark in the current window; the settings tab also sends it to the pet window. */
export function applyTheme(mode: "light" | "dark" | null) {
  if (mode) document.documentElement.dataset.theme = mode;
  else delete document.documentElement.dataset.theme;
}

export const sendDebug = (cmd: DebugCmd) => emit("debug", cmd);
