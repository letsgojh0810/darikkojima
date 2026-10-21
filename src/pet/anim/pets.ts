import { CatAnim } from "./Cat";
import { CssSpriteAnim as TurtleAnim } from "./CssSpriteAnim";
import { DogAnim } from "./Dog";
import { RabbitAnim } from "./Rabbit";
import type { PetAnimation } from "./types";

/** Selectable characters, keyed by the id stored in `settings.pet`. Names for the UI live in messages/ko.ts. */
export const pets: Record<string, PetAnimation> = {
  turtle: TurtleAnim,
  cat: CatAnim,
  dog: DogAnim,
  rabbit: RabbitAnim,
};

export const petIds = Object.keys(pets);
