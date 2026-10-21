import { FrontFace, INK, headDy } from "./FrontFace";
import { Sprite } from "./Sprite";
import type { PetAnimation } from "./types";
import { useBlink } from "./useBlink";

const FUR = "#F2C98A";
const PATCH = "#D79B5E";
const EAR = "#B9783F";
const MUZZLE = "#FFF1DC";

// Golden puppy with floppy ears and an eye patch, sitting.
export const DogAnim: PetAnimation = ({ state }) => {
  const blink = useBlink(state);
  return (
    <Sprite state={state} pet="dog">
      <ellipse cx="60" cy="94" rx="36" ry="4" fill="rgba(0,0,0,0.12)" />
      <path className="tail" d="M88 84 C106 82 112 66 106 54" fill="none" stroke={FUR} strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="60" cy="76" rx="30" ry="18" fill={FUR} />
      <ellipse cx="60" cy="82" rx="17" ry="11" fill={MUZZLE} />
      <ellipse className="leg" cx="46" cy="90" rx="9" ry="5" fill={MUZZLE} />
      <ellipse className="leg b" cx="74" cy="90" rx="9" ry="5" fill={MUZZLE} />
      <g transform={`translate(0 ${headDy(state)})`}>
        <ellipse cx="60" cy="42" rx="26" ry="24" fill={FUR} />
        <ellipse cx="50" cy="40" rx="9" ry="8" fill={PATCH} />
        <ellipse cx="35" cy="40" rx="9" ry="16" transform="rotate(12 35 40)" fill={EAR} />
        <ellipse cx="85" cy="40" rx="9" ry="16" transform="rotate(-12 85 40)" fill={EAR} />
        <ellipse cx="60" cy="53" rx="14" ry="10" fill={MUZZLE} />
        <FrontFace
          state={state}
          blink={blink}
          eyeY={40}
          mouthY={56}
          neutralMouth={
            <path d="M60 51.5 v3 M60 54.5 q-4 3 -8 0 M60 54.5 q4 3 8 0" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
          }
        />
        <ellipse cx="60" cy="48" rx="5" ry="3.5" fill={INK} />
      </g>
    </Sprite>
  );
};
