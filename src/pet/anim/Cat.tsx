import { ANCHORS } from "../outfit";
import { NeckLayer, OutfitLayer } from "./Outfit";
import { FrontFace, INK, LINE_W, headDy, outline } from "./FrontFace";
import { Sprite } from "./Sprite";
import type { PetAnimation } from "./types";
import { useBlink } from "./useBlink";

const PINK = "#FF9F8E";

/** coat colours to pick from; the first is the default. Names live in messages/ko.ts colorNames. */
export const CAT_COLORS = [
  { id: "cheese", FUR: "#F5B97A", FUR_DARK: "#E8A04A", BELLY: "#FFE3C2" },
  { id: "gray", FUR: "#AEB8C4", FUR_DARK: "#848F9D", BELLY: "#E9EEF3" },
  { id: "tabby", FUR: "#C2AE93", FUR_DARK: "#7D6A55", BELLY: "#F3EBDF" },
  { id: "white", FUR: "#F7F0E6", FUR_DARK: "#E0D2BF", BELLY: "#FFFFFF" },
];

// A tabby, sitting, flat colour planes only.
export const CatAnim: PetAnimation = ({ state, muted, outfit, color }) => {
  const blink = useBlink(state);
  const { FUR, FUR_DARK, BELLY } = CAT_COLORS.find((c) => c.id === color) ?? CAT_COLORS[0];
  const line = { stroke: outline(FUR), strokeWidth: LINE_W };
  const tail = "M88 84 C112 86 116 58 102 54";
  const ears = ["M34 32 L38 8 L58 22 Z", "M86 32 L82 8 L62 22 Z"];
  return (
    <Sprite state={state} pet="cat">
      <ellipse cx="60" cy="94" rx="36" ry="4" fill="rgba(0,0,0,0.12)" />
      {/* a stroked shape gets its outline from a wider stroke drawn under it */}
      <path d={tail} fill="none" stroke={line.stroke} strokeWidth={9 + 2 * LINE_W} strokeLinecap="round" />
      <path d={tail} fill="none" stroke={FUR_DARK} strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="60" cy="76" rx="30" ry="18" fill={FUR} {...line} />
      <ellipse cx="60" cy="82" rx="17" ry="11" fill={BELLY} />
      <ellipse className="leg" cx="46" cy="90" rx="9" ry="5" fill={BELLY} {...line} />
      <ellipse className="leg b" cx="74" cy="90" rx="9" ry="5" fill={BELLY} {...line} />
      <NeckLayer outfit={outfit} a={ANCHORS.cat} />
      <g transform={`translate(0 ${headDy(state)})`}>
        {ears.map((d) => (
          <path key={d} d={d} fill={FUR} stroke={line.stroke} strokeWidth={4 + 2 * LINE_W} strokeLinejoin="round" />
        ))}
        {ears.map((d) => (
          <path key={d} d={d} fill={FUR} stroke={FUR} strokeWidth="4" strokeLinejoin="round" />
        ))}
        <path d="M40 26 L41 16 L51 22 Z" fill={PINK} />
        <path d="M80 26 L79 16 L69 22 Z" fill={PINK} />
        <ellipse cx="60" cy="42" rx="28" ry="24" fill={FUR} {...line} />
        <path d="M60 19 v6 M52 21 l1 5 M68 21 l-1 5" fill="none" stroke={FUR_DARK} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 48 L20 45 M32 52 L20 53 M88 48 L100 45 M88 52 L100 53" fill="none" stroke="#B0B8C1" strokeWidth="1.5" strokeLinecap="round" />
        {/* the nose stays whatever the mouth does (smile, tape) */}
        <path d="M57 47 L63 47 L60 51 Z" fill="#FF8FA0" stroke="#FF8FA0" strokeWidth="2" strokeLinejoin="round" />
        <FrontFace
          state={state}
          blink={blink}
          muted={muted}
          noBlush={outfit?.face === "cheeks"}
          eyeY={42}
          mouthY={55}
          neutralMouth={<path d="M60 51 q-3 4 -6 2 M60 51 q3 4 6 2" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />}
        />
        <OutfitLayer outfit={outfit} a={ANCHORS.cat} />
      </g>
    </Sprite>
  );
};
