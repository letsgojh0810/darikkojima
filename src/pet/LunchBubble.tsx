import { useEffect, useState } from "react";
import { lunchAskLine, lunchReply, lunchText } from "../messages/ko";
import "./SpeechBubble.css";

const SPIN_MS = 1200;
const TICK_MS = 80;

type Phase = { kind: "ask" } | { kind: "spin"; shown: string } | { kind: "result"; menu: string; line: string; showMenu: boolean };

const random = (menus: string[]) => menus[Math.floor(Math.random() * menus.length)];

/**
 * Lunch roulette: names flicker for about a second, then one stays. The more it is spun the more it teases (see lunchReply).
 * `onTouch` keeps the bubble's own timer fresh while the user is playing with it.
 */
export function LunchBubble({ menus, onTouch, onClose }: { menus: string[]; onTouch(): void; onClose(): void }) {
  const [phase, setPhase] = useState<Phase>({ kind: "ask" });
  const [spins, setSpins] = useState(0);
  const [question] = useState(() => lunchAskLine());

  useEffect(() => {
    if (phase.kind !== "spin") return;
    const flicker = setInterval(() => setPhase({ kind: "spin", shown: random(menus) }), TICK_MS);
    const stop = setTimeout(() => {
      clearInterval(flicker);
      const menu = random(menus);
      setPhase({ kind: "result", menu, ...lunchReply(menu, spins) });
    }, SPIN_MS);
    return () => {
      clearInterval(flicker);
      clearTimeout(stop);
    };
    // the phase object changes every tick; only entering or leaving the spin phase should restart the timers
  }, [phase.kind, menus, spins]);

  const spin = () => {
    onTouch();
    setSpins((n) => n + 1);
    setPhase({ kind: "spin", shown: random(menus) });
  };

  if (menus.length === 0) {
    return (
      <div className="bubble">
        <p>{lunchText.empty}</p>
        <button className="bubble-ok" onClick={onClose}>
          {lunchText.good}
        </button>
      </div>
    );
  }

  return (
    <div className="bubble">
      {phase.kind === "ask" && <p>{question}</p>}
      {phase.kind === "spin" && <p className="menu">{phase.shown}</p>}
      {phase.kind === "result" && (
        <>
          {phase.showMenu && <p className="menu">{phase.menu}</p>}
          <p>{phase.line}</p>
        </>
      )}

      {phase.kind === "ask" && (
        <button className="bubble-ok" onClick={spin}>
          {lunchText.pick}
        </button>
      )}
      {phase.kind === "spin" && (
        <button className="bubble-ok" disabled>
          …
        </button>
      )}
      {phase.kind === "result" && (
        <>
          <button className="bubble-ok" onClick={onClose}>
            {lunchText.good}
          </button>
          <div className="bubble-actions">
            <button onClick={spin}>{lunchText.again}</button>
          </div>
        </>
      )}
    </div>
  );
}
