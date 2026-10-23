import { ANCHORS } from "../outfit";
import { NeckLayer, OutfitLayer, SleepNeckLayer } from "./Outfit";
import { FrontFace, Gloss, INK, LINE_W, Paw, headDy, outline } from "./FrontFace";
import { Sprite } from "./Sprite";
import type { PetAnimation } from "./types";
import { useBlink } from "./useBlink";

// the rabbit's head sits higher on its body than the others', so asleep it sinks a little less
const SLEEP_HEAD_RABBIT = "translate(-5 15) rotate(-8 60 46)";

/** coat colours to pick from; the first is the default. Names live in messages/ko.ts colorNames. */
export const RABBIT_COLORS = [
  { id: "snow", FUR: "#F2EBE2", SHADE: "#E4D9CB", BELLY: "#FFFFFF", PINK: "#FFB8C0" },
  { id: "brown", FUR: "#C8946A", SHADE: "#A97A52", BELLY: "#FBEBDD", PINK: "#F7AFA4" },
  { id: "ash", FUR: "#AEB6C3", SHADE: "#929CAB", BELLY: "#F2F4F8", PINK: "#FFB8C0" },
  { id: "beige", FUR: "#F2CB9A", SHADE: "#DDAF78", BELLY: "#FFF5E8", PINK: "#FFB3B0" },
];

// A rabbit with tall ears, sitting.
export const RabbitAnim: PetAnimation = ({ state, muted, outfit, color }) => {
  const blink = useBlink(state);
  const { FUR, SHADE, BELLY, PINK } = RABBIT_COLORS.find((c) => c.id === color) ?? RABBIT_COLORS[0];
  const line = { stroke: outline(FUR), strokeWidth: LINE_W };
  const asleep = state === "sleep";
  // asleep: a loaf with the ears laid back along it, chin on the front paws
  const ears: [number, number, number][] = asleep ? [[80, 30, 104], [83, 37, 118]] : [[46, 20, -8], [74, 20, 8]];
  return (
    <Sprite state={state} pet="rabbit">
      <ellipse cx="60" cy="94" rx={asleep ? 42 : 36} ry="4" fill="rgba(0,0,0,0.12)" />
      {asleep ? (
        <>
          <circle cx="100" cy="85" r="7" fill={BELLY} {...line} />
          <circle cx="98" cy="82.5" r="2.6" fill="#fff" opacity="0.35" />
          <ellipse cx="70" cy="80" rx="31" ry="14" fill={FUR} {...line} />
        </>
      ) : (
        <>
          {/* a cotton-white tail whatever the coat */}
          <circle cx="92" cy="84" r="7" fill={BELLY} {...line} />
          <circle cx="90" cy="81.5" r="2.6" fill="#fff" opacity="0.35" />
          <ellipse cx="60" cy="78" rx="29" ry="16" fill={FUR} {...line} />
          {/* the head's shadow on the body */}
          <ellipse cx="60" cy="66" rx="20" ry="5" fill={SHADE} opacity="0.8" />
          {/* a light, fluffy chest and paws, like the cat's and the dog's */}
          <path d="M45 79 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 Q76 90 60 93 Q44 90 45 79 Z" fill={BELLY} />
          <Paw x={46} fill={BELLY} edge={line.stroke} />
          <Paw x={74} b fill={BELLY} edge={line.stroke} />
          <NeckLayer outfit={outfit} a={ANCHORS.rabbit} />
        </>
      )}
      {asleep && <SleepNeckLayer outfit={outfit} a={ANCHORS.rabbit} transform={SLEEP_HEAD_RABBIT} />}
      <g transform={asleep ? SLEEP_HEAD_RABBIT : `translate(0 ${headDy(state)})`}>
        {ears.map(([x, y, deg]) => (
          <g key={x} transform={`rotate(${deg} ${x} ${y})`}>
            <ellipse cx={x} cy={y} rx="8" ry="17" fill={FUR} {...line} />
            <ellipse cx={x} cy={y + 2} rx="4" ry="11" fill={PINK} />
          </g>
        ))}
        <ellipse cx="60" cy="46" rx="26" ry="22" fill={FUR} {...line} />
        <Gloss x={50} y={32.5} rx={8.5} />
        {/* a pale snout patch around the nose and mouth */}
        <ellipse cx="60" cy="55.5" rx="9" ry="6.5" fill={BELLY} />
        {/* the nose stays whatever the mouth does (smile, tape) */}
        <ellipse cx="60" cy="52" rx="3" ry="2.2" fill={PINK} />
        <circle cx="59" cy="51.3" r="0.7" fill="#fff" opacity="0.8" />
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
      {asleep && (
        <>
          <ellipse cx="46" cy="90" rx="9" ry="4.6" fill={BELLY} {...line} />
          <ellipse cx="62" cy="91" rx="9" ry="4.6" fill={BELLY} {...line} />
        </>
      )}
    </Sprite>
  );
};
