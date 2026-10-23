import { useId, type ReactNode } from "react";
import type { Anchors, Outfit } from "../outfit";
import { outline } from "./FrontFace";

const INK = "#191F28";
const GOLD = "#FFD66B";
const GOLD_EDGE = "#F5B200";

/** a few small shapes laid out by index (lei flowers, flower petals) */
const along = (n: number, at: (i: number) => ReactNode) => Array.from({ length: n }, (_, i) => at(i));

/** heart outline centred on (x, y), r being the half-width */
const heartAt = (x: number, y: number, r: number) =>
  `M${x} ${y + r} C${x - 1.7 * r} ${y}, ${x - r} ${y - 1.2 * r}, ${x} ${y - 0.35 * r} C${x + r} ${y - 1.2 * r}, ${x + 1.7 * r} ${y}, ${x} ${y + r} Z`;

/** five-pointed star centred on (x, y), r the outer radius */
const starAt = (x: number, y: number, r: number) =>
  `M${along(10, (i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const d = i % 2 ? r * 0.45 : r;
    return `${(x + d * Math.cos(a)).toFixed(2)} ${(y + d * Math.sin(a)).toFixed(2)}`;
  }).join(" L")} Z`;

/** a thin outline in a darker shade of the piece's own colour, like the pets' (FrontFace outline) */
const edge = (fill: string, width = 1) => ({ fill, stroke: outline(fill), strokeWidth: width, strokeLinejoin: "round" as const });

/** a stem from the side of the head up to the front of its top, with paired leaves; the right branch is this one mirrored */
function laurelBranch() {
  const q = (t: number, a: number, b: number, c: number) => (1 - t) ** 2 * a + 2 * t * (1 - t) * b + t ** 2 * c;
  const at = (t: number) => [q(t, -22, -22, -4), q(t, 10, -8, -9)];
  return (
    <>
      <path d="M-22 10 Q-22 -8 -4 -9" fill="none" stroke="#00A661" strokeWidth="1.6" strokeLinecap="round" />
      {along(5, (i) => {
        const t = 0.1 + i * 0.2;
        const [x, y] = at(t);
        const [x2, y2] = at(t + 0.01);
        const deg = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse cx="4.2" rx="4.4" ry="2.1" fill="#03B26C" transform={`rotate(${deg - 40})`} />
            <ellipse cx="4.2" rx="4.4" ry="2.1" fill="#00A661" transform={`rotate(${deg + 40})`} />
          </g>
        );
      })}
    </>
  );
}

/** hats that cover the crown of the head: the robot's antenna hides under these */
export const HATS = new Set(["beanie", "cap", "chef", "wizard", "nightcap"]);

