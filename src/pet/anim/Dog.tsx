import type { ReactNode } from "react";
import { DOG_ANCHORS } from "../outfit";
import { NeckLayer, OutfitLayer, SleepNeckLayer } from "./Outfit";
import { FrontFace, Gloss, INK, LINE_W, Pads, Paw, SLEEP_HEAD, headDy, outline } from "./FrontFace";
import { Sprite } from "./Sprite";
import type { PetAnimation } from "./types";

/**
 * The dog comes as four breeds (picked like a coat colour); the first is the default. Names live in messages/ko.ts
 * colorNames, the outfit anchors of each in pet/outfit.ts DOG_ANCHORS.
 */
export const DOG_COLORS = [
  { id: "corgi", FUR: "#E9A15C", PATCH: "#D3863F", EAR: "#E9A15C", MUZZLE: "#FFF5E8" },
  { id: "bichon", FUR: "#FBF8F3", PATCH: "#EFE7DC", EAR: "#F4EDE3", MUZZLE: "#FFFFFF" },
  { id: "poodle", FUR: "#A8714A", PATCH: "#8C5B39", EAR: "#8E5C3A", MUZZLE: "#C08B62" },
  { id: "pom", FUR: "#F3AE63", PATCH: "#DE9549", EAR: "#F3AE63", MUZZLE: "#FFEBD3" },
];
type Coat = (typeof DOG_COLORS)[number];
type Blob = [number, number, number];

/** a fluffy shape: outline circles under, fill circles over, so the puffs read as one outlined cloud */
function Cloud({ blobs, fill, edge }: { blobs: Blob[]; fill: string; edge: string }) {
  return (
    <>
      {blobs.map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r + LINE_W} fill={edge} />)}
      {blobs.map(([x, y, r], i) => <circle key={`f${i}`} cx={x} cy={y} r={r} fill={fill} />)}
    </>
  );
}
/** puffs of radius r round an ellipse */
const ring = (cx: number, cy: number, rx: number, ry: number, n: number, r: number): Blob[] =>
  Array.from({ length: n }, (_, i) => [cx + rx * Math.cos((i / n) * 2 * Math.PI), cy + ry * Math.sin((i / n) * 2 * Math.PI), r]);

const nose = (
  <>
    <path d="M54.5 47 Q60 44.2 65.5 47 Q65.5 51 60 53 Q54.5 51 54.5 47 Z" fill={INK} />
    <ellipse cx="58" cy="46.8" rx="1.8" ry="0.9" fill="#fff" opacity="0.75" />
  </>
);
const wMouth = <path d="M60 53 v2 M60 55 q-3.5 3.5 -7 1 M60 55 q3.5 3.5 7 1" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />;

interface Breed {
  /** under the chin and under anything worn at the neck (a ruff); moves with the head */
  ruff?: (c: Coat) => ReactNode;
  /** behind the head: ears that stand up behind it */
  back?: (c: Coat) => ReactNode;
  /** the head itself with its markings and nose, without the eyes and mouth */
  head: (c: Coat) => ReactNode;
  /** the tail while sitting (it wags while dragged) and asleep (lying on the floor at the rump) */
  tail: (c: Coat) => ReactNode;
  sleepTail: (c: Coat) => ReactNode;
  eyeY: number;
  mouthY: number;
  mouth: ReactNode;
}

