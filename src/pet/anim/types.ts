import type { FC } from "react";

export type PetState = "idle" | "walk" | "nag" | "sleep" | "hover" | "click";

/** The only thing PetView knows about the character; swap this for a Rive component later. */
export type PetAnimation = FC<{ state: PetState }>;