/** head pieces, drawn with (0, 0) at the top of the head; they sit about 6 units down onto it */
const HEAD: Record<string, ReactNode> = {
  // a knit hat: ribbed crown, a folded cuff and a fluffy pompom (outline circles under, fill circles over)
  beanie: (
    <>
      <path d="M-21 7 C-22 -15.5 22 -15.5 21 7 Z" {...edge("#4A8FF7", 1)} />
      <path d="M-14 6 C-15 -2 -12 -7 -7.5 -9.5 M-7 6 C-7.5 -2 -5 -8 -2.5 -10.6 M0 6 V-11 M7 6 C7.5 -2 5 -8 2.5 -10.6 M14 6 C15 -2 12 -7 7.5 -9.5" fill="none" stroke="#2D6FD9" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
      <path d="M-16 -2 C-15 -7 -11 -10 -7 -11" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      {[["#9AA6B5", 1.6], ["#fff", 0]].map(([c, grow]) => (
        <g key={c} fill={c as string}>
          <circle cy="-14.5" r={4.6 + Number(grow) / 2} />
          {along(9, (i) => (
            <circle key={i} cx={4.4 * Math.sin((i * 2 * Math.PI) / 9)} cy={-14.5 - 4.4 * Math.cos((i * 2 * Math.PI) / 9)} r={1.9 + Number(grow) / 2} />
          ))}
        </g>
      ))}
      <circle cx="-1.8" cy="-16.4" r="1.8" fill="#EEF1F5" />
      <rect x="-23" y="1.5" width="46" height="9" rx="4.5" {...edge("#2F74E0", 1)} />
      <path d={along(14, (i) => `M${-19.5 + i * 3} 3.6 v4.8`).join(" ")} stroke="#1D5BC0" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
    </>
  ),
  flower: (
    <g transform="translate(13 3)">
      <ellipse cx="-5" cy="3" rx="4" ry="2" fill="#03B26C" transform="rotate(-30 -5 3)" />
      {along(5, (i) => (
        <circle key={i} cx={4 * Math.sin((i * 2 * Math.PI) / 5)} cy={-4 * Math.cos((i * 2 * Math.PI) / 5)} r="3.2" fill="#FF8FA0" />
      ))}
      <circle r="2.4" fill={GOLD} />
    </g>
  ),
  // a baseball cap seen from the front: six-panel crown, a badge, and the brim curving down toward us
  cap: (
    <>
      <path d="M-20.5 6 C-21 -15 21 -15 20.5 6 Z" {...edge("#F04452", 1)} />
      <path d="M0 -10.6 V5 M-10.5 -7.5 C-13 -3 -13.5 1 -13.5 5.5 M10.5 -7.5 C13 -3 13.5 1 13.5 5.5" fill="none" stroke="#C92C3A" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      <path d="M-15.5 -1 C-14.5 -6 -11 -9 -6.5 -10.2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <circle cx="-7" cy="-4" r="0.7" fill="#C92C3A" />
      <circle cx="7" cy="-4" r="0.7" fill="#C92C3A" />
      <ellipse cy="-10.8" rx="2.6" ry="1.5" {...edge("#E03444", 0.8)} />
      <rect x="-5.5" y="-5.5" width="11" height="7.5" rx="2.4" {...edge("#fff", 0.8)} />
      <path d={starAt(0, -1.7, 2.7)} fill="#F04452" />
      {/* the brim points at us: thick in the middle, thinning to nothing where it meets the sides of the crown */}
      <path d="M-21 4.5 Q0 8.5 21 4.5 Q19 10.5 0 13 Q-19 10.5 -21 4.5 Z" {...edge("#D93645", 1)} />
      <path d="M-15 7.6 Q0 12 15 7.6" fill="none" stroke="#fff" strokeWidth="0.8" strokeDasharray="1.6 1.4" opacity="0.6" />
    </>
  ),
  crown: (
    <>
      <path d="M-17 7 L-18 -9 L-8.5 -1 L0 -14 L8.5 -1 L18 -9 L17 7 Z" fill={GOLD} stroke={GOLD_EDGE} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="-17" y="1" width="34" height="6" rx="1.5" fill={GOLD_EDGE} />
      <circle cx="-9" cy="4" r="1.6" fill="#3182F6" />
      <circle cy="4" r="2" fill="#F04452" />
      <circle cx="9" cy="4" r="1.6" fill="#03B26C" />
      <circle cx="-18" cy="-10" r="2" fill={GOLD} />
      <circle cy="-15" r="2" fill={GOLD} />
      <circle cx="18" cy="-10" r="2" fill={GOLD} />
    </>
  ),
  wizard: (
    <>
      <ellipse cy="5" rx="26" ry="5" fill="#5A3EE0" />
      <path d="M-15 4 Q-6 -16 6 -33 Q9 -36 10 -32 L16 4 Z" fill="#6B4EFF" />
      <path d="M-14 1 Q0 -3 15 1 L16 4 Q0 0 -15 4 Z" fill={GOLD} />
      <path d="M-2 -12 l1.4 3 3 .4 -2.2 2 .6 3 -2.8 -1.5 -2.8 1.5 .6 -3 -2.2 -2 3 -.4 z" fill={GOLD} />
      <circle cx="6" cy="-22" r="1.4" fill={GOLD} />
    </>
  ),
  drop: (
    <g transform="translate(-13 1)">
      <path d="M0 -7 C3 -3 4.5 0 4.5 2 A4.5 4.5 0 0 1 -4.5 2 C-4.5 0 -3 -3 0 -7 Z" fill="#4FC3F7" stroke="#1B9CE0" strokeWidth="1" />
      <circle cx="-1.5" cy="1" r="1.2" fill="#fff" />
    </g>
  ),
  book: (
    <>
      <rect x="-17" y="-1" width="34" height="8" rx="1.5" fill="#F04452" />
      <rect x="-15" y="1" width="31" height="4" fill="#fff" />
      <g transform="rotate(-6)">
        <rect x="-14" y="-9" width="29" height="8" rx="1.5" fill="#3182F6" />
        <rect x="-12" y="-7" width="26" height="4" fill="#fff" />
      </g>
    </>
  ),
  halo: (
    <>
      <ellipse cy="-13" rx="15" ry="4.5" fill="none" stroke={GOLD} strokeWidth="3.4" />
      <ellipse cy="-13.6" rx="13" ry="3.4" fill="none" stroke="#FFF4D6" strokeWidth="1" />
    </>
  ),
  sweatband: (
    <>
      <path d="M-22 10 Q0 3 22 10" fill="none" stroke="#00C471" strokeWidth="8" strokeLinecap="round" />
      <path d="M-21 10 Q0 3.5 21 10" fill="none" stroke="#fff" strokeWidth="2" />
    </>
  ),
  laurel: (
    <>
      {laurelBranch()}
      <g transform="scale(-1 1)">{laurelBranch()}</g>
    </>
  ),
  chef: (
    <>
      <circle cx="-10" cy="-10" r="8.5" fill="#fff" stroke="#D1D6DB" />
      <circle cx="10" cy="-10" r="8.5" fill="#fff" stroke="#D1D6DB" />
      <circle cy="-16" r="10" fill="#fff" stroke="#D1D6DB" />
      <rect x="-16" y="-6" width="32" height="13" rx="3" fill="#fff" stroke="#D1D6DB" />
      <path d="M-8 -4 V5 M0 -4 V5 M8 -4 V5" stroke="#E5E8EB" strokeWidth="1.2" />
    </>
  ),
  partyhat: (
    <g transform="translate(5 2) rotate(12)">
      <path d="M-12 4 L0 -24 L12 4 Z" fill="#3182F6" />
      <path d="M-8 -4 L8 -4 M-4.5 -13 L4.5 -13" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" />
      <circle cy="-25" r="3.6" fill="#FF8FA0" />
      <path d="M-13 4 Q0 9 13 4" fill="none" stroke="#1B64DA" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  ),
  nightcap: (
    <>
      <path d="M-21 6 C-19 -12 10 -18 25 -4 C15 -5 13 -1 21 6 Z" fill="#7B8CDE" />
      <circle cx="-6" cy="-6" r="1.2" fill="#fff" opacity="0.8" />
      <circle cx="7" cy="-9" r="1" fill="#fff" opacity="0.8" />
      <rect x="-22" y="2" width="44" height="7" rx="3.5" fill="#fff" />
      <circle cx="25" cy="-4" r="3.8" fill="#fff" />
    </>
  ),
};

