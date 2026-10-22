import type { ReactNode } from "react";
import type { Anchors, Outfit } from "../outfit";

const INK = "#191F28";
const GOLD = "#FFD66B";
const GOLD_EDGE = "#F5B200";

/** a few small shapes laid along an arc (laurel leaves, lei flowers) */
const along = (n: number, at: (i: number) => ReactNode) => Array.from({ length: n }, (_, i) => at(i));

/** head pieces, drawn with (0, 0) at the top of the head; they sit about 6 units down onto it */
const HEAD: Record<string, ReactNode> = {
  beanie: (
    <>
      <path d="M-21 6 C-21 -15 21 -15 21 6 Z" fill="#3182F6" />
      <rect x="-22" y="1" width="44" height="7" rx="3.5" fill="#1B64DA" />
      <circle cy="-14" r="4.5" fill="#fff" />
    </>
  ),
  flower: (
    <g transform="translate(13 2)">
      {along(5, (i) => (
        <circle key={i} cx={4 * Math.sin((i * 2 * Math.PI) / 5)} cy={-4 * Math.cos((i * 2 * Math.PI) / 5)} r="3" fill="#FF8FA0" />
      ))}
      <circle r="2.3" fill={GOLD} />
    </g>
  ),
  cap: (
    <>
      <path d="M-19 6 C-19 -13 19 -13 19 6 Z" fill="#F04452" />
      <path d="M8 2 Q24 1 28 7 L8 7 Z" fill="#D93645" />
      <circle cy="-7" r="2" fill="#D93645" />
    </>
  ),
  headphones: (
    <>
      <path d="M-21 10 C-21 -16 21 -16 21 10" fill="none" stroke="#333D4B" strokeWidth="3.5" />
      <rect x="-26" y="5" width="9" height="14" rx="4" fill="#4E5968" />
      <rect x="17" y="5" width="9" height="14" rx="4" fill="#4E5968" />
    </>
  ),
  crown: (
    <>
      <path d="M-15 6 L-15 -9 L-7 -2 L0 -13 L7 -2 L15 -9 L15 6 Z" fill={GOLD} stroke={GOLD_EDGE} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cy="0" r="2.2" fill="#F04452" />
    </>
  ),
  wizard: (
    <>
      <path d="M-17 5 L3 -32 L17 5 Z" fill="#6B4EFF" />
      <ellipse cy="5" rx="25" ry="4.5" fill="#5A3EE0" />
      <circle cx="-2" cy="-8" r="2" fill={GOLD} />
      <circle cx="5" cy="-17" r="1.5" fill={GOLD} />
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
      <rect x="-15" y="-4" width="30" height="9" rx="1.5" fill="#3182F6" />
      <rect x="-13" y="-2" width="27" height="4.5" fill="#F2F4F6" />
    </>
  ),
  halo: <ellipse cy="-9" rx="14" ry="4" fill="none" stroke={GOLD} strokeWidth="3" />,
  sweatband: (
    <>
      <rect x="-21" y="4" width="42" height="7" rx="3.5" fill="#00C471" />
      <rect x="-21" y="6.5" width="42" height="2" fill="#fff" />
    </>
  ),
  laurel: (
    <>
      {along(4, (i) => (
        <g key={i}>
          <ellipse rx="4.5" ry="2" fill="#00A661" transform={`translate(${-19 + i * 4} ${4 - i * 4}) rotate(${-70 + i * 22})`} />
          <ellipse rx="4.5" ry="2" fill="#00A661" transform={`translate(${19 - i * 4} ${4 - i * 4}) rotate(${70 - i * 22})`} />
        </g>
      ))}
    </>
  ),
  chef: (
    <>
      <circle cx="-9" cy="-9" r="8" fill="#fff" stroke="#D1D6DB" />
      <circle cx="9" cy="-9" r="8" fill="#fff" stroke="#D1D6DB" />
      <circle cy="-14" r="9" fill="#fff" stroke="#D1D6DB" />
      <rect x="-15" y="-6" width="30" height="12" rx="2" fill="#fff" stroke="#D1D6DB" />
    </>
  ),
  nightcap: (
    <>
      <path d="M-21 6 C-19 -12 10 -18 25 -4 C15 -5 13 -1 21 6 Z" fill="#7B8CDE" />
      <rect x="-22" y="2" width="44" height="6" rx="3" fill="#fff" />
      <circle cx="25" cy="-4" r="3.5" fill="#fff" />
    </>
  ),
};