const BREEDS: Record<string, Breed> = {
  // Welsh corgi: big upright ears, a white blaze from the forehead widening into the muzzle, a stub of a tail
  corgi: {
    back: (c) => {
      const ears = ["M33 36 Q27 10 37 5 Q46 3 55 23 Z", "M87 36 Q93 10 83 5 Q74 3 65 23 Z"];
      return (
        <>
          {ears.map((d) => <path key={d} d={d} fill={c.FUR} stroke={outline(c.FUR)} strokeWidth={LINE_W + 2.2} strokeLinejoin="round" />)}
          {ears.map((d) => <path key={d} d={d} fill={c.FUR} stroke={c.FUR} strokeWidth="2.2" strokeLinejoin="round" />)}
          <path d="M37 30 Q33.5 13 39 9.5 Q44 8.5 50.5 22 Z M83 30 Q86.5 13 81 9.5 Q76 8.5 69.5 22 Z" fill="#FFB8C0" opacity="0.7" />
        </>
      );
    },
    head: (c) => (
      <>
        <ellipse cx="60" cy="44" rx="28" ry="22" fill={c.FUR} stroke={outline(c.FUR)} strokeWidth={LINE_W} />
        <Gloss x={48} y={29} rx={8} ry={3.6} />
        <path d="M57 22 Q60 20.5 63 22 L65 40 Q76 45 75 55 Q72 65 60 65.5 Q48 65 45 55 Q44 45 55 40 Z" fill={c.MUZZLE} />
        {nose}
      </>
    ),
    tail: (c) => <Cloud blobs={[[89, 84, 5]]} fill={c.FUR} edge={outline(c.FUR)} />,
    sleepTail: (c) => <Cloud blobs={[[103, 84, 5]]} fill={c.FUR} edge={outline(c.FUR)} />,
    eyeY: 41,
    mouthY: 57,
    mouth: wMouth,
  },
  // bichon frisé: the round "bichon cut", one big chunky pompom of a head with the ears lost in it
  bichon: {
    head: (c) => (
      <>
        <Cloud blobs={[...ring(60, 39, 27.5, 24.5, 15, 8), [60, 40, 27]]} fill={c.FUR} edge={outline(c.FUR)} />
        <Gloss x={46} y={21} rx={10} ry={4} />
        {nose}
      </>
    ),
    tail: (c) => <Cloud blobs={[[96, 63, 6.5], [101, 58, 5.5], [100, 67, 5]]} fill={c.FUR} edge={outline(c.FUR)} />,
    sleepTail: (c) => <Cloud blobs={[[103, 80, 6], [107, 85, 5]]} fill={c.FUR} edge={outline(c.FUR)} />,
    eyeY: 40,
    mouthY: 57,
    mouth: wMouth,
  },
  // toy poodle: a round curly cloud of a head, long curly ears, a lighter muzzle, a pompom tail
  poodle: {
    head: (c) => (
      <>
        <Cloud blobs={[[33, 44, 6], [31, 51, 6.2], [33, 58, 5.5], [87, 44, 6], [89, 51, 6.2], [87, 58, 5.5]]} fill={c.EAR} edge={outline(c.EAR)} />
        <Cloud blobs={[...ring(60, 41, 21, 18, 14, 7), [60, 41, 20]]} fill={c.FUR} edge={outline(c.FUR)} />
        <Gloss x={50} y={27} rx={8} ry={3.6} />
        <ellipse cx="60" cy="52" rx="10" ry="7.5" fill={c.MUZZLE} opacity="0.85" />
        {nose}
      </>
    ),
    tail: (c) => <Cloud blobs={[[99, 62, 6], [104, 57, 5], [101, 67, 4.5]]} fill={c.FUR} edge={outline(c.FUR)} />,
    sleepTail: (c) => <Cloud blobs={[[103, 80, 6], [107, 85, 5]]} fill={c.FUR} edge={outline(c.FUR)} />,
    eyeY: 40,
    mouthY: 57,
    mouth: wMouth,
  },
  // Pomeranian: a fluffy ball, small pointed ears poking out of the top, a cream muzzle and a cream ruff under the chin
  pom: {
    ruff: (c) => <Cloud blobs={[[60, 66, 8], [50, 65, 6.5], [70, 65, 6.5], [43, 61, 5], [77, 61, 5]]} fill={c.MUZZLE} edge={outline(c.FUR)} />,
    back: (c) => {
      const line = { stroke: outline(c.FUR), strokeWidth: LINE_W };
      return (
        <>
          {["M41 27 Q38.5 9 45.5 6.5 Q51.5 8 55 22 Z", "M79 27 Q81.5 9 74.5 6.5 Q68.5 8 65 22 Z"].map((d) => (
            <path key={d} d={d} fill={c.FUR} {...line} strokeLinejoin="round" />
          ))}
          <path d="M43.8 23 Q42.8 12.5 46 10.5 Q49.2 12 51.2 21.5 Z M76.2 23 Q77.2 12.5 74 10.5 Q70.8 12 68.8 21.5 Z" fill="#FFB8C0" opacity="0.7" />
        </>
      );
    },
    head: (c) => (
      <>
        <Cloud blobs={[...ring(60, 43, 23, 19.5, 18, 5), [60, 43, 22]]} fill={c.FUR} edge={outline(c.FUR)} />
        <Gloss x={49} y={29} rx={8} ry={3.4} />
        <ellipse cx="60" cy="53" rx="8.5" ry="6.2" fill={c.MUZZLE} />
        <g transform="translate(60 49) scale(0.8) translate(-60 -49)">{nose}</g>
      </>
    ),
    tail: (c) => <Cloud blobs={[[95, 57, 6.5], [100, 62, 6], [97, 68, 5.5], [91, 71, 5]]} fill={c.FUR} edge={outline(c.FUR)} />,
    sleepTail: (c) => <Cloud blobs={[[101, 79, 6.5], [106, 84, 6], [102, 88, 5]]} fill={c.FUR} edge={outline(c.FUR)} />,
    eyeY: 42,
    mouthY: 56,
    mouth: <path d="M60 52 v1.8 M60 53.8 q-3 3 -6 0.8 M60 53.8 q3 3 6 0.8" fill="none" stroke={INK} strokeWidth="1.7" strokeLinecap="round" />,
  },
};

