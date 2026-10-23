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

/** How far the head sinks (sleep) or lifts (click). */
export const headDy = (s: PetState) => (s === "sleep" ? 3 : s === "click" ? -3 : 0);

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
}: {
  state: PetState;
  blink: boolean;
  eyeY: number;
  mouthY: number;
  neutralMouth: ReactNode;
  muted?: boolean;
  /** the heart stickers (outfit "cheeks") take the blush's place */
  noBlush?: boolean;
}) {
  const closed = state === "sleep" || blink;
  const joy = state === "hover" || state === "click" || state === "drag";
  const nag = state === "nag";

  const eye = (x: number) =>
    closed ? (
      <path d={`M${x - 4} ${eyeY + 1} q4 3 8 0`} {...line} />
    ) : state === "click" ? (
      <path d={`M${x - 4} ${eyeY + 2} q4 -6 8 0`} {...line} />
    ) : (
      <>
        <ellipse cx={x} cy={eyeY} rx={joy || nag ? 3.4 : 3} ry={joy || nag ? 4.4 : 4} fill={INK} />
        <circle cx={x + 1} cy={eyeY - 1.5} r="1.1" fill="#fff" />
        {state === "hover" && <circle cx={x - 1} cy={eyeY + 1.5} r="0.7" fill="#fff" />}
      </>
    );

  return (
    <>
      {!noBlush && <circle cx="41" cy={eyeY + 8} r="4" fill={CHEEK} opacity={joy ? 1 : 0.65} />}
      {!noBlush && <circle cx="79" cy={eyeY + 8} r="4" fill={CHEEK} opacity={joy ? 1 : 0.65} />}
      {eye(50)}
      {eye(70)}
      {nag && (
        <>
          <path d={`M44 ${eyeY - 8} L56 ${eyeY - 5}`} {...line} />
          <path d={`M76 ${eyeY - 8} L64 ${eyeY - 5}`} {...line} />
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
