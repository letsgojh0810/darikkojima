import { FrontFace, INK, headDy } from "./FrontFace";
import { Sprite } from "./Sprite";
import type { PetAnimation } from "./types";
import { useBlink } from "./useBlink";

const FUR = "#F5B97A";
const FUR_DARK = "#E8A04A";
const BELLY = "#FFE3C2";
const PINK = "#FF9F8E";

// Orange tabby, sitting, flat colour planes only.
export const CatAnim: PetAnimation = ({ state, muted }) => {
  const blink = useBlink(state);
  return (
    <Sprite state={state} pet="cat">
      <ellipse cx="60" cy="94" rx="36" ry="4" fill="rgba(0,0,0,0.12)" />
      <path d="M88 84 C112 86 116 58 102 54" fill="none" stroke={FUR_DARK} strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="60" cy="76" rx="30" ry="18" fill={FUR} />
      <ellipse cx="60" cy="82" rx="17" ry="11" fill={BELLY} />
      <ellipse className="leg" cx="46" cy="90" rx="9" ry="5" fill={BELLY} />
      <ellipse className="leg b" cx="74" cy="90" rx="9" ry="5" fill={BELLY} />
      <g transform={`translate(0 ${headDy(state)})`}>
        <path d="M34 32 L38 8 L58 22 Z" fill={FUR} stroke={FUR} strokeWidth="4" strokeLinejoin="round" />
        <path d="M86 32 L82 8 L62 22 Z" fill={FUR} stroke={FUR} strokeWidth="4" strokeLinejoin="round" />
        <path d="M40 26 L41 16 L51 22 Z" fill={PINK} />
        <path d="M80 26 L79 16 L69 22 Z" fill={PINK} />
        <ellipse cx="60" cy="42" rx="28" ry="24" fill={FUR} />
        <path d="M60 19 v6 M52 21 l1 5 M68 21 l-1 5" fill="none" stroke={FUR_DARK} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 48 L20 45 M32 52 L20 53 M88 48 L100 45 M88 52 L100 53" fill="none" stroke="#B0B8C1" strokeWidth="1.5" strokeLinecap="round" />
        {/* the nose stays whatever the mouth does (smile, tape) */}
        <path d="M57 47 L63 47 L60 51 Z" fill="#FF8FA0" stroke="#FF8FA0" strokeWidth="2" strokeLinejoin="round" />
        <FrontFace
          state={state}
          blink={blink}
          muted={muted}
          eyeY={42}
          mouthY={55}
          neutralMouth={<path d="M60 51 q-3 4 -6 2 M60 51 q3 4 6 2" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />}
        />
      </g>
    </Sprite>
  );
};
