import { ANCHORS } from "../outfit";
import { OutfitLayer } from "./Outfit";
import { FrontFace, INK, LINE_W, headDy, outline } from "./FrontFace";
import { Sprite } from "./Sprite";
import type { PetAnimation } from "./types";
import { useBlink } from "./useBlink";

/** coat colours to pick from; the first is the default. Names live in messages/ko.ts colorNames. */
export const RABBIT_COLORS = [
  { id: "snow", FUR: "#F2EBE2", SHADE: "#E4D9CB", PINK: "#FFB8C0" },
  { id: "brown", FUR: "#CFA985", SHADE: "#B38D6B", PINK: "#F5B3A8" },
  { id: "ash", FUR: "#BEC4CD", SHADE: "#A2A9B4", PINK: "#FFB8C0" },
  { id: "beige", FUR: "#EED8B7", SHADE: "#DCC199", PINK: "#FFB8C0" },
];

// A rabbit with tall ears, sitting.
export const RabbitAnim: PetAnimation = ({ state, muted, outfit, color }) => {
  const blink = useBlink(state);
  const { FUR, SHADE, PINK } = RABBIT_COLORS.find((c) => c.id === color) ?? RABBIT_COLORS[0];
  const line = { stroke: outline(FUR), strokeWidth: LINE_W };
  return (
    <Sprite state={state} pet="rabbit">
      <ellipse cx="60" cy="94" rx="36" ry="4" fill="rgba(0,0,0,0.12)" />
      <circle cx="92" cy="84" r="7" fill={FUR} {...line} />
      <ellipse cx="60" cy="78" rx="29" ry="16" fill={FUR} {...line} />
      <ellipse cx="60" cy="83" rx="16" ry="10" fill={SHADE} />
      <ellipse className="leg" cx="46" cy="90" rx="9" ry="5" fill={SHADE} {...line} />
      <ellipse className="leg b" cx="74" cy="90" rx="9" ry="5" fill={SHADE} {...line} />
      <g transform={`translate(0 ${headDy(state)})`}>
        <ellipse cx="46" cy="20" rx="8" ry="17" transform="rotate(-8 46 20)" fill={FUR} {...line} />
        <ellipse cx="74" cy="20" rx="8" ry="17" transform="rotate(8 74 20)" fill={FUR} {...line} />
        <ellipse cx="46" cy="22" rx="4" ry="11" transform="rotate(-8 46 22)" fill={PINK} />
        <ellipse cx="74" cy="22" rx="4" ry="11" transform="rotate(8 74 22)" fill={PINK} />
        <ellipse cx="60" cy="46" rx="26" ry="22" fill={FUR} {...line} />
        {/* the nose stays whatever the mouth does (smile, tape) */}
        <ellipse cx="60" cy="52" rx="3" ry="2.2" fill={PINK} />
        <FrontFace
          state={state}
          blink={blink}
          muted={muted}
          noBlush={outfit?.face === "cheeks"}
          eyeY={46}
          mouthY={58}
          neutralMouth={<path d="M60 54 v2 M60 56 q-3 3 -6 1 M60 56 q3 3 6 1" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />}
        />
        <OutfitLayer outfit={outfit} a={ANCHORS.rabbit} />
      </g>
    </Sprite>
  );
};