/** neck pieces, (0, 0) where the head meets the body */
const NECK: Record<string, ReactNode> = {
  tie: (
    <>
      <path d="M-4 -2 h8 l-2 5 h-4 Z" fill="#F04452" />
      <path d="M-2 3 h4 l3 12 l-5 4 l-5 -4 Z" fill="#F04452" />
    </>
  ),
  bandana: (
    <>
      <path d="M-17 -3 L17 -3 L0 13 Z" fill="#FF9F1C" />
      <circle cx="-6" cy="1" r="1.3" fill="#fff" />
      <circle cx="5" cy="1" r="1.3" fill="#fff" />
      <circle cy="6" r="1.3" fill="#fff" />
    </>
  ),
  scarf: (
    <>
      <rect x="-22" y="-4" width="44" height="9" rx="4.5" fill="#F04452" />
      <rect x="9" y="2" width="8" height="14" rx="3" fill="#D93645" />
    </>
  ),
  bow: (
    <>
      <path d="M0 0 L-11 -7 L-11 7 Z M0 0 L11 -7 L11 7 Z" fill="#FF8FA0" stroke="#FF8FA0" strokeWidth="2" strokeLinejoin="round" />
      <circle r="3.5" fill="#FF6F86" />
    </>
  ),
  medal: (
    <>
      <path d="M-7 -3 L0 9 L7 -3" fill="none" stroke="#3182F6" strokeWidth="3" />
      <circle cy="12" r="5.5" fill={GOLD} stroke={GOLD_EDGE} strokeWidth="1.2" />
    </>
  ),
  lei: (
    <>
      {along(7, (i) => (
        <circle key={i} cx={-18 + i * 6} cy={(-18 + i * 6) ** 2 / -40 + 6} r="3.4" fill={["#FF8FA0", GOLD, "#FFB58F"][i % 3]} />
      ))}
    </>
  ),
  locket: (
    <>
      <path d="M-14 -3 Q0 10 14 -3" fill="none" stroke="#B0B8C1" strokeWidth="1.2" />
      <path d="M0 13 C-6 8 -5 4 -2.5 4 C-1 4 0 5.5 0 5.5 C0 5.5 1 4 2.5 4 C5 4 6 8 0 13 Z" fill="#F04452" />
    </>
  ),
  badge: (
    <>
      <path d="M-12 -3 L-3 10 M12 -3 L3 10" stroke="#3182F6" strokeWidth="2" />
      <rect x="-6" y="9" width="12" height="15" rx="2" fill="#fff" stroke="#B0B8C1" />
      <rect x="-3" y="12" width="6" height="5" rx="1" fill="#B0B8C1" />
    </>
  ),
};

/** heart outline around an eye, r being the half-width */
const heartAt = (x: number, y: number, r: number) =>
  `M${x} ${y + r} C${x - 1.7 * r} ${y}, ${x - r} ${y - 1.2 * r}, ${x} ${y - 0.35 * r} C${x + r} ${y - 1.2 * r}, ${x + 1.7 * r} ${y}, ${x} ${y + r} Z`;

/** face pieces need the eyes: one lens per eye, a bridge between two, or a temple arm for the turtle's single eye */
function Face({ id, a }: { id: string; a: Anchors }) {
  const r = 6.5 * a.size;
  const w = 1.8 * a.size;
  const [e1, e2] = a.eyes;
  if (id === "monocle") {
    const e = e2 ?? e1;
    return (
      <>
        <circle cx={e.x} cy={e.y} r={r} fill="rgba(255,255,255,0.25)" stroke={GOLD_EDGE} strokeWidth={w} />
        <path d={`M${e.x} ${e.y + r} q${3 * a.size} ${8 * a.size} ${-3 * a.size} ${15 * a.size}`} fill="none" stroke={GOLD_EDGE} strokeWidth={w * 0.6} />
      </>
    );
  }
  const goggles = id === "goggles";
  const rim = goggles ? "#1B64DA" : INK;
  return (
    <>
      {goggles && (
        <path
          d={e2 ? `M${e1.x - r} ${e1.y} h${-9 * a.size} M${e2.x + r} ${e2.y} h${9 * a.size}` : `M${e1.x - r} ${e1.y} h${-9 * a.size}`}
          stroke={rim}
          strokeWidth={w * 1.6}
          strokeLinecap="round"
        />
      )}
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
      {e2 ? (
        <path d={`M${e1.x + r} ${e1.y} Q${(e1.x + e2.x) / 2} ${e1.y - 3} ${e2.x - r} ${e2.y}`} fill="none" stroke={rim} strokeWidth={w} />
      ) : (
        !goggles && <path d={`M${e1.x - r} ${e1.y} h${-8 * a.size}`} stroke={rim} strokeWidth={w} strokeLinecap="round" />
      )}
    </>
  );
}

/** Draws what the pet wears; place it last inside the head group so it moves with the head and lies on top. */
export function OutfitLayer({ outfit, a }: { outfit?: Outfit; a: Anchors }) {
  if (!outfit) return null;
  const at = (p: { x: number; y: number }) => `translate(${p.x} ${p.y}) scale(${a.size})`;
  return (
    <>
      {outfit.neck && NECK[outfit.neck] && <g transform={at(a.neck)}>{NECK[outfit.neck]}</g>}
      {outfit.face && <Face id={outfit.face} a={a} />}
      {outfit.head && HEAD[outfit.head] && <g transform={at(a.top)}>{HEAD[outfit.head]}</g>}
    </>
  );
}
