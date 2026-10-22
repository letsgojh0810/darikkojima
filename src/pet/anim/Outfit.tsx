import type { ReactNode } from "react";
import type { Anchors, Outfit } from "../outfit";

const INK = "#191F28";
const GOLD = "#FFD66B";
const GOLD_EDGE = "#F5B200";

/** a few small shapes laid out by index (lei flowers, flower petals) */
const along = (n: number, at: (i: number) => ReactNode) => Array.from({ length: n }, (_, i) => at(i));

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

/** head pieces, drawn with (0, 0) at the top of the head; they sit about 6 units down onto it */
const HEAD: Record<string, ReactNode> = {
  beanie: (
    <>
      <path d="M-21 7 C-22 -16 22 -16 21 7 Z" fill="#3182F6" />
      <path d="M-9 -8 C-7 -2 -7 2 -7 6 M9 -8 C7 -2 7 2 7 6 M0 -11 V6" fill="none" stroke="#1B64DA" strokeWidth="1.6" opacity="0.55" />
      <rect x="-23" y="2" width="46" height="8" rx="4" fill="#1B64DA" />
      <circle cy="-14" r="5" fill="#fff" />
      <circle cx="-1.5" cy="-15.5" r="1.8" fill="#F2F4F6" />
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
  cap: (
    <>
      <path d="M-20 6 C-20 -15 20 -15 20 6 Z" fill="#F04452" />
      <path d="M0 -12 V4" stroke="#D93645" strokeWidth="1.4" />
      <circle cy="-12" r="2.2" fill="#D93645" />
      <rect x="-6" y="-6" width="12" height="7" rx="2" fill="#fff" />
      <path d="M-21 4 Q0 9 21 4 L23 9 Q0 17 -23 9 Z" fill="#D93645" />
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

/** heart outline around an eye, r being the half-width */
const heartAt = (x: number, y: number, r: number) =>
  `M${x} ${y + r} C${x - 1.7 * r} ${y}, ${x - r} ${y - 1.2 * r}, ${x} ${y - 0.35 * r} C${x + r} ${y - 1.2 * r}, ${x + 1.7 * r} ${y}, ${x} ${y + r} Z`;

/** face pieces need the eyes: one lens per eye and a bridge between them */
function Face({ id, a }: { id: string; a: Anchors }) {
  const r = 6.5 * a.size;
  const w = 1.8 * a.size;
  const [e1, e2] = a.eyes;
  if (id === "monocle")
    return (
      <>
        <circle cx={e2.x} cy={e2.y} r={r} fill="rgba(255,255,255,0.25)" stroke={GOLD_EDGE} strokeWidth={w} />
        <path d={`M${e2.x} ${e2.y + r} q${3 * a.size} ${8 * a.size} ${-3 * a.size} ${15 * a.size}`} fill="none" stroke={GOLD_EDGE} strokeWidth={w * 0.6} />
      </>
    );
  const goggles = id === "goggles";
  const rim = goggles ? "#1B64DA" : INK;
  return (
    <>
      {goggles && <path d={`M${e1.x - r} ${e1.y} h${-9 * a.size} M${e2.x + r} ${e2.y} h${9 * a.size}`} stroke={rim} strokeWidth={w * 1.6} strokeLinecap="round" />}
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

/** Draws what the pet wears; place it last inside the head group so it moves with the head and lies on top. */
export function OutfitLayer({ outfit, a }: { outfit?: Outfit; a: Anchors }) {
  if (!outfit) return null;
  const at = (p: { x: number; y: number }) => `translate(${p.x} ${p.y}) scale(${a.size})`;
  const side = (id?: string) => id && SIDES[id]?.(a);
  return (
    <>
      {outfit.neck && NECK[outfit.neck] && <g transform={at(a.neck)}>{NECK[outfit.neck]}</g>}
      {outfit.face && <Face id={outfit.face} a={a} />}
      {outfit.head && HEAD[outfit.head] && <g transform={at(a.top)}>{HEAD[outfit.head]}</g>}
      {side(outfit.head)}
    </>
  );
}
