import { useId } from "react";
import { ANCHORS } from "../outfit";
import { NeckLayer, OutfitLayer, SleepNeckLayer } from "./Outfit";
import { FrontFace, Gloss, INK, LINE_W, Pads, Paw, SLEEP_HEAD, headDy, outline } from "./FrontFace";
import { Sprite } from "./Sprite";
import type { PetAnimation } from "./types";

const PINK = "#FF9F8E";
const ORANGE = "#F2A35C";
const BLACK = "#524A45";

/**
 * coat colours to pick from; the first is the default. Names live in messages/ko.ts colorNames.
 * `pattern`: tabby (stripes on the head, cheeks, sides and tail rings), tuxedo (white muzzle), calico (orange and black
 * patches on white), plain.
 */
export const CAT_COLORS = [
  { id: "cheese", FUR: "#F5B97A", FUR_DARK: "#E8A04A", STRIPE: "#DC8E3C", BELLY: "#FFE3C2", pattern: "tabby" },
  { id: "gray", FUR: "#A9B3C0", FUR_DARK: "#8E99A8", STRIPE: "#8E99A8", BELLY: "#F7F9FB", pattern: "tuxedo" },
  { id: "calico", FUR: "#FBF6EF", FUR_DARK: BLACK, STRIPE: BLACK, BELLY: "#FFFFFF", pattern: "calico" },
  { id: "white", FUR: "#FAF5EE", FUR_DARK: "#E9DFD2", STRIPE: "#E9DFD2", BELLY: "#FFFFFF", pattern: "plain" },
];