/**
 * A necklace hanging around the neck: `n` points from x = -w to w, the ends at `top` (above the chin line, hidden
 * behind the head, see NeckLayer) and the middle `sag` lower. In SVG y grows downwards, so the middle has the largest y
 * (a U, never an upside-down arc). The chin curves up towards the sides, about 5 units at w = 17, so wider pieces
 * start higher.
 */
const hang = (n: number, w: number, sag: number, top: number) =>
  along(n, (i) => {
    const x = -w + (2 * w * i) / (n - 1);
    return [x, top + sag * (1 - (x / w) ** 2)] as const;
  }) as unknown as (readonly [number, number])[];

/**
 * neck pieces, (0, 0) at the bottom of the chin. They are drawn behind the head (NeckLayer), so whatever goes around
 * the neck starts above y = 0 and comes out from under the chin.
 */
const NECK: Record<string, ReactNode> = {
  // tie, ribbon and bow tie sit in front of the collar, so they start just below the chin and show whole
  tie: (
    <g transform="translate(0 2)">
      <path d="M-2.6 4.5 H2.6 L5.5 16 L0 21 L-5.5 16 Z" {...edge("#F04452")} />
      <path d="M-4.5 -1 H4.5 L3 4.5 H-3 Z" {...edge("#E03A48")} />
    </g>
  ),
  bandana: (
    <>
      <path d="M-19 -9 Q0 0 19 -9 L2.5 14.5 Q0 17 -2.5 14.5 Z" {...edge("#FF9F1C")} />
      <circle cx="-7" cy="3.6" r="1.3" fill="#fff" />
      <circle cx="6.5" cy="3.6" r="1.3" fill="#fff" />
      <circle cy="9" r="1.3" fill="#fff" />
    </>
  ),
  scarf: (
    <>
      {/* the end hangs in front, drawn first so the wrap lies over its top */}
      <path d="M7.5 3 H15.5 L17 19 H9 Z" {...edge("#D93645")} />
      <path d="M9.6 19 v2.6 M12.8 19 v2.6 M16 19 v2.6" stroke="#D93645" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8.3 11 H16.2" stroke="#FF8A94" strokeWidth="1.4" />
      <path d="M-21 -12 Q0 -1 21 -12 L21 -1 Q0 11 -21 -1 Z" {...edge("#F04452")} />
      <path d="M-19 -4 Q0 7 19 -4" fill="none" stroke="#FF8A94" strokeWidth="1.2" />
    </>
  ),
  bow: (
    <g transform="translate(0 5)">
      <path d="M0 3 L-11 -4 Q-13 3 -11 10 Z M0 3 L11 -4 Q13 3 11 10 Z" {...edge("#FF8FA0")} />
      <path d="M-7 1 L-3 2.5 M-7 5 L-3 3.5 M7 1 L3 2.5 M7 5 L3 3.5" stroke="#FF6F86" strokeWidth="0.9" strokeLinecap="round" />
      <circle cy="3" r="3.4" {...edge("#FF6F86")} />
    </g>
  ),
  bowtie: (
    <g transform="translate(0 4.5)">
      <path d="M0 3 L-10 -3 L-10 9 Z M0 3 L10 -3 L10 9 Z" fill={INK} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="-2.6" y="0.5" width="5.2" height="5" rx="1.5" fill="#4E5968" />
    </g>
  ),
  medal: (
    <>
      <path d="M-10 -8 L-1.5 10 M10 -8 L1.5 10" stroke="#1B64DA" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M-10 -8 L-1.5 10 M10 -8 L1.5 10" stroke="#3182F6" strokeWidth="2.6" strokeLinecap="round" />
      <circle cy="14" r="5.6" {...edge(GOLD, 1.2)} />
      <path d={starAt(0, 14, 3)} fill={GOLD_EDGE} />
    </>
  ),
  lei: (
    <>
      {hang(7, 16, 15, -9).map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3.4" {...edge(["#FF8FA0", GOLD, "#FFB58F"][i % 3], 0.9)} />
          <circle cx={x} cy={y} r="1" fill="#fff" opacity="0.85" />
        </g>
      ))}
    </>
  ),
  locket: (
    <>
      <path d="M-13 -7 Q0 20 13 -7" fill="none" stroke="#8B95A1" strokeWidth="1.3" />
      <path d="M0 15.5 C-6 10.5 -5 6.5 -2.5 6.5 C-1 6.5 0 8 0 8 C0 8 1 6.5 2.5 6.5 C5 6.5 6 10.5 0 15.5 Z" {...edge("#F04452")} />
    </>
  ),
  bell: (
    <>
      <path d="M-17 -8 Q0 12 17 -8" fill="none" stroke={outline("#F04452")} strokeWidth="5.6" strokeLinecap="round" />
      <path d="M-17 -8 Q0 12 17 -8" fill="none" stroke="#F04452" strokeWidth="4" strokeLinecap="round" />
      <circle cy="9" r="4.6" {...edge(GOLD, 1.2)} />
      <path d="M-2.4 10.5 H2.4" stroke={GOLD_EDGE} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="-1.5" cy="7.5" r="1" fill="#fff" opacity="0.8" />
    </>
  ),
  pearls: (
    <>
      {hang(9, 16, 16, -8).map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="2.3" {...edge("#FBF8F2", 0.9)} />
          <circle cx={x - 0.7} cy={y - 0.7} r="0.7" fill="#fff" />
        </g>
      ))}
      <circle cy="12" r="3" {...edge("#FBF8F2", 0.9)} />
      <circle cx="-0.9" cy="11.1" r="0.9" fill="#fff" />
    </>
  ),
  badge: (
    <>
      <path d="M-13 -8 L-3 11 M13 -8 L3 11" stroke="#3182F6" strokeWidth="2" />
      <rect x="-6" y="10" width="12" height="15" rx="2" fill="#fff" stroke="#B0B8C1" />
      <rect x="-3" y="13" width="6" height="5" rx="1" fill="#B0B8C1" />
    </>
  ),
  whistle: (
    <>
      <path d="M-11 -7 Q0 24 11 -7" fill="none" stroke="#00A661" strokeWidth="1.8" />
      <g transform="translate(0 12) rotate(-12)">
        <rect x="-8" y="-1.5" width="7" height="3.6" rx="1" {...edge("#C9CED6")} />
        <circle cx="2" cy="2" r="4.4" {...edge("#C9CED6")} />
        <rect x="-0.5" y="-2.6" width="2.6" height="1.6" rx="0.5" fill="#6B7684" />
        <circle cx="1" cy="0.8" r="1.1" fill="#fff" opacity="0.7" />
      </g>
    </>
  ),
  camera: (
    <>
      <path d="M-14 -8 Q0 27 14 -8" fill="none" stroke="#333D4B" strokeWidth="1.8" />
      <rect x="-3.2" y="8" width="6.4" height="3" rx="1" {...edge("#4E5968")} />
      <rect x="-8.5" y="10" width="17" height="11.5" rx="2.6" {...edge("#4E5968")} />
      <circle cy="15.8" r="4.3" fill="#191F28" stroke="#8B95A1" strokeWidth="1.1" />
      <circle cx="-1.2" cy="14.6" r="1.2" fill="#fff" opacity="0.8" />
      <rect x="4.6" y="11.6" width="2.4" height="1.6" rx="0.5" fill={GOLD} />
    </>
  ),
  chain: (
    <>
      {hang(13, 17, 19, -9).map(([x, y], i, all) => {
        const [nx, ny] = all[Math.min(i + 1, all.length - 1)];
        const [px, py] = all[Math.max(i - 1, 0)];
        const deg = (Math.atan2(ny - py, nx - px) * 180) / Math.PI;
        return <ellipse key={i} cx={x} cy={y} rx="2" ry={i % 2 ? 0.9 : 1.3} transform={`rotate(${deg} ${x} ${y})`} fill="none" stroke={GOLD_EDGE} strokeWidth="1.3" />;
      })}
      <circle cy="13.5" r="3.4" {...edge(GOLD, 1.1)} />
      <circle cx="-1" cy="12.5" r="1" fill="#fff" opacity="0.8" />
    </>
  ),
};

