import { useEffect, useState } from "react";
import type { PetState } from "./anim/types";

const SLEEP_AFTER_MS = 5 * 60_000;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * idle <-> walk on a random timer, sleep after 5 quiet minutes, nag while a bubble is up.
 * `activity` is any number that changes on user interaction; it wakes the pet.
 */
export function usePetState(bubbleOpen: boolean, activity: number): PetState {
  const [cycle, setCycle] = useState<"idle" | "walk">("idle");
  const [asleep, setAsleep] = useState(false);

  useEffect(() => {
    setAsleep(false);
    if (bubbleOpen) return;
    const t = setTimeout(() => setAsleep(true), SLEEP_AFTER_MS);
    return () => clearTimeout(t);
  }, [bubbleOpen, activity]);

  useEffect(() => {
    if (bubbleOpen || asleep) return;
    const t = setTimeout(() => setCycle((c) => (c === "idle" ? "walk" : "idle")), cycle === "walk" ? 4000 : rand(15_000, 40_000));
    return () => clearTimeout(t);
  }, [bubbleOpen, asleep, cycle]);

  return bubbleOpen ? "nag" : asleep ? "sleep" : cycle;
}
