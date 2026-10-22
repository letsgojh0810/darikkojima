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
  | { type: "quip" };

export const sendDebug = (cmd: DebugCmd) => emit("debug", cmd);
