import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { createCalendar } from "../../calendar/calendar";
import { petMenuText, petQuips, quipsFor } from "../../messages/ko";
import { isFullscreenBusy, openSettings, quitApp, setHitRect } from "../../native";
import { pets } from "../../pet/anim/pets";
import type { PetState } from "../../pet/anim/types";
import { PetMenu } from "../../pet/PetMenu";
import { SpeechBubble } from "../../pet/SpeechBubble";
import { usePetState } from "../../pet/usePetState";
import { createScheduler } from "../../scheduler/scheduler";
import { loadPetPos, loadSettings, savePetPos } from "../../store";
import type { Settings } from "../../store/settings";
import { startAutoUpdate } from "../../updater";
import "../../tokens.css";
import "./PetApp.css";

/** `id` is set for recurring reminders (snooze / skip-today apply); calendar alerts have none */
type Pending = { id?: string; message: string };

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
  const [dragging, setDragging] = useState(false);
  const state: PetState = dragging ? "drag" : clicked ? "click" : hover && base !== "nag" ? "hover" : base;
  const [petId, setPetId] = useState("turtle");
  const Anim = pets[petId] ?? pets.turtle;
  const [petScale, setPetScale] = useState(1);

  // scheduler: needs settings first
  useEffect(() => {
    let settings: Settings | undefined;
    let s: ReturnType<typeof createScheduler> | undefined;
    let cal: ReturnType<typeof createCalendar> | undefined;
    loadSettings().then((loaded) => {
      settings = loaded;
      setPetId(loaded.pet);
      setPetScale(loaded.petScale);
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
      setPetId(settings.pet);
      setPetScale(settings.petScale);
      s?.refresh();
      cal?.refresh();
    });
    // the settings window previews pet / size while the slider moves; cancel or close sends settings-changed to revert
    const unlistenPreview = listen<{ pet: string; petScale: number }>("pet-preview", ({ payload }) => {
      setPetId(payload.pet);
      setPetScale(payload.petScale);
    });
    return () => {
      s?.stop();
      cal?.stop();
      unlistenPreview.then((f) => f());
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
    let dragTimer: ReturnType<typeof setTimeout>;
    let ignoreUntil = Infinity; // the move that restores the saved position is not a drag
    // shortcut: no on-screen check, a saved position on a removed monitor strands the pet; add with the tray "show" reset
    loadPetPos().then(async (p) => {
      if (p) await win.setPosition(new PhysicalPosition(p.x, p.y));
      ignoreUntil = Date.now() + 500;
    });
    const unlisten = win.onMoved(({ payload }) => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => savePetPos({ x: payload.x, y: payload.y }), 500);
      // there is no mouse-up after startDragging, so "the window stopped moving" ends the drag
      if (Date.now() < ignoreUntil) return;
      setDragging(true);
      clearTimeout(dragTimer);
      dragTimer = setTimeout(() => setDragging(false), 250);
    });
    return () => {
      clearTimeout(saveTimer);
      clearTimeout(dragTimer);
      unlisten.then((f) => f());
    };
  }, []);

  const close = (act?: (id: string) => void) => {
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
    const quips = quipsFor(petId);
    say(quips[Math.floor(Math.random() * quips.length)]);
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
      {/* zoom (unlike transform) changes layout size, so the click-through hit rect follows it */}
      <div
        style={{ zoom: petScale }}
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
