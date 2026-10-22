import type { ReactNode } from "react";
import type { PetState } from "./types";
import "./Sprite.css";

/** Shared wrapper: the state class drives the motion (per pet while dragged), the SVG inside only draws the face. */
export function Sprite({ state, pet, children }: { state: PetState; pet: string; children: ReactNode }) {
  return (
    <div className={`sprite sprite-${state} pet-${pet}`}>
      <svg width="120" height="100" viewBox="0 0 120 100">
        {children}
      </svg>
      {state === "sleep" && <i className="zzz">z</i>}
    </div>
  );
}
