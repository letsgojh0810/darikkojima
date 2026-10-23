import type { ReactNode } from "react";
import type { PetState } from "./types";

export const INK = "#191F28";
const CHEEK = "#FF9F8E";
const SWEAT = "#8CC5FF";
const SPARK = "#FFD66B";
const line = { fill: "none", stroke: INK, strokeWidth: 2, strokeLinecap: "round" as const };

/** Two crossed strips of tape over the mouth: the pet is keeping quiet on purpose. Centred on (x, y). */
export function MuteMask({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  const strip = (deg: number) => (
    <rect x="-11" y="-3.5" width="22" height="7" rx="3" fill="#fff" stroke="#B0B8C1" strokeWidth="1.2" transform={`rotate(${deg})`} />
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      {strip(28)}
      {strip(-28)}
    </g>
  );
}

/** Outline width and colour: a coat colour pulled 45% toward a warm dark brown, so every coat gets a matching edge. */
export const LINE_W = 1.6;
export function outline(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number, to: number) => Math.round(c + (to - c) * 0.45);
  const rgb = (mix(n >> 16, 0x3b) << 16) | (mix((n >> 8) & 255, 0x2b) << 8) | mix(n & 255, 0x20);
  return `#${rgb.toString(16).padStart(6, "0")}`;
}

/** Pink toe beans and the main pad, peeking from the front of a paw centred on (x, y). */
export const Pads = ({ x, y }: { x: number; y: number }) => (
  <g fill="#FFB1B4">
    <ellipse cx={x - 3.5} cy={y - 1.6} rx="1.3" ry="1.1" />
    <ellipse cx={x} cy={y - 2.2} rx="1.3" ry="1.1" />
    <ellipse cx={x + 3.5} cy={y - 1.6} rx="1.3" ry="1.1" />
    <ellipse cx={x} cy={y + 1.3} rx="2.9" ry="1.8" />
  </g>
);

/** A front paw with three toe lines, or with toe beans (`pads`); className "leg" lets it paddle while dragged. */
export function Paw({ x, b, fill, edge, pads }: { x: number; b?: boolean; fill: string; edge: string; pads?: boolean }) {
  return (
    <g className={b ? "leg b" : "leg"}>
      <ellipse cx={x} cy="90" rx="9" ry="5" fill={fill} stroke={edge} strokeWidth={LINE_W} />
      {pads ? <Pads x={x} y={90} /> : <path d={`M${x - 3} 88.6 v3 M${x} 88 v3.6 M${x + 3} 88.6 v3`} stroke={outline(fill)} strokeWidth="0.9" strokeLinecap="round" />}
    </g>
  );
}

/** Soft gloss on the upper left of a round head. */
export const Gloss = ({ x, y, rx = 9, ry = 4 }: { x: number; y: number; rx?: number; ry?: number }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fff" opacity="0.22" transform={`rotate(-18 ${x} ${y})`} />
);

/** How far the head lifts on a click. */
export const headDy = (s: PetState) => (s === "click" ? -3 : 0);

/** Asleep, the head lies low and a little tilted, chin on the paws; worn things move with it. */
export const SLEEP_HEAD = "translate(-5 21) rotate(-8 60 42)";

/**
 * Eyes, brows, cheeks, sweat and mouth for the front-facing pets (cat, dog, rabbit), centred on x=60.
 * Expressions are swapped per state, never animated. The pet supplies only its resting mouth.
 */
export function FrontFace({
  state,
  blink,
  eyeY,
  mouthY,
  neutralMouth,
  muted,
  noBlush,
  halo,
}: {
  state: PetState;
  blink: boolean;
  eyeY: number;
  mouthY: number;
  neutralMouth: ReactNode;
  muted?: boolean;
  /** the heart stickers (outfit "cheeks") take the blush's place */
  noBlush?: boolean;
  /** a light rim under closed eyes and brows so the lines still read on a dark coat */
  halo?: string;
}) {
  const closed = state === "sleep" || blink;
  const joy = state === "hover" || state === "click" || state === "drag";
  const nag = state === "nag";
  const stroke = (d: string) => (
    <>
      {halo && <path d={d} {...line} stroke={halo} strokeWidth="3.8" />}
      <path d={d} {...line} />
    </>
  );

  const eye = (x: number) =>
    closed ? (
      stroke(`M${x - 4} ${eyeY + 1} q4 3 8 0`)
    ) : state === "click" ? (
      stroke(`M${x - 4} ${eyeY + 2} q4 -6 8 0`)
    ) : (
      <>
        <ellipse cx={x} cy={eyeY} rx={joy || nag ? 3.6 : 3.3} ry={joy || nag ? 4.6 : 4.3} fill={INK} />
        <circle cx={x + 1.15} cy={eyeY - 1.6} r="1.3" fill="#fff" />
        <circle cx={x - 1} cy={eyeY + 1.7} r={state === "hover" ? 0.8 : 0.6} fill="#fff" opacity="0.85" />
      </>
    );

  return (
    <>
      {!noBlush && <circle cx="41" cy={eyeY + 8} r="4.5" fill={CHEEK} opacity={joy ? 0.9 : 0.55} />}
      {!noBlush && <circle cx="79" cy={eyeY + 8} r="4.5" fill={CHEEK} opacity={joy ? 0.9 : 0.55} />}
      {eye(50)}
      {eye(70)}
      {nag && (
        <>
          {stroke(`M44 ${eyeY - 8} L56 ${eyeY - 5}`)}
          {stroke(`M76 ${eyeY - 8} L64 ${eyeY - 5}`)}
          <path d={`M90 ${eyeY - 22} q3 4 0 6.5 q-3 -2.5 0 -6.5 z`} fill={SWEAT} />
        </>
      )}
      {muted ? (
        <MuteMask x={60} y={mouthY} />
      ) : state === "sleep" ? (
        <ellipse cx="60" cy={mouthY} rx="2" ry="1.5" fill={INK} />
      ) : joy ? (
        <>
          <path d={`M54 ${mouthY - 1} q6 9 12 0 z`} fill={INK} />
          <circle cx="60" cy={mouthY + 4} r="2" fill={CHEEK} />
        </>
      ) : nag ? (
        <path d={`M55 ${mouthY + 1} q5 -3 10 0`} {...line} />
      ) : (
        neutralMouth
      )}
      {state === "click" && <path d="M96 14 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill={SPARK} />}
    </>
  );
}
