import { useEffect, useState } from "react";
import type { PetState } from "./types";

/** True for 150ms every 3-6s while the pet is awake; two renders per blink, no endless animation. */
export function useBlink(state: PetState) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (state !== "idle" && state !== "walk") return;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      t = setTimeout(() => {
        setBlink(true);
        t = setTimeout(() => {
          setBlink(false);
          next();
        }, 150);
      }, 3000 + Math.random() * 3000);
    };
    next();
    return () => clearTimeout(t);
  }, [state]);

  return blink;
}