/**
 * Pieces that hang on both sides of the head (headphones, earphones), drawn in the pet's own coordinates from its
 * `ears` anchors so they fit each head's width.
 */
const SIDES: Record<string, (a: Anchors) => ReactNode> = {
  headphones: ({ ears: [l, r], top, size: k }) => (
    <>
      <path d={`M${l.x + 1} ${l.y - 4} C${l.x} ${top.y - 16 * k} ${r.x} ${top.y - 16 * k} ${r.x - 1} ${r.y - 4}`} fill="none" stroke="#333D4B" strokeWidth={4 * k} strokeLinecap="round" />
      {[l, r].map((e, i) => (
        <g key={i}>
          <rect x={e.x - 5 * k} y={e.y - 8 * k} width={10 * k} height={15 * k} rx={4.5 * k} fill="#4E5968" />
          <rect x={e.x - 2.5 * k} y={e.y - 5.5 * k} width={5 * k} height={10 * k} rx={2.5 * k} fill="#6B7684" />
        </g>
      ))}
    </>
  ),
  // white on white fur would vanish, so each bud gets a dark outline, a grey shaded side and a black speaker dot
  airpods: ({ ears, size: k }) =>
    ears.map((e, i) => (
      <g key={i} stroke="#4E5968" strokeWidth={1.1 * k}>
        <rect x={e.x - 1.8 * k} y={e.y + 1 * k} width={3.6 * k} height={10 * k} rx={1.8 * k} fill="#fff" />
        <circle cx={e.x} cy={e.y} r={4.2 * k} fill="#fff" />
        <path d={`M${e.x - 3.2 * k} ${e.y + 1.8 * k} a${4.2 * k} ${4.2 * k} 0 0 0 ${6.4 * k} 0`} fill="none" stroke="#C9CED6" strokeWidth={1.4 * k} />
        <circle cx={e.x} cy={e.y - 0.6 * k} r={1.3 * k} fill="#333D4B" stroke="none" />
        <circle cx={e.x} cy={e.y + 10.4 * k} r={0.9 * k} fill="#B0B8C1" stroke="none" />
      </g>
    )),
  headset: ({ ears: [l, r], top, size: k }) => (
    <>
      <path d={`M${l.x + 1} ${l.y - 3} C${l.x} ${top.y - 14 * k} ${r.x} ${top.y - 14 * k} ${r.x - 1} ${r.y - 3}`} fill="none" stroke="#4E5968" strokeWidth={2.4 * k} strokeLinecap="round" />
      <path d={`M${l.x} ${l.y + 3} Q${l.x + 2 * k} ${l.y + 14 * k} ${l.x + 15 * k} ${l.y + 13 * k}`} fill="none" stroke="#4E5968" strokeWidth={1.8 * k} strokeLinecap="round" />
      <circle cx={l.x + 16 * k} cy={l.y + 13 * k} r={2.4 * k} fill="#333D4B" />
      <rect x={l.x - 4 * k} y={l.y - 6 * k} width={8 * k} height={11 * k} rx={3.5 * k} fill="#333D4B" />
      <rect x={r.x - 3 * k} y={r.y - 4 * k} width={6 * k} height={8 * k} rx={3 * k} fill="#333D4B" />
    </>
  ),
};

