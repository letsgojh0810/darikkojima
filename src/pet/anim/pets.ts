import { CAT_COLORS, CatAnim } from "./Cat";
import { DOG_COLORS, DogAnim } from "./Dog";
import { RABBIT_COLORS, RabbitAnim } from "./Rabbit";
import { ROBOT_COLORS, RobotAnim } from "./Robot";
import type { PetAnimation } from "./types";

/** Selectable characters, keyed by the id stored in `settings.pet`. Names for the UI live in messages/ko.ts. */
/** key order is the order of the picker in the settings window */
export const pets: Record<string, PetAnimation> = {
  cat: CatAnim,
  dog: DogAnim,
  rabbit: RabbitAnim,
  robot: RobotAnim,
};

export const petIds = Object.keys(pets);

/** each pet's coat colours for the picker: id and the colour shown on its swatch */
export const petColors: Record<string, { id: string; swatch: string }[]> = {
  cat: CAT_COLORS.map((c) => ({ id: c.id, swatch: c.FUR })),
  dog: DOG_COLORS.map((c) => ({ id: c.id, swatch: c.FUR })),
  rabbit: RABBIT_COLORS.map((c) => ({ id: c.id, swatch: c.FUR })),
  robot: ROBOT_COLORS.map((c) => ({ id: c.id, swatch: c.BODY })),
};
