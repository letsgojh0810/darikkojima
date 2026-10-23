import { ANCHORS } from "../outfit";
import { NeckLayer, OutfitLayer, SleepNeckLayer } from "./Outfit";
import { FrontFace, Gloss, INK, LINE_W, Paw, SLEEP_HEAD, headDy, outline } from "./FrontFace";
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

// A tabby, sitting: flat colour planes with a little gloss and shade.
export const CatAnim: PetAnimation = ({ state, muted, outfit, color }) => {
  const blink = useBlink(state);
  const { FUR, FUR_DARK, BELLY } = CAT_COLORS.find((c) => c.id === color) ?? CAT_COLORS[0];
  const line = { stroke: outline(FUR), strokeWidth: LINE_W };
  const tail = "M88 84 C112 86 116 58 102 54";
  const ears = ["M34 32 L38 8 L58 22 Z", "M86 32 L82 8 L62 22 Z"];
  const asleep = state === "sleep";
  // asleep: curled up in a loaf, chin down on the front paws, the tail wrapped around the front
  const sleepTail = "M101 83 C110 91 102 95.5 88 95.5 L64 95.5";
  return (
    <Sprite state={state} pet="cat">
      <ellipse cx="60" cy="94" rx={asleep ? 44 : 36} ry="4" fill="rgba(0,0,0,0.12)" />
      {asleep ? (
        <>
          <ellipse cx="70" cy="80" rx="33" ry="14" fill={FUR} {...line} />
          <path d="M80 70 q6 -2 10 1 M86 75 q5 -1.5 9 1" fill="none" stroke={FUR_DARK} strokeWidth="2.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* a stroked shape gets its outline from a wider stroke drawn under it */}
          <path d={tail} fill="none" stroke={line.stroke} strokeWidth={9 + 2 * LINE_W} strokeLinecap="round" />
          <path d={tail} fill="none" stroke={FUR_DARK} strokeWidth="9" strokeLinecap="round" />
          <path d="M104.2 58.5 C103.6 56.5 103 55 102 54" fill="none" stroke={BELLY} strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="60" cy="76" rx="30" ry="18" fill={FUR} {...line} />
          {/* the head's shadow on the body, and a fluffy chest */}
          <ellipse cx="60" cy="62" rx="22" ry="6" fill={FUR_DARK} opacity="0.35" />
          <path d="M45 78 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 Q76 90 60 93 Q44 90 45 78 Z" fill={BELLY} />
          <Paw x={46} fill={BELLY} edge={line.stroke} />
          <Paw x={74} b fill={BELLY} edge={line.stroke} />
          <NeckLayer outfit={outfit} a={ANCHORS.cat} />
        </>
      )}
      {asleep && <SleepNeckLayer outfit={outfit} a={ANCHORS.cat} transform={SLEEP_HEAD} />}
      <g transform={asleep ? SLEEP_HEAD : `translate(0 ${headDy(state)})`}>
        {ears.map((d) => (
          <path key={d} d={d} fill={FUR} stroke={line.stroke} strokeWidth={4 + 2 * LINE_W} strokeLinejoin="round" />
        ))}
        {ears.map((d) => (
          <path key={d} d={d} fill={FUR} stroke={FUR} strokeWidth="4" strokeLinejoin="round" />
        ))}
        <path d="M40 26 L41 16 L51 22 Z" fill={PINK} />
        <path d="M80 26 L79 16 L69 22 Z" fill={PINK} />
        <ellipse cx="60" cy="42" rx="28" ry="24" fill={FUR} {...line} />
        <Gloss x={49} y={28.5} />
        <path d="M60 19 v6 M52 21 l1 5 M68 21 l-1 5" fill="none" stroke={FUR_DARK} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 48 L20 45 M32 52 L20 53 M88 48 L100 45 M88 52 L100 53" fill="none" stroke="#B0B8C1" strokeWidth="1.5" strokeLinecap="round" />
        {/* the nose stays whatever the mouth does (smile, tape) */}
        <path d="M57 47 L63 47 L60 51 Z" fill="#FF8FA0" stroke="#FF8FA0" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="58.8" cy="47.3" r="0.8" fill="#fff" opacity="0.8" />
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
      {asleep && (
        <>
          <ellipse cx="46" cy="89" rx="9" ry="4.6" fill={BELLY} {...line} />
          <ellipse cx="62" cy="90" rx="9" ry="4.6" fill={BELLY} {...line} />
          <path d={sleepTail} fill="none" stroke={line.stroke} strokeWidth={8 + 2 * LINE_W} strokeLinecap="round" />
          <path d={sleepTail} fill="none" stroke={FUR_DARK} strokeWidth="8" strokeLinecap="round" />
          <path d="M70 95.5 L64 95.5" fill="none" stroke={BELLY} strokeWidth="7" strokeLinecap="round" />
        </>
      )}
    </Sprite>
  );
};
