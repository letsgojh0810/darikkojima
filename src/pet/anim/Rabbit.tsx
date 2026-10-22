import { ANCHORS } from "../outfit";
import { OutfitLayer } from "./Outfit";
import { FrontFace, INK, headDy } from "./FrontFace";
import { Sprite } from "./Sprite";
import type { PetAnimation } from "./types";
import { useBlink } from "./useBlink";

const FUR = "#F2EBE2";
const SHADE = "#E4D9CB";
const PINK = "#FFB8C0";

// White rabbit with tall ears, sitting.
export const RabbitAnim: PetAnimation = ({ state, muted, outfit }) => {
  const blink = useBlink(state);
  return (
    <Sprite state={state} pet="rabbit">
      <ellipse cx="60" cy="94" rx="36" ry="4" fill="rgba(0,0,0,0.12)" />
      <circle cx="92" cy="84" r="7" fill={FUR} />
      <ellipse cx="60" cy="78" rx="29" ry="16" fill={FUR} />
      <ellipse cx="60" cy="83" rx="16" ry="10" fill={SHADE} />
      <ellipse className="leg" cx="46" cy="90" rx="9" ry="5" fill={SHADE} />
      <ellipse className="leg b" cx="74" cy="90" rx="9" ry="5" fill={SHADE} />
      <g transform={`translate(0 ${headDy(state)})`}>
        <ellipse cx="46" cy="20" rx="8" ry="17" transform="rotate(-8 46 20)" fill={FUR} />
        <ellipse cx="74" cy="20" rx="8" ry="17" transform="rotate(8 74 20)" fill={FUR} />
        <ellipse cx="46" cy="22" rx="4" ry="11" transform="rotate(-8 46 22)" fill={PINK} />
        <ellipse cx="74" cy="22" rx="4" ry="11" transform="rotate(8 74 22)" fill={PINK} />
        <ellipse cx="60" cy="46" rx="26" ry="22" fill={FUR} />
        {/* the nose stays whatever the mouth does (smile, tape) */}
        <ellipse cx="60" cy="52" rx="3" ry="2.2" fill={PINK} />
        <FrontFace
          state={state}
          blink={blink}
          muted={muted}
          eyeY={46}
          mouthY={58}
          neutralMouth={<path d="M60 54 v2 M60 56 q-3 3 -6 1 M60 56 q3 3 6 1" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />}
        />
        <OutfitLayer outfit={outfit} a={ANCHORS.rabbit} />
      </g>
    </Sprite>
  );
};
