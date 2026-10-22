import { CatAnim } from "./Cat";
import { CssSpriteAnim as TurtleAnim } from "./CssSpriteAnim";
import { DogAnim } from "./Dog";
import { RabbitAnim } from "./Rabbit";
import type { PetAnimation } from "./types";

/** Selectable characters, keyed by the id stored in `settings.pet`. Names for the UI live in messages/ko.ts. */
/** key order is the order of the picker in the settings window */
export const pets: Record<string, PetAnimation> = {
  cat: CatAnim,
  dog: DogAnim,
  rabbit: RabbitAnim,
  turtle: TurtleAnim,
};

export const petIds = Object.keys(pets);
