import { ANCHORS } from "../outfit";
import { NeckLayer, OutfitLayer, SleepNeckLayer } from "./Outfit";
import { FrontFace, Gloss, INK, LINE_W, Paw, SLEEP_HEAD, headDy, outline } from "./FrontFace";
import { Sprite } from "./Sprite";
import type { PetAnimation } from "./types";
import { useBlink } from "./useBlink";

/** coat colours to pick from; the first is the default. Names live in messages/ko.ts colorNames. */
export const DOG_COLORS = [
  { id: "golden", FUR: "#F2C98A", PATCH: "#D79B5E", EAR: "#B9783F", MUZZLE: "#FFF1DC" },
  { id: "jindo", FUR: "#FAF4EA", PATCH: "#EADCC9", EAR: "#DCC6A8", MUZZLE: "#FFFFFF" },
  { id: "choco", FUR: "#B07E57", PATCH: "#8C5E3E", EAR: "#6E452C", MUZZLE: "#EED3B5" },
  { id: "black", FUR: "#4B4F57", PATCH: "#363940", EAR: "#2E3136", MUZZLE: "#F1E6D8", HALO: "#7C828C" },
];

// A puppy with floppy ears and an eye patch, sitting.
export const DogAnim: PetAnimation = ({ state, muted, outfit, color }) => {
  const blink = useBlink(state);
  const { FUR, PATCH, EAR, MUZZLE, HALO } = DOG_COLORS.find((c) => c.id === color) ?? DOG_COLORS[0];
  const line = { stroke: outline(FUR), strokeWidth: LINE_W };
  const tail = "M88 84 C106 82 112 66 106 54";
  const asleep = state === "sleep";
  // asleep: lying down, chin on the front paws, the tail curled round beside it
  const sleepTail = "M100 82 C112 84 112 95 98 95.5";
  return (
    <Sprite state={state} pet="dog">
      <ellipse cx="60" cy="94" rx={asleep ? 44 : 36} ry="4" fill="rgba(0,0,0,0.12)" />
      {asleep ? (
        <>
          <path d={sleepTail} fill="none" stroke={line.stroke} strokeWidth={8 + 2 * LINE_W} strokeLinecap="round" />
          <path d={sleepTail} fill="none" stroke={FUR} strokeWidth="8" strokeLinecap="round" />
          <path d="M102 95.2 L98 95.5" fill="none" stroke={MUZZLE} strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="71" cy="80" rx="33" ry="14" fill={FUR} {...line} />
        </>
      ) : (
        <>
          {/* the tail is a stroke, so its outline is a wider stroke under it; both wag together */}
          <g className="tail">
            <path d={tail} fill="none" stroke={line.stroke} strokeWidth={9 + 2 * LINE_W} strokeLinecap="round" />
            <path d={tail} fill="none" stroke={FUR} strokeWidth="9" strokeLinecap="round" />
            <path d="M107.4 58 C107.1 56.4 106.8 55.2 106 54" fill="none" stroke={MUZZLE} strokeWidth="8" strokeLinecap="round" />
          </g>
          <ellipse cx="60" cy="76" rx="30" ry="18" fill={FUR} {...line} />
          {/* the head's shadow on the body, and a fluffy chest */}
          <ellipse cx="60" cy="62" rx="22" ry="6" fill={PATCH} opacity="0.45" />
          <path d="M45 78 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 q3.75 -4.5 7.5 0 Q76 90 60 93 Q44 90 45 78 Z" fill={MUZZLE} />
          <Paw x={46} fill={MUZZLE} edge={line.stroke} />
          <Paw x={74} b fill={MUZZLE} edge={line.stroke} />
          <NeckLayer outfit={outfit} a={ANCHORS.dog} />
        </>
      )}
      {asleep && <SleepNeckLayer outfit={outfit} a={ANCHORS.dog} transform={SLEEP_HEAD} />}
      <g transform={asleep ? SLEEP_HEAD : `translate(0 ${headDy(state)})`}>
        <ellipse cx="60" cy="42" rx="26" ry="24" fill={FUR} {...line} />
        <Gloss x={48.5} y={26.5} rx={8} ry={3.6} />
        <ellipse cx="50" cy="40" rx="9" ry="8" fill={PATCH} />
        <ellipse cx="35" cy="40" rx="9" ry="16" transform="rotate(12 35 40)" fill={EAR} stroke={outline(EAR)} strokeWidth={LINE_W} />
        <ellipse cx="85" cy="40" rx="9" ry="16" transform="rotate(-12 85 40)" fill={EAR} stroke={outline(EAR)} strokeWidth={LINE_W} />
        <ellipse cx="60" cy="53" rx="14" ry="10" fill={MUZZLE} />
        {/* drawn before the face so the tape (quiet mode) lies over it */}
        <ellipse cx="60" cy="48" rx="5" ry="3.5" fill={INK} />
        <ellipse cx="58.2" cy="46.9" rx="1.7" ry="0.9" fill="#fff" opacity="0.75" />
        <FrontFace
          state={state}
          blink={blink}
          muted={muted}
          noBlush={outfit?.face === "cheeks"}
          halo={HALO}
          eyeY={40}
          mouthY={56}
          neutralMouth={
            <path d="M60 51.5 v3 M60 54.5 q-4 3 -8 0 M60 54.5 q4 3 8 0" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
          }
        />
        <OutfitLayer outfit={outfit} a={ANCHORS.dog} />
      </g>
      {asleep && (
        <>
          <ellipse cx="46" cy="90" rx="9" ry="4.6" fill={MUZZLE} {...line} />
          <ellipse cx="62" cy="91" rx="9" ry="4.6" fill={MUZZLE} {...line} />
        </>
      )}
    </Sprite>
  );
};