/**
 * Face pieces that are not glasses, drawn from the face's own anchors: the cheeks are where every pet's blush is
 * (FrontFace: 10 left and right of the eyes, 8 below them), the mouth anchor sits right under the nose.
 */
// FrontFace draws the blush 9 beside and 8 below each eye whatever the pet's size, so this does not scale either
const cheekOf = (e: { x: number; y: number }, side: -1 | 1) => ({ x: e.x + side * 9, y: e.y + 8 });
const FACE_EXTRAS: Record<string, (a: Anchors) => ReactNode> = {
  // a heart a little larger than the blush, so it replaces it instead of sitting on top of it
  cheeks: ({ eyes: [l, r], size: k }) =>
    [cheekOf(l, -1), cheekOf(r, 1)].map((c, i) => <path key={i} d={heartAt(c.x, c.y, 4.6 * k)} {...edge("#FF6F86", 0.8 * k)} />),
  freckles: ({ eyes: [l, r], size: k }) =>
    [cheekOf(l, -1), cheekOf(r, 1)].flatMap((c, i) =>
      [[-2.6, -1.2], [0, 0.8], [2.6, -0.8]].map(([dx, dy], j) => <circle key={`${i}${j}`} cx={c.x + dx * k} cy={c.y + dy * k} r={0.85 * k} fill="#B07A52" />),
    ),
  // wide and deep enough to cover the whole muzzle; the top edge stays just under the eyes
  mask: ({ mouth: m, ears: [el, er], size: k }) => (
    <>
      <path d={`M${m.x - 15 * k} ${m.y - 3.5 * k} L${el.x} ${el.y} M${m.x + 15 * k} ${m.y - 3.5 * k} L${er.x} ${er.y}`} stroke="#B0B8C1" strokeWidth={0.9 * k} />
      <g transform={`translate(${m.x} ${m.y}) scale(${k})`}>
        <path d="M-15.5 -5.5 Q0 -9 15.5 -5.5 L14 6 Q0 13.5 -14 6 Z" {...edge("#F7F9FC", 0.9)} />
        <path d="M-13.5 -1.2 Q0 -4.4 13.5 -1.2 M-13 3.4 Q0 0.6 13 3.4 M-11.5 7.4 Q0 5.6 11.5 7.4" fill="none" stroke="#DCE1E7" strokeWidth="0.9" />
        <path d="M-5 -6.4 Q0 -7.6 5 -6.4" fill="none" stroke="#C5CCD5" strokeWidth="1.1" strokeLinecap="round" />
      </g>
    </>
  ),
  mustache: ({ mouth: m, size: k }) => {
    const half = "M0 0.5 C-2 -2.2 -6.5 -3 -9.5 -0.6 C-10.8 0.5 -12 0.2 -12.6 -1.2 C-12.5 2 -9.6 3.6 -6.6 2.9 C-4 2.3 -1.6 1.7 0 2 Z";
    return (
      <g transform={`translate(${m.x} ${m.y}) scale(${k})`}>
        <path d={half} {...edge("#3B2B20", 0.6)} />
        <path d={half} transform="scale(-1 1)" {...edge("#3B2B20", 0.6)} />
      </g>
    );
  },
  bandage: ({ eyes: [, r], size: k }) => (
    <g transform={`translate(${r.x + 9 * k} ${r.y + 9 * k}) rotate(-28) scale(${k})`}>
      <rect x="-7" y="-2.6" width="14" height="5.2" rx="2.6" fill="#F7D3AE" stroke="#E2B07E" strokeWidth="0.8" />
      <rect x="-2.4" y="-2.6" width="4.8" height="5.2" fill="#EEC08F" />
    </g>
  ),
  // the strap runs from the patch to both sides of the head (the ears anchors), over the forehead on the far side
  eyepatch: ({ eyes: [l, r], ears: [el, er], size: k }) => (
    <>
      <path
        d={`M${l.x - 5 * k} ${l.y - 2 * k} L${el.x + 2.5 * k} ${el.y - 4 * k} M${l.x + 5 * k} ${l.y - 3 * k} Q${(l.x + r.x) / 2} ${r.y - 12 * k} ${er.x - 2.5 * k} ${er.y - 6 * k}`}
        fill="none"
        stroke={INK}
        strokeWidth={1.4 * k}
        strokeLinecap="round"
      />
      <ellipse cx={l.x} cy={l.y} rx={6 * k} ry={5.2 * k} fill={INK} />
      <ellipse cx={l.x - 1.6 * k} cy={l.y - 1.6 * k} rx={1.8 * k} ry={1.1 * k} fill="#4E5968" />
    </>
  ),
  stars: ({ eyes, size: k }) => (
    <>
      {eyes.map((e, i) => (
        <path key={i} d={starAt(e.x, e.y, 8.5 * k)} fill="rgba(255,214,107,0.55)" stroke={GOLD_EDGE} strokeWidth={1.4 * k} strokeLinejoin="round" />
      ))}
      <path d={`M${eyes[0].x + 6 * k} ${eyes[0].y - 1 * k} Q${(eyes[0].x + eyes[1].x) / 2} ${eyes[0].y - 4 * k} ${eyes[1].x - 6 * k} ${eyes[1].y - 1 * k}`} fill="none" stroke={GOLD_EDGE} strokeWidth={1.4 * k} />
    </>
  ),
};

