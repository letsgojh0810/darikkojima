import type { PetAnimation } from "./types";
import "./CssSpriteAnim.css";

// Placeholder character: an emoji driven by CSS keyframes (transform only, compositor-cheap).
export const CssSpriteAnim: PetAnimation = ({ state }) => (
  <div className={`sprite sprite-${state}`}>
    <span>{state === "sleep" ? "😴" : "🐢"}</span>
    {state === "sleep" && <i className="zzz">z</i>}
  </div>
);
