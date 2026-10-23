import { ANCHORS } from "../outfit";
import { OutfitLayer } from "./Outfit";
import { FrontFace, INK, LINE_W, headDy, outline } from "./FrontFace";
import { Sprite } from "./Sprite";
import type { PetAnimation } from "./types";
import { useBlink } from "./useBlink";

/** coat colours to pick from; the first is the default. Names live in messages/ko.ts colorNames. */
export const DOG_COLORS = [
  { id: "golden", FUR: "#F2C98A", PATCH: "#D79B5E", EAR: "#B9783F", MUZZLE: "#FFF1DC" },
  { id: "jindo", FUR: "#FAF4EA", PATCH: "#EADCC9", EAR: "#DCC6A8", MUZZLE: "#FFFFFF" },
  { id: "choco", FUR: "#B07E57", PATCH: "#8C5E3E", EAR: "#6E452C", MUZZLE: "#EED3B5" },
  { id: "schnauzer", FUR: "#C5CBD3", PATCH: "#9EA6B1", EAR: "#6B7684", MUZZLE: "#F2F4F6" },
];

// A puppy with floppy ears and an eye patch, sitting.
export const DogAnim: PetAnimation = ({ state, muted, outfit, color }) => {
  const blink = useBlink(state);
  const { FUR, PATCH, EAR, MUZZLE } = DOG_COLORS.find((c) => c.id === color) ?? DOG_COLORS[0];
  const line = { stroke: outline(FUR), strokeWidth: LINE_W };
  const tail = "M88 84 C106 82 112 66 106 54";
  return (
    <Sprite state={state} pet="dog">
      <ellipse cx="60" cy="94" rx="36" ry="4" fill="rgba(0,0,0,0.12)" />
      {/* the tail is a stroke, so its outline is a wider stroke under it; both wag together */}
      <g className="tail">
        <path d={tail} fill="none" stroke={line.stroke} strokeWidth={9 + 2 * LINE_W} strokeLinecap="round" />
        <path d={tail} fill="none" stroke={FUR} strokeWidth="9" strokeLinecap="round" />
      </g>
      <ellipse cx="60" cy="76" rx="30" ry="18" fill={FUR} {...line} />
      <ellipse cx="60" cy="82" rx="17" ry="11" fill={MUZZLE} />
      <ellipse className="leg" cx="46" cy="90" rx="9" ry="5" fill={MUZZLE} {...line} />
      <ellipse className="leg b" cx="74" cy="90" rx="9" ry="5" fill={MUZZLE} {...line} />
      <g transform={`translate(0 ${headDy(state)})`}>
        <ellipse cx="60" cy="42" rx="26" ry="24" fill={FUR} {...line} />
        <ellipse cx="50" cy="40" rx="9" ry="8" fill={PATCH} />
        <ellipse cx="35" cy="40" rx="9" ry="16" transform="rotate(12 35 40)" fill={EAR} stroke={outline(EAR)} strokeWidth={LINE_W} />
        <ellipse cx="85" cy="40" rx="9" ry="16" transform="rotate(-12 85 40)" fill={EAR} stroke={outline(EAR)} strokeWidth={LINE_W} />
        <ellipse cx="60" cy="53" rx="14" ry="10" fill={MUZZLE} />
        {/* drawn before the face so the tape (quiet mode) lies over it */}
        <ellipse cx="60" cy="48" rx="5" ry="3.5" fill={INK} />
        <FrontFace
          state={state}
          blink={blink}
          muted={muted}
          noBlush={outfit?.face === "cheeks"}
          eyeY={40}
          mouthY={56}
          neutralMouth={
            <path d="M60 51.5 v3 M60 54.5 q-4 3 -8 0 M60 54.5 q4 3 8 0" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
          }
        />
        <OutfitLayer outfit={outfit} a={ANCHORS.dog} />
      </g>
    </Sprite>
  );
};
