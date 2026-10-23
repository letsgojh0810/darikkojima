import { ANCHORS } from "../outfit";
import { HATS, NeckLayer, OutfitLayer } from "./Outfit";
import { FrontFace, INK, LINE_W, headDy, outline } from "./FrontFace";
import { Sprite } from "./Sprite";
import type { PetAnimation } from "./types";

/** body colours to pick from; the first is the default. Names live in messages/ko.ts colorNames. */
export const ROBOT_COLORS = [
  { id: "silver", BODY: "#E5E8EB", DARK: "#B0B8C1", LIGHT: "#3182F6", SCREEN: "#F7FAFF" },
  { id: "sky", BODY: "#9CCBFF", DARK: "#5DA8F5", LIGHT: "#FFD66B", SCREEN: "#F7FAFF" },
  { id: "mint", BODY: "#97E2CB", DARK: "#55C7A4", LIGHT: "#FF8FA0", SCREEN: "#F6FFFB" },
  { id: "lemon", BODY: "#FFDF85", DARK: "#F2B635", LIGHT: "#3182F6", SCREEN: "#FFFCF2" },
];

const OFF = "#C9CFD7";

// A small AI helper bot: a rounded capsule head with a light face screen, round ear speakers and an antenna, stubby
// arms on a short body with a heart lamp.
export const RobotAnim: PetAnimation = ({ state, muted, outfit, color }) => {
  const { BODY, DARK, LIGHT, SCREEN } = ROBOT_COLORS.find((c) => c.id === color) ?? ROBOT_COLORS[0];
  const line = { stroke: outline(BODY), strokeWidth: LINE_W };
  const dark = { fill: DARK, stroke: outline(DARK), strokeWidth: LINE_W };
  // asleep: on standby, sitting down with the legs folded away, head sunk, antenna drooping, lights and screen dimmed
  const asleep = state === "sleep";
  const sit = asleep ? 3 : 0;
  return (
    <Sprite state={state} pet="robot">
      <ellipse cx="60" cy="94" rx={asleep ? 36 : 30} ry="4" fill="rgba(0,0,0,0.12)" />
      {!asleep && (
        <>
          <ellipse className="leg" cx="49" cy="90" rx="7.5" ry="4.5" {...dark} />
          <ellipse className="leg b" cx="71" cy="90" rx="7.5" ry="4.5" {...dark} />
        </>
      )}
      <ellipse className="arm" cx={asleep ? 35 : 36} cy={75 + sit} rx="5" ry="7.5" transform={`rotate(${asleep ? 24 : 14} ${asleep ? 35 : 36} ${75 + sit})`} {...dark} />
      <ellipse className="arm b" cx={asleep ? 85 : 84} cy={75 + sit} rx="5" ry="7.5" transform={`rotate(${asleep ? -24 : -14} ${asleep ? 85 : 84} ${75 + sit})`} {...dark} />
      <g transform={`translate(0 ${sit})`}>
        <rect x="39" y="62" width="42" height="27" rx="13" fill={BODY} {...line} />
        {/* the head's shadow on the body, and a shine down its left side */}
        <ellipse cx="60" cy="65.5" rx="18" ry="3.5" fill={DARK} opacity="0.35" />
        <path d="M43 70 v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        {/* the heart lamp would show through anything worn at the neck, so it hides under it */}
        {!outfit?.neck && (
          <path d="M60 80 c-3.5 -2.6 -5 -4.6 -2.8 -6.4 c1.3 -1 2.3 -0.3 2.8 0.6 c0.5 -0.9 1.5 -1.6 2.8 -0.6 c2.2 1.8 0.7 3.8 -2.8 6.4 z" fill={asleep ? OFF : LIGHT} />
        )}
        <NeckLayer outfit={outfit} a={ANCHORS.robot} />
      </g>
      <g transform={asleep ? "translate(0 10) rotate(-6 60 42)" : `translate(0 ${headDy(state)})`}>
        {!HATS.has(outfit?.head ?? "") &&
          (asleep ? (
            <>
              <path d="M60 20 Q60 13 66.5 11" fill="none" stroke={DARK} strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="68.5" cy="10.5" r="3.6" fill={OFF} stroke={outline(OFF)} strokeWidth={LINE_W} />
            </>
          ) : (
            <>
              <path d="M60 20 V12" stroke={DARK} strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="60" cy="10" r="3.6" fill={LIGHT} stroke={outline(LIGHT)} strokeWidth={LINE_W} />
              <circle cx="58.8" cy="8.8" r="1.1" fill="#fff" opacity="0.8" />
            </>
          ))}
        {/* round speakers for ears */}
        {[28, 92].map((x) => (
          <g key={x}>
            <circle cx={x} cy="42" r="6" {...dark} />
            <circle cx={x} cy="42" r="2.6" fill={BODY} />
          </g>
        ))}
        <rect x="29" y="19" width="62" height="45" rx="22" fill={BODY} {...line} />
        <path d="M40 22.6 h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
        <rect x="35" y="27" width="50" height="30" rx="14" fill={SCREEN} stroke={outline(BODY)} strokeWidth={LINE_W * 0.6} />
        {asleep && <rect x="35" y="27" width="50" height="30" rx="14" fill="rgba(25,31,40,0.1)" />}
        <FrontFace
          state={state}
          muted={muted}
          noBlush={outfit?.face === "cheeks"}
          eyeY={41}
          mouthY={51}
          neutralMouth={<path d="M55 50 q5 4 10 0" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />}
        />
        <OutfitLayer outfit={outfit} a={ANCHORS.robot} />
      </g>
    </Sprite>
  );
};