/** face pieces need the eyes: one lens per eye and a bridge between them */
function Face({ id, a }: { id: string; a: Anchors }) {
  const r = 6.5 * a.size;
  const w = 1.8 * a.size;
  const [e1, e2] = a.eyes;
  if (FACE_EXTRAS[id]) return <>{FACE_EXTRAS[id](a)}</>;
  if (id === "monocle")
    return (
      <>
        <circle cx={e2.x} cy={e2.y} r={r} fill="rgba(255,255,255,0.25)" stroke={GOLD_EDGE} strokeWidth={w} />
        <path d={`M${e2.x} ${e2.y + r} q${3 * a.size} ${8 * a.size} ${-3 * a.size} ${15 * a.size}`} fill="none" stroke={GOLD_EDGE} strokeWidth={w * 0.6} />
      </>
    );
  // see-through tinted lenses: the eyes still show, with a glint across each lens
  if (id === "shades")
    return (
      <>
        {a.eyes.map((e, i) => (
          <g key={i}>
            <rect x={e.x - r * 1.05} y={e.y - r * 0.78} width={r * 2.1} height={r * 1.56} rx={r * 0.55} fill="rgba(33,40,52,0.38)" stroke={INK} strokeWidth={w * 0.75} />
            {/* the glint keeps to the corner, clear of the eye */}
            <path d={`M${e.x - r * 0.8} ${e.y - r * 0.05} L${e.x - r * 0.5} ${e.y - r * 0.48}`} stroke="#fff" strokeWidth={w * 0.6} strokeLinecap="round" opacity="0.6" />
          </g>
        ))}
        <path d={`M${e1.x + r * 1.05} ${e1.y - r * 0.2} Q${(e1.x + e2.x) / 2} ${e1.y - r * 0.6} ${e2.x - r * 1.05} ${e2.y - r * 0.2}`} fill="none" stroke={INK} strokeWidth={w} />
      </>
    );
  const goggles = id === "goggles";
  const rim = goggles ? "#1B64DA" : INK;
  return (
    <>
      {/* the strap ends at the sides of the head (ears anchors), so it never sticks out past the outline */}
      {goggles && <path d={`M${e1.x - r} ${e1.y} L${a.ears[0].x + w} ${e1.y} M${e2.x + r} ${e2.y} L${a.ears[1].x - w} ${e2.y}`} stroke={rim} strokeWidth={w * 1.6} strokeLinecap="round" />}
      {a.eyes.map((e, i) =>
        id === "sunglasses" ? (
          <rect key={i} x={e.x - r} y={e.y - r * 0.75} width={r * 2} height={r * 1.5} rx={r * 0.5} fill={INK} />
        ) : id === "heart" ? (
          <path key={i} d={heartAt(e.x, e.y, r)} fill="rgba(255,111,134,0.75)" stroke="#F04452" strokeWidth={w * 0.8} />
        ) : (
          <circle
            key={i}
            cx={e.x}
            cy={e.y}
            r={r}
            fill={goggles ? "rgba(79,195,247,0.45)" : "rgba(255,255,255,0.25)"}
            stroke={rim}
            strokeWidth={goggles ? w * 1.6 : w}
          />
        ),
      )}
      <path d={`M${e1.x + r} ${e1.y} Q${(e1.x + e2.x) / 2} ${e1.y - 3} ${e2.x - r} ${e2.y}`} fill="none" stroke={rim} strokeWidth={w} />
    </>
  );
}

