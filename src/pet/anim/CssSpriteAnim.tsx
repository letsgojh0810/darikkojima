import type { PetAnimation } from "./types";
import { useBlink } from "./useBlink";
import "./CssSpriteAnim.css";

// Flat turtle in the Toss palette: colour planes only, no outlines. Expressions are swapped per state, never animated.
const C = {
  shell: "#3DBE8B",
  shellDark: "#2FA676",
  shellLight: "#6FD6AB",
  skin: "#F5C26B",
  skinDark: "#E8A94A",
  cheek: "#FF9F8E",
  ink: "#191F28",
  sweat: "#8CC5FF",
  spark: "#FFD66B",
};

const line = { fill: "none", stroke: C.ink, strokeWidth: 2, strokeLinecap: "round" as const };

export const CssSpriteAnim: PetAnimation = ({ state }) => {
  const blink = useBlink(state);

  const asleep = state === "sleep";
  const nag = state === "nag";
  const joy = state === "hover" || state === "click" || state === "drag";
  const headY = asleep ? 3 : state === "click" ? -3 : 0;

  const eye = asleep || blink ? (
    <path d="M101 61 q3 3 6 0" {...line} />
  ) : state === "click" ? (
    <path d="M101 62 q3 -5 6 0" {...line} />
  ) : (
    <>
      <ellipse cx="104" cy="60" rx={joy || nag ? 3.2 : 2.8} ry={joy || nag ? 4 : 3.6} fill={C.ink} />
      <circle cx="105" cy="58.5" r="1.1" fill="#fff" />
      {state === "hover" && <circle cx="103" cy="62" r="0.7" fill="#fff" />}
    </>
  );

  const mouth = asleep ? (
    <ellipse cx="106" cy="72" rx="2" ry="1.5" fill={C.ink} />
  ) : joy ? (
    <>
      <path d="M102 70 q4 8 8 0 z" fill={C.ink} />
      <circle cx="106" cy="73.5" r="1.8" fill={C.cheek} />
    </>
  ) : nag ? (
    <path d="M103 72 h6" {...line} />
  ) : (
    <path d="M103 71 q3 2.5 6 0" {...line} />
  );

  return (
    <div className={`sprite sprite-${state} pet-turtle`}>
      <svg width="120" height="100" viewBox="0 0 120 100">
        <ellipse cx="58" cy="94" rx="38" ry="4" fill="rgba(0,0,0,0.12)" />
        {/* dragging = swimming: waves slide under the body */}
        {state === "drag" && <path className="wave" d="M-20 90 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke={C.sweat} strokeWidth="3" strokeLinecap="round" />}
        {/* tail and legs */}
        <path d="M24 78 L10 83 L24 87 Z" fill={C.skinDark} strokeLinejoin="round" stroke={C.skinDark} strokeWidth="3" />
        <rect className="leg" x="30" y="76" width="16" height="16" rx="8" fill={C.skinDark} />
        <rect className="leg b" x="70" y="76" width="16" height="16" rx="8" fill={C.skin} />
        {/* belly strip under the shell */}
        <rect x="20" y="72" width="78" height="16" rx="8" fill={C.skinDark} />
        {/* head */}
        <g transform={`translate(0 ${headY})`}>
          <circle cx="100" cy="64" r="15" fill={C.skin} />
          <circle cx="108" cy="70" r="3.5" fill={C.cheek} opacity={joy ? 1 : 0.7} />
          {eye}
          {nag && <path d="M99 53.5 L109 56.5" {...line} />}
          {mouth}
          {nag && <path d="M113 48 q3 4 0 6.5 q-3 -2.5 0 -6.5 z" fill={C.sweat} />}
        </g>
        {/* shell */}
        <path d="M18 80 C18 46 36 26 58 26 C80 26 98 46 98 80 Z" fill={C.shell} />
        <path d="M28 58 C30 44 40 34 52 31" fill="none" stroke={C.shellLight} strokeWidth="4" strokeLinecap="round" />
        <path d="M46 50 L58 43 L70 50 L70 63 L58 70 L46 63 Z" fill={C.shellDark} stroke={C.shellDark} strokeWidth="4" strokeLinejoin="round" />
        <path d="M27 66 L33 62.5 L39 66 L39 73 L33 76.5 L27 73 Z" fill={C.shellDark} stroke={C.shellDark} strokeWidth="3" strokeLinejoin="round" />
        <path d="M77 66 L83 62.5 L89 66 L89 73 L83 76.5 L77 73 Z" fill={C.shellDark} stroke={C.shellDark} strokeWidth="3" strokeLinejoin="round" />
        {state === "click" && <path d="M92 14 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill={C.spark} />}
      </svg>
      {asleep && <i className="zzz">z</i>}
    </div>
  );
};
