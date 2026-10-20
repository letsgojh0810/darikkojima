import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { isFullscreenBusy, setHitRect } from "../../native";
import { CssSpriteAnim } from "../../pet/anim/CssSpriteAnim";
import { SpeechBubble } from "../../pet/SpeechBubble";
import { usePetState } from "../../pet/usePetState";
import { createScheduler } from "../../scheduler/scheduler";
import { loadPetPos, loadSettings, savePetPos } from "../../store";
import type { ReminderId, Settings } from "../../store/settings";
import "./PetApp.css";

const Anim = CssSpriteAnim;
type Pending = { id: ReminderId; message: string };

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
    loadSettings().then((loaded) => {
      settings = loaded;
      // dev-only until the settings window exists (step 5): make the legs reminder fire every minute
      if (import.meta.env.DEV) settings.reminders.legs.intervalMin = 1;
      s = createScheduler({
        getSettings: () => settings!,
        // shortcut: inMeeting is always false until the calendar source lands (step 6)
        getEnv: async () => ({ fullscreen: await isFullscreenBusy(), inMeeting: false }),
        onFire: (id, message) => setQueue((q) => [...q, { id, message }]),
      });
      scheduler.current = s;
      s.start();
    });
    const unlisten = listen<number>("quiet", ({ payload }) => s?.quietFor(payload));
    return () => {
      s?.stop();
      unlisten.then((f) => f());
    };
  }, []);

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
    act?.(current.id);
    setQueue((q) => q.slice(1));
    setActivity((n) => n + 1);
  };

  return (
    <div className="stage" ref={stage}>
      {current && (
        <SpeechBubble
          message={current.message}
          onOk={() => close()}
          onSnooze={() => close((id) => scheduler.current?.snooze(id))}
          onSkipToday={() => close((id) => scheduler.current?.skipToday(id))}
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