/**
 * What is worn at the neck. Place it between the body and the head group: the head then covers the top of each piece,
 * so chains and straps come out from under the chin instead of being stuck on top of it, and they stay with the body
 * when the head bobs.
 */
export function NeckLayer({ outfit, a }: { outfit?: Outfit; a: Anchors }) {
  const piece = outfit?.neck && NECK[outfit.neck];
  return piece ? <g transform={`translate(${a.neck.x} ${a.neck.y}) scale(${a.size})`}>{piece}</g> : null;
}

/**
 * Asleep, the chin rests on the front paws: the neck piece moves with the head (`transform`) and whatever hangs from it
 * tucks under the paws (cut off at their middle) instead of poking out below them. Place it just before the head group.
 */
export function SleepNeckLayer({ outfit, a, transform }: { outfit?: Outfit; a: Anchors; transform: string }) {
  const id = `tuck${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  if (!outfit?.neck) return null;
  return (
    <>
      <clipPath id={id}>
        <rect x="-40" y="-60" width="200" height="147" />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <g transform={transform}>
          <NeckLayer outfit={outfit} a={a} />
        </g>
      </g>
    </>
  );
}

/** Draws what is worn on the face and head; place it last inside the head group so it moves with the head and lies on top. */
export function OutfitLayer({ outfit, a }: { outfit?: Outfit; a: Anchors }) {
  if (!outfit) return null;
  const at = (p: { x: number; y: number }) => `translate(${p.x} ${p.y}) scale(${a.size})`;
  const side = (id?: string) => id && SIDES[id]?.(a);
  return (
    <>
      {outfit.face && <Face id={outfit.face} a={a} />}
      {outfit.head && HEAD[outfit.head] && <g transform={at(a.top)}>{HEAD[outfit.head]}</g>}
      {side(outfit.head)}
    </>
  );
}
