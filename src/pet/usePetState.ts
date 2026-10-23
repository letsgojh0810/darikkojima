import { useEffect, useState } from "react";
import type { PetState } from "./anim/types";

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * idle <-> walk on a random timer, asleep while nobody is at the desk (`away`: no keyboard or mouse input for a while),
 * nag while a bubble is up.
 */
export function usePetState(bubbleOpen: boolean, away: boolean): PetState {
  const [cycle, setCycle] = useState<"idle" | "walk">("idle");

  useEffect(() => {
    if (bubbleOpen || away) return;
    const t = setTimeout(() => setCycle((c) => (c === "idle" ? "walk" : "idle")), cycle === "walk" ? 4000 : rand(15_000, 40_000));
    return () => clearTimeout(t);
  }, [bubbleOpen, away, cycle]);

  return bubbleOpen ? "nag" : away ? "sleep" : cycle;
}