// A dog, sitting, of the picked breed.
export const DogAnim: PetAnimation = ({ state, muted, outfit, color }) => {
  const coat = DOG_COLORS.find((c) => c.id === color) ?? DOG_COLORS[0];
  const { FUR, PATCH, MUZZLE } = coat;
  const breed = BREEDS[coat.id];
  const a = DOG_ANCHORS[coat.id];
  const line = { stroke: outline(FUR), strokeWidth: LINE_W };
  const asleep = state === "sleep";
  const headAt = asleep ? SLEEP_HEAD : `translate(0 ${headDy(state)})`;
  const ruff = breed.ruff && <g transform={headAt}>{breed.ruff(coat)}</g>;
  return (
    <Sprite state={state} pet="dog">
      <ellipse cx="60" cy="94" rx={asleep ? 44 : 36} ry="4" fill="rgba(0,0,0,0.12)" />
      {asleep ? (
        <>
          {/* asleep: lying down, chin on the front paws, the tail on the floor at the rump */}
          {breed.sleepTail(coat)}
          <ellipse cx="71" cy="80" rx="33" ry="14" fill={FUR} {...line} />
        </>
      ) : (
        <>
          <g className="tail">{breed.tail(coat)}</g>
          <ellipse cx="60" cy="76" rx="30" ry="18" fill={FUR} {...line} />
          {/* the head's shadow on the body, and a fluffy chest */}
          <ellipse cx="60" cy="62" rx="22" ry="6" fill={PATCH} opacity="0.45" />
          <path d="M45 78 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 Q76 90 60 93 Q44 90 45 78 Z" fill={MUZZLE} />
          <Paw x={46} fill={MUZZLE} edge={line.stroke} pads />
          <Paw x={74} b fill={MUZZLE} edge={line.stroke} pads />
          {ruff}
          <NeckLayer outfit={outfit} a={a} />
        </>
      )}
      {asleep && ruff}
      {asleep && <SleepNeckLayer outfit={outfit} a={a} transform={SLEEP_HEAD} />}
      <g transform={headAt}>
        {breed.back?.(coat)}
        {breed.head(coat)}
        <FrontFace state={state} muted={muted} noBlush={outfit?.face === "cheeks"} eyeY={breed.eyeY} mouthY={breed.mouthY} neutralMouth={breed.mouth} />
        <OutfitLayer outfit={outfit} a={a} />
      </g>
      {asleep && (
        <>
          <ellipse cx="46" cy="90" rx="9" ry="4.6" fill={MUZZLE} {...line} />
          <ellipse cx="62" cy="91" rx="9" ry="4.6" fill={MUZZLE} {...line} />
          <Pads x={46} y={90} />
          <Pads x={62} y={91} />
        </>
      )}
    </Sprite>
  );
};