// A cat, sitting: flat colour planes with a little gloss and shade, and its coat's markings.
export const CatAnim: PetAnimation = ({ state, muted, outfit, color }) => {
  const { FUR, FUR_DARK, STRIPE, BELLY, pattern } = CAT_COLORS.find((c) => c.id === color) ?? CAT_COLORS[0];
  const line = { stroke: outline(FUR), strokeWidth: LINE_W };
  const tail = "M88 84 C112 86 116 58 102 54";
  const ears = ["M34 32 L38 8 L58 22 Z", "M86 32 L82 8 L62 22 Z"];
  // a calico's left ear is orange and its right one black
  const earFill = pattern === "calico" ? [ORANGE, BLACK] : [FUR, FUR];
  const asleep = state === "sleep";
  // asleep: curled up in a loaf, chin down on the front paws, the tail wrapped around the front
  const sleepTail = "M101 83 C110 91 102 95.5 88 95.5 L64 95.5";
  // markings stay inside the head and body: each is clipped to the shape it is painted on
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clip = (part: string) => `url(#${part}${id})`;
  const tabby = pattern === "tabby";
  const stripe = { fill: "none", stroke: STRIPE, strokeWidth: 2.2, strokeLinecap: "round" as const };
  // tail rings: the tail drawn again in dashes
  const rings = (d: string, w: number) => tabby && <path d={d} fill="none" stroke={STRIPE} strokeWidth={w} strokeDasharray="2.6 4.4" />;
  return (
    <Sprite state={state} pet="cat">
      <defs>
        <clipPath id={`head${id}`}>
          <ellipse cx="60" cy="42" rx="28" ry="24" />
        </clipPath>
        <clipPath id={`body${id}`}>
          <ellipse cx={asleep ? 70 : 60} cy={asleep ? 80 : 76} rx={asleep ? 33 : 30} ry={asleep ? 14 : 18} />
        </clipPath>
      </defs>
      <ellipse cx="60" cy="94" rx={asleep ? 44 : 36} ry="4" fill="rgba(0,0,0,0.12)" />
      {asleep ? (
        <>
          <ellipse cx="70" cy="80" rx="33" ry="14" fill={FUR} {...line} />
          <g clipPath={clip("body")}>
            {tabby && <path d="M80 70 q6 -2 10 1 M86 75 q5 -1.5 9 1 M92 80 q4 -1 7 1" {...stripe} />}
            {pattern === "calico" && (
              <>
                <ellipse cx="88" cy="73" rx="13" ry="8" fill={BLACK} />
                <ellipse cx="60" cy="70" rx="11" ry="6" fill={ORANGE} />
              </>
            )}
          </g>
        </>
      ) : (
        <>
          {/* a stroked shape gets its outline from a wider stroke drawn under it */}
          <path d={tail} fill="none" stroke={line.stroke} strokeWidth={9 + 2 * LINE_W} strokeLinecap="round" />
          <path d={tail} fill="none" stroke={FUR_DARK} strokeWidth="9" strokeLinecap="round" />
          {rings(tail, 9)}
          <path d="M104.2 58.5 C103.6 56.5 103 55 102 54" fill="none" stroke={BELLY} strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="60" cy="76" rx="30" ry="18" fill={FUR} {...line} />
          <g clipPath={clip("body")}>
            {tabby && <path d="M31 70 q5 1 7.5 6 M30.5 79 q5 0 7.5 5 M89 70 q-5 1 -7.5 6 M89.5 79 q-5 0 -7.5 5" {...stripe} />}
            {pattern === "calico" && (
              <>
                <ellipse cx="84" cy="70" rx="12" ry="9" fill={BLACK} />
                <ellipse cx="35" cy="83" rx="9" ry="8" fill={ORANGE} />
              </>
            )}
          </g>
          {/* the head's shadow on the body, and a fluffy chest */}
          <ellipse cx="60" cy="62" rx="22" ry="6" fill={FUR_DARK} opacity={pattern === "calico" ? 0.12 : 0.35} />
          <path d="M45 78 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 Q76 90 60 93 Q44 90 45 78 Z" fill={BELLY} />
          <Paw x={46} fill={BELLY} edge={line.stroke} pads />
          <Paw x={74} b fill={BELLY} edge={line.stroke} pads />
          <NeckLayer outfit={outfit} a={ANCHORS.cat} />
        </>
      )}
      {asleep && <SleepNeckLayer outfit={outfit} a={ANCHORS.cat} transform={SLEEP_HEAD} />}
      <g transform={asleep ? SLEEP_HEAD : `translate(0 ${headDy(state)})`}>
        {ears.map((d) => (
          <path key={d} d={d} fill={FUR} stroke={line.stroke} strokeWidth={4 + 2 * LINE_W} strokeLinejoin="round" />
        ))}
        {ears.map((d, i) => (
          <path key={d} d={d} fill={earFill[i]} stroke={earFill[i]} strokeWidth="4" strokeLinejoin="round" />
        ))}
        <path d="M40 26 L41 16 L51 22 Z" fill={PINK} />
        <path d="M80 26 L79 16 L69 22 Z" fill={PINK} />
        <ellipse cx="60" cy="42" rx="28" ry="24" fill={FUR} {...line} />
        <g clipPath={clip("head")}>
          {pattern === "calico" && (
            <>
              <ellipse cx="42" cy="27" rx="17" ry="13" fill={ORANGE} transform="rotate(-20 42 27)" />
              <ellipse cx="80" cy="24" rx="14" ry="10" fill={BLACK} transform="rotate(25 80 24)" />
            </>
          )}
          {/* a tuxedo's white muzzle and chin */}
          {pattern === "tuxedo" && (
            <path d="M60 37 C62.5 37 63.5 44 67 47 C72.5 49 75 54 73 59 C69 66 51 66 47 59 C45 54 47.5 49 53 47 C56.5 44 57.5 37 60 37 Z" fill={BELLY} />
          )}
        </g>
        <Gloss x={49} y={28.5} />
        {/* the forehead "M" of a tabby, and its cheek stripes; the tuxedo keeps a faint forehead */}
        {(tabby || pattern === "tuxedo") && <path d="M60 19 v6 M52 21 l1 5 M68 21 l-1 5" {...stripe} strokeWidth={2.5} />}
        {tabby && <path d="M33 39 l5.5 1.2 M32.5 44.5 l5 0 M87 39 l-5.5 1.2 M87.5 44.5 l-5 0" {...stripe} strokeWidth={1.8} />}
        <path d="M32 48 L20 45 M32 52 L20 53 M88 48 L100 45 M88 52 L100 53" fill="none" stroke="#B0B8C1" strokeWidth="1.5" strokeLinecap="round" />
        {/* the nose stays whatever the mouth does (smile, tape) */}
        <path d="M57 47 L63 47 L60 51 Z" fill="#FF8FA0" stroke="#FF8FA0" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="58.8" cy="47.3" r="0.8" fill="#fff" opacity="0.8" />
        <FrontFace
          state={state}
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
          <Pads x={46} y={89} />
          <Pads x={62} y={90} />
          <path d={sleepTail} fill="none" stroke={line.stroke} strokeWidth={8 + 2 * LINE_W} strokeLinecap="round" />
          <path d={sleepTail} fill="none" stroke={FUR_DARK} strokeWidth="8" strokeLinecap="round" />
          {rings(sleepTail, 8)}
          <path d="M70 95.5 L64 95.5" fill="none" stroke={BELLY} strokeWidth="7" strokeLinecap="round" />
        </>
      )}
    </Sprite>
  );
};
