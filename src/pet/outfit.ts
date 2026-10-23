/**
 * Clothes: three slots (earphones count as head); nine items open at each of Lv.1, 3, 5 and 10, and one per secret (pet/titles.ts).
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
  // Lv.1: the office basics, to dress up from day one
  { id: "beanie", slot: "head", level: 1 },
  { id: "headphones", slot: "head", level: 1 },
  { id: "headphonesblack", slot: "head", level: 1 },
  { id: "glasses", slot: "face", level: 1 },
  { id: "cheeks", slot: "face", level: 1 },
  { id: "bandage", slot: "face", level: 1 },
  { id: "badge", slot: "neck", level: 1 },
  { id: "tie", slot: "neck", level: 1 },
  { id: "bell", slot: "neck", level: 1 },
  // Lv.3: everyday bits
  { id: "flower", slot: "head", level: 3 },
  { id: "cap", slot: "head", level: 3 },
  { id: "airpods", slot: "head", level: 3 },
  { id: "hornrim", slot: "face", level: 3 },
  { id: "freckles", slot: "face", level: 3 },
  { id: "mask", slot: "face", level: 3 },
  { id: "bandana", slot: "neck", level: 3 },
  { id: "whistle", slot: "neck", level: 3 },
  { id: "bow", slot: "neck", level: 3 },
  // Lv.5: a trendier commute
  { id: "partyhat", slot: "head", level: 5 },
  { id: "sunglasses", slot: "face", level: 5 },
  { id: "shades", slot: "face", level: 5 },
  { id: "eyepatch", slot: "face", level: 5 },
  { id: "handbag", slot: "neck", level: 5 },
  { id: "crossbag", slot: "neck", level: 5 },
  { id: "bowtie", slot: "neck", level: 5 },
  { id: "camera", slot: "neck", level: 5 },
  { id: "scarf", slot: "neck", level: 5 },
  // Lv.10: the showy ones
  { id: "crown", slot: "head", level: 10 },
  { id: "wizard", slot: "head", level: 10 },
  { id: "stars", slot: "face", level: 10 },
  { id: "heart", slot: "face", level: 10 },
  { id: "monocle", slot: "face", level: 10 },
  { id: "mustache", slot: "face", level: 10 },
  { id: "medal", slot: "neck", level: 10 },
  { id: "pearls", slot: "neck", level: 10 },
  { id: "chain", slot: "neck", level: 10 },
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
  /** just under the nose, where a mustache sits and a mask is centred */
  mouth: Pt;
  /** where over-ear headphone cups sit, when that is not `ears` (the dog's floppy ears hang below where they grow) */
  cups?: [Pt, Pt];
  neck: Pt;
  size: number;
}

export const ANCHORS: Record<string, Anchors> = {
  cat: { top: { x: 60, y: 21 }, eyes: [{ x: 50, y: 42 }, { x: 70, y: 42 }], ears: [{ x: 33, y: 40 }, { x: 87, y: 40 }], mouth: { x: 60, y: 52 }, neck: { x: 60, y: 66 }, size: 1 },
  rabbit: { top: { x: 60, y: 27 }, eyes: [{ x: 50, y: 46 }, { x: 70, y: 46 }], ears: [{ x: 35, y: 50 }, { x: 85, y: 50 }], mouth: { x: 60, y: 55 }, neck: { x: 60, y: 68 }, size: 0.95 },
  robot: { top: { x: 60, y: 22 }, eyes: [{ x: 50, y: 41 }, { x: 70, y: 41 }], ears: [{ x: 28, y: 42 }, { x: 92, y: 42 }], mouth: { x: 60, y: 51 }, neck: { x: 60, y: 65 }, size: 1.12 },
};

/** each dog breed has a head of its own shape (pet/anim/Dog.tsx), so its clothes sit on anchors of its own */
export const DOG_ANCHORS: Record<string, Anchors> = {
  corgi: { top: { x: 60, y: 22 }, eyes: [{ x: 50, y: 41 }, { x: 70, y: 41 }], ears: [{ x: 32.5, y: 47 }, { x: 87.5, y: 47 }], mouth: { x: 60, y: 53 }, neck: { x: 60, y: 66 }, size: 1 },
  bichon: { top: { x: 60, y: 12 }, eyes: [{ x: 50, y: 40 }, { x: 70, y: 40 }], ears: [{ x: 27, y: 45 }, { x: 93, y: 45 }], mouth: { x: 60, y: 53 }, neck: { x: 60, y: 69 }, size: 1 },
  poodle: { top: { x: 60, y: 16 }, eyes: [{ x: 50, y: 40 }, { x: 70, y: 40 }], ears: [{ x: 31, y: 44 }, { x: 89, y: 44 }], mouth: { x: 60, y: 53 }, neck: { x: 60, y: 66 }, size: 1 },
  pom: { top: { x: 60, y: 21 }, eyes: [{ x: 50, y: 42 }, { x: 70, y: 42 }], ears: [{ x: 33, y: 46 }, { x: 87, y: 46 }], mouth: { x: 60, y: 51.5 }, neck: { x: 60, y: 67 }, size: 1 },
};
