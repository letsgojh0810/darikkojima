import type { FC } from "react";
import type { Outfit } from "../outfit";

export type PetState = "idle" | "walk" | "nag" | "sleep" | "hover" | "click" | "drag";

/** The only thing PetView knows about the character; swap this for a Rive component later. */
export type PetAnimation = FC<{
  state: PetState;
  /** "조용히 하기" is on: an X of tape over the mouth */
  muted?: boolean;
  /** what it wears (already filtered to unlocked pieces) */
  outfit?: Outfit;
  /** coat colour id from the pet's own list (e.g. CAT_COLORS); unknown or missing = its default */
  color?: string;
}>;
