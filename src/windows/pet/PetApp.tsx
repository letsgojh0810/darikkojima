import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { createCalendar } from "../../calendar/calendar";
import { isFullscreenBusy, setHitRect } from "../../native";
import { CssSpriteAnim } from "../../pet/anim/CssSpriteAnim";
import { SpeechBubble } from "../../pet/SpeechBubble";
import { usePetState } from "../../pet/usePetState";
import { createScheduler } from "../../scheduler/scheduler";
import { loadPetPos, loadSettings, savePetPos } from "../../store";
import type { ReminderId, Settings } from "../../store/settings";
import { startAutoUpdate } from "../../updater";
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
  const state = usePetState(!!current, activity);

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

  return (
    <div className="stage" ref={stage}>
      {current && (
        <SpeechBubble
          message={current.message}
          onOk={() => close()}
          onSnooze={current.id ? () => close((id) => scheduler.current?.snooze(id)) : undefined}
          onSkipToday={current.id ? () => close((id) => scheduler.current?.skipToday(id)) : undefined}
        />
      )}
      <div
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          setActivity((n) => n + 1);
          getCurrentWindow().startDragging();
        }}
      >
        <Anim state={state} />
      </div>
    </div>
  );
}
