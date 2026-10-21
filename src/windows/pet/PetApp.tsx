import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { createCalendar } from "../../calendar/calendar";
import { clickQuips, petMenuText, petQuips } from "../../messages/ko";
import { isFullscreenBusy, openSettings, quitApp, setHitRect } from "../../native";
import { CssSpriteAnim } from "../../pet/anim/CssSpriteAnim";
import type { PetState } from "../../pet/anim/types";
import { PetMenu } from "../../pet/PetMenu";
import { SpeechBubble } from "../../pet/SpeechBubble";
import { usePetState } from "../../pet/usePetState";
import { createScheduler } from "../../scheduler/scheduler";
import { loadPetPos, loadSettings, savePetPos } from "../../store";
import type { ReminderId, Settings } from "../../store/settings";
import { startAutoUpdate } from "../../updater";
import "../../tokens.css";
import "./PetApp.css";

const Anim = CssSpriteAnim;
/** `id` is set for recurring reminders (snooze / skip-today apply); calendar alerts have none */
type Pending = { id?: ReminderId; message: string };

export function PetApp() {
  const stage = useRef<HTMLDivElement>(null);
  const scheduler = useRef<ReturnType<typeof createScheduler>>(undefined);
  const [queue, setQueue] = useState<Pending[]>([]);
  const [activity, setActivity] = useState(0);
  const current = queue[0];
  const base = usePetState(!!current, activity);
  const [hover, setHover] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [quip, setQuip] = useState<string>();
  const [menu, setMenu] = useState(false);
  const pressAt = useRef<{ x: number; y: number } | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const quipTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const clickTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const state: PetState = clicked ? "click" : hover && base !== "nag" ? "hover" : base;

  // scheduler: needs settings first
  useEffect(() => {
    let settings: Settings | undefined;
    let s: ReturnType<typeof createScheduler> | undefined;
    let cal: ReturnType<typeof createCalendar> | undefined;
    loadSettings().then((loaded) => {
      settings = loaded;
      s = createScheduler({
        getSettings: () => settings!,
        getEnv: async () => ({ fullscreen: await isFullscreenBusy(), inMeeting: cal?.inMeeting() ?? false }),
        onFire: (id, message) => setQueue((q) => [...q, { id, message }]),
      });
      cal = createCalendar({
        getSettings: () => settings!,
        canAlert: () => s!.canNotify("calendar"),
        onAlert: (message) => setQueue((q) => [...q, { message }]),
      });
      scheduler.current = s;
      s.start();
      cal.start();
    });
    const unlistenQuiet = listen<number>("quiet", ({ payload }) => s?.quietFor(payload));
    const unlistenSettings = listen("settings-changed", async () => {
      settings = await loadSettings();
      s?.refresh();
      cal?.refresh();
    });
    return () => {
      s?.stop();
      cal?.stop();
      unlistenQuiet.then((f) => f());
      unlistenSettings.then((f) => f());
    };
  }, []);

  useEffect(() => (import.meta.env.DEV ? undefined : startAutoUpdate()), []);

  // click-through hit area follows the bubble + pet
  useEffect(() => {
    const el = stage.current!;
    const ro = new ResizeObserver(() => setHitRect(el.getBoundingClientRect()));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // restore and persist position
  useEffect(() => {
    const win = getCurrentWindow();
    let saveTimer: ReturnType<typeof setTimeout>;
    // shortcut: no on-screen check, a saved position on a removed monitor strands the pet; add with the tray "show" reset
    loadPetPos().then((p) => p && win.setPosition(new PhysicalPosition(p.x, p.y)));
    const unlisten = win.onMoved(({ payload }) => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => savePetPos({ x: payload.x, y: payload.y }), 500);
    });
    return () => {
      clearTimeout(saveTimer);
      unlisten.then((f) => f());
    };
  }, []);

  const close = (act?: (id: ReminderId) => void) => {
    if (act && current.id) act(current.id);
    setQueue((q) => q.slice(1));
    setActivity((n) => n + 1);
  };

  const say = (text: string) => {
    clearTimeout(quipTimer.current);
    setQuip(text);
    quipTimer.current = setTimeout(() => setQuip(undefined), 2500);
  };

  // a press that never moved is a click; moving past 4px turns it into a window drag
  const poke = () => {
    setActivity((n) => n + 1);
    setMenu(false);
    clearTimeout(clickTimer.current);
    setClicked(true);
    setClickCount((n) => n + 1); // remounts the sprite so a second click replays the hop
    clickTimer.current = setTimeout(() => setClicked(false), 500);
    say(clickQuips[Math.floor(Math.random() * clickQuips.length)]);
  };

  // the right-click menu is the only way to settings besides the tray, so mention it once
  useEffect(() => {
    if (localStorage.getItem("menuHintSeen")) return;
    const t = setTimeout(() => {
      say(petQuips.menuHint);
      localStorage.setItem("menuHintSeen", "1");
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const t = setTimeout(() => setMenu(false), 8000); // the menu is also closed on mouse leave
    return () => clearTimeout(t);
  }, [menu]);

  return (
    <div className="stage" ref={stage}>
      {current && (
        <SpeechBubble
          message={current.message}
          onOk={() => close()}
          onSnooze={current.id ? () => close((id) => scheduler.current?.snooze(id)) : undefined}
          onSkipToday={
            current.id
              ? () => {
                  close((id) => scheduler.current?.skipToday(id));
                  say(petQuips.skipped);
                }
              : undefined
          }
        />
      )}
      {!current && quip && <div className="toast">{quip}</div>}
      {menu && (
        <PetMenu
          onClose={() => setMenu(false)}
          items={[
            { label: petMenuText.settings, onSelect: openSettings },
            {
              label: petMenuText.quiet,
              onSelect: () => {
                scheduler.current?.quietFor(60);
                say(petQuips.quiet);
              },
            },
            { label: petMenuText.quit, onSelect: quitApp, danger: true },
          ]}
        />
      )}
      <div
        onMouseEnter={() => {
          setHover(true);
          setActivity((n) => n + 1);
        }}
        onMouseLeave={() => {
          setHover(false);
          pressAt.current = null;
        }}
        onMouseDown={(e) => {
          if (e.button === 0) pressAt.current = { x: e.clientX, y: e.clientY };
        }}
        onMouseMove={(e) => {
          const p = pressAt.current;
          if (!p || e.buttons !== 1 || Math.hypot(e.clientX - p.x, e.clientY - p.y) < 4) return;
          pressAt.current = null;
          setActivity((n) => n + 1);
          getCurrentWindow().startDragging();
        }}
        onMouseUp={(e) => {
          if (e.button !== 0 || !pressAt.current) return;
          pressAt.current = null;
          poke();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenu(true);
        }}
      >
        <Anim key={clickCount} state={state} />
      </div>
    </div>
  );
}
