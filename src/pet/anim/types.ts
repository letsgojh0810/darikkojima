import type { FC } from "react";

export type PetState = "idle" | "walk" | "nag" | "sleep" | "hover" | "click" | "drag";

/** The only thing PetView knows about the character; swap this for a Rive component later. */
export type PetAnimation = FC<{ state: PetState; /** "조용히 하기" is on: an X of tape over the mouth */ muted?: boolean }>;
