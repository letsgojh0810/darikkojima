/**
 * Clothes: three slots (earphones count as head); about five items open at each of Lv.1, 5 and 10, and one per secret (pet/titles.ts).
 * Names live in messages/ko.ts; drawings in anim/Outfit.tsx.
 */
export type Slot = "head" | "face" | "neck";
export type Outfit = Partial<Record<Slot, string>>;

export interface Item {
  id: string;
  slot: Slot;
  level?: number;
  title?: string;
}

export const SLOTS: Slot[] = ["head", "face", "neck"];

export const ITEMS: Item[] = [
  { id: "beanie", slot: "head", level: 1 },
  { id: "flower", slot: "head", level: 1 },
  { id: "glasses", slot: "face", level: 1 },
  { id: "tie", slot: "neck", level: 1 },
  { id: "bandana", slot: "neck", level: 1 },
  { id: "badge", slot: "neck", level: 1 },
  { id: "cap", slot: "head", level: 5 },
  { id: "headphones", slot: "head", level: 5 },
  { id: "sunglasses", slot: "face", level: 5 },
  { id: "airpods", slot: "head", level: 5 },
  { id: "scarf", slot: "neck", level: 5 },
  { id: "bow", slot: "neck", level: 5 },
  { id: "crown", slot: "head", level: 10 },
  { id: "wizard", slot: "head", level: 10 },
  { id: "heart", slot: "face", level: 10 },
  { id: "monocle", slot: "face", level: 10 },
  { id: "medal", slot: "neck", level: 10 },
  { id: "drop", slot: "head", title: "water10" },
  { id: "goggles", slot: "face", title: "water100" },
  { id: "book", slot: "head", title: "posture50" },
  { id: "halo", slot: "head", title: "legs100" },
  { id: "sweatband", slot: "head", title: "stretch50" },
  { id: "lei", slot: "neck", title: "streak7" },
  { id: "laurel", slot: "head", title: "streak30" },
  { id: "chef", slot: "head", title: "roulette" },
  { id: "nightcap", slot: "head", title: "goodbye20" },
  { id: "locket", slot: "neck", title: "petter" },
  { id: "headset", slot: "head", title: "meetings" },
];

export const isUnlocked = (it: Item, level: number, titles: string[]) =>
  (it.level === undefined || level >= it.level) && (it.title === undefined || titles.includes(it.title));

export const unlockedIds = (level: number, titles: string[]) => ITEMS.filter((it) => isUnlocked(it, level, titles)).map((it) => it.id);

/** what is actually drawn: a piece that is no longer unlocked (e.g. after a reset) is left off */
export function wearable(outfit: Outfit | undefined, level: number, titles: string[]): Outfit {
  const open = new Set(unlockedIds(level, titles));
  const out: Outfit = {};
  for (const slot of SLOTS) {
    const id = outfit?.[slot];
    if (id && open.has(id)) out[slot] = id;
  }
  return out;
}

type Pt = { x: number; y: number };

/**
 * Where clothes go on each pet, in that pet's SVG coordinates: the top of the head, the two eyes, the two sides of the
 * head where earphones sit, the neck (the bottom of the chin: neck pieces start there and hang down); `size` scales the
 * pieces to the head.
 */
export interface Anchors {
  top: Pt;
  eyes: [Pt, Pt];
  ears: [Pt, Pt];
  neck: Pt;
  size: number;
}

export const ANCHORS: Record<string, Anchors> = {
  cat: { top: { x: 60, y: 21 }, eyes: [{ x: 50, y: 42 }, { x: 70, y: 42 }], ears: [{ x: 33, y: 40 }, { x: 87, y: 40 }], neck: { x: 60, y: 66 }, size: 1 },
  dog: { top: { x: 60, y: 20 }, eyes: [{ x: 50, y: 40 }, { x: 70, y: 40 }], ears: [{ x: 33, y: 50 }, { x: 87, y: 50 }], neck: { x: 60, y: 66 }, size: 1 },
  rabbit: { top: { x: 60, y: 27 }, eyes: [{ x: 50, y: 46 }, { x: 70, y: 46 }], ears: [{ x: 35, y: 50 }, { x: 85, y: 50 }], neck: { x: 60, y: 68 }, size: 0.95 },
  robot: { top: { x: 60, y: 22 }, eyes: [{ x: 50, y: 41 }, { x: 70, y: 41 }], ears: [{ x: 28, y: 42 }, { x: 92, y: 42 }], neck: { x: 60, y: 65 }, size: 1.12 },
};
