import { ANCHORS } from "../outfit";
import { NeckLayer, OutfitLayer } from "./Outfit";
import { FrontFace, INK, LINE_W, headDy, outline } from "./FrontFace";
import { Sprite } from "./Sprite";
import type { PetAnimation } from "./types";
import { useBlink } from "./useBlink";

/** body colours to pick from; the first is the default. Names live in messages/ko.ts colorNames. */
export const ROBOT_COLORS = [
  { id: "silver", BODY: "#E5E8EB", DARK: "#B0B8C1", LIGHT: "#3182F6", SCREEN: "#F7FAFF" },
  { id: "sky", BODY: "#9CCBFF", DARK: "#5DA8F5", LIGHT: "#FFD66B", SCREEN: "#F7FAFF" },
  { id: "mint", BODY: "#97E2CB", DARK: "#55C7A4", LIGHT: "#FF8FA0", SCREEN: "#F6FFFB" },
  { id: "lemon", BODY: "#FFDF85", DARK: "#F2B635", LIGHT: "#3182F6", SCREEN: "#FFFCF2" },
];

// A small AI helper bot: a round square head with a face screen, ear bolts and an antenna, sitting on a short body.
export const RobotAnim: PetAnimation = ({ state, muted, outfit, color }) => {
  const blink = useBlink(state);
  const { BODY, DARK, LIGHT, SCREEN } = ROBOT_COLORS.find((c) => c.id === color) ?? ROBOT_COLORS[0];
  const line = { stroke: outline(BODY), strokeWidth: LINE_W };
  const dark = { fill: DARK, stroke: outline(DARK), strokeWidth: LINE_W };
  return (
    <Sprite state={state} pet="robot">
      <ellipse cx="60" cy="94" rx="34" ry="4" fill="rgba(0,0,0,0.12)" />
      <rect className="leg" x="42" y="84" width="14" height="9" rx="4.5" {...dark} />
      <rect className="leg b" x="64" y="84" width="14" height="9" rx="4.5" {...dark} />
      <rect className="arm" x="28" y="68" width="10" height="17" rx="5" {...dark} />
      <rect className="arm b" x="82" y="68" width="10" height="17" rx="5" {...dark} />
      <rect x="36" y="62" width="48" height="27" rx="12" fill={BODY} {...line} />
      {/* the chest light would show through anything worn at the neck, so it hides under it */}
      {!outfit?.neck && (
        <>
          <circle cx="60" cy="75" r="4.5" fill={LIGHT} />
          <circle cx="58.6" cy="73.6" r="1.4" fill="#fff" opacity="0.8" />
        </>
      )}
      <NeckLayer outfit={outfit} a={ANCHORS.robot} />
      <g transform={`translate(0 ${headDy(state)})`}>
        <path d="M60 21 V11" stroke={DARK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="9" r="4" fill={LIGHT} stroke={outline(LIGHT)} strokeWidth={LINE_W} />
        <rect x="24" y="35" width="8" height="15" rx="3" {...dark} />
        <rect x="88" y="35" width="8" height="15" rx="3" {...dark} />
        <rect x="30" y="20" width="60" height="44" rx="17" fill={BODY} {...line} />
        <rect x="36" y="27" width="48" height="31" rx="12" fill={SCREEN} stroke={outline(BODY)} strokeWidth={LINE_W * 0.6} />
        <FrontFace
          state={state}
          blink={blink}
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
