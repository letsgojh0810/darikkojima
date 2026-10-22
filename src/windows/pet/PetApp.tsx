import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { createCalendar } from "../../calendar/calendar";
import type { DebugCmd } from "../../debug";
import { createMoments } from "../../greetings/moments";
import {
  calendarMessage,
  greetingMessage,
  momentMessage,
  oneOf,
  petMenuText,
  petQuips,
  quipsFor,
  reminderMessages,
} from "../../messages/ko";
import { isFullscreenBusy, openSettings, quitApp, setHitRect } from "../../native";
import { pets } from "../../pet/anim/pets";
import type { PetState } from "../../pet/anim/types";
import { LunchBubble } from "../../pet/LunchBubble";
import { NoticeBubble } from "../../pet/NoticeBubble";
import { addNotice, lunchTtl, nextExpiry, pruneNotices, setTtlOverride, type Notice } from "../../pet/notices";
import { PetMenu } from "../../pet/PetMenu";
import { usePetState } from "../../pet/usePetState";
import { createScheduler } from "../../scheduler/scheduler";
import { loadPetPos, loadSettings, savePetPos } from "../../store";
import type { ReminderId, Settings } from "../../store/settings";
import { startAutoUpdate } from "../../updater";
import "../../tokens.css";
import "./PetApp.css";

const GREET_GAP = 30 * 60_000; // restarting the app over and over does not greet over and over
const greetedRecently = () => Date.now() - Number(localStorage.getItem("lastGreetAt") ?? 0) < GREET_GAP;

export function PetApp() {
  const stage = useRef<HTMLDivElement>(null);
  const scheduler = useRef<ReturnType<typeof createScheduler>>(undefined);
  // Everything waiting is shown in ONE bubble (see pet/notices.ts); the lunch roulette is its own bubble and has priority.
  const [notices, setNotices] = useState<Notice[]>([]);
  const [lunch, setLunch] = useState<{ at: number } | null>(null);
  const [activity, setActivity] = useState(0);
  // only reminders put the pet in its nagging mood; greetings and the lunch bubble keep it friendly
  const base = usePetState(notices.some((n) => n.kind === "reminder"), activity);
  const addNote = (n: Omit<Notice, "at">) => setNotices((l) => addNotice(l, { ...n, at: Date.now() }, Date.now()));
  const showLunch = () => setLunch({ at: Date.now() });
  const [lunchMenus, setLunchMenus] = useState<string[]>([]);
  const [hover, setHover] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [quip, setQuip] = useState<string>();
  const [menu, setMenu] = useState(false);
  const pressAt = useRef<{ x: number; y: number } | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const quipTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const clickTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [dragging, setDragging] = useState(false);
  const [forced, setForced] = useState<PetState | null>(null); // dev-only: pins an animation so it can be looked at
  const state: PetState = forced ?? (dragging ? "drag" : clicked ? "click" : hover && base !== "nag" ? "hover" : base);
  const [petId, setPetId] = useState("turtle");
  const petIdRef = useRef(petId);
  petIdRef.current = petId;
  const Anim = pets[petId] ?? pets.turtle;
  const [petScale, setPetScale] = useState(1);

  // scheduler: needs settings first
  useEffect(() => {
    // StrictMode runs this effect twice in dev; the first run's async work must not start a second set of timers
    let cancelled = false;
    let settings: Settings | undefined;
    let s: ReturnType<typeof createScheduler> | undefined;
    let cal: ReturnType<typeof createCalendar> | undefined;
    let moments: ReturnType<typeof createMoments> | undefined;
    loadSettings().then((loaded) => {
      if (cancelled) return;
      settings = loaded;
      setPetId(loaded.pet);
      setPetScale(loaded.petScale);
      setLunchMenus(loaded.lunchMenus);
      s = createScheduler({
        getSettings: () => settings!,
        getEnv: async () => ({ fullscreen: await isFullscreenBusy(), inMeeting: cal?.inMeeting() ?? false }),
        onFire: (id, message) => addNote({ key: `r:${id}`, kind: "reminder", id, message }),
      });
      cal = createCalendar({
        getSettings: () => settings!,
        canAlert: () => s!.canNotify("calendar"),
        onAlert: (message) => addNote({ key: `c:${message}`, kind: "calendar", message }),
      });
      moments = createMoments({
        getSettings: () => settings!,
        canShow: () => s!.canNotify("greeting"),
        onMoment: (id) =>
          id === "lunch"
            ? showLunch()
            : addNote({ key: `h:${id}`, kind: "hello", message: momentMessage(id, new Date().getDay() === 5) }),
      });
      scheduler.current = s;
      s.start();
      const firstFetch = cal.start();
      moments.start();

      // greet on start, but wait (at most 5s) for the calendar so the first event can be named
      if (loaded.moments.greeting && !greetedRecently()) {
        localStorage.setItem("lastGreetAt", String(Date.now()));
        Promise.race([firstFetch, new Promise((done) => setTimeout(done, 5000))]).then(async () => {
          if (cancelled) return;
          if (await s!.canNotify("greeting")) {
            addNote({ key: "h:greeting", kind: "hello", message: greetingMessage(new Date(), cal!.nextEventToday()) });
          }
        });
      }
    });
    const unlistenQuiet = listen<number>("quiet", ({ payload }) => s?.quietFor(payload));
    const unlistenSettings = listen("settings-changed", async () => {
      settings = await loadSettings();
      setPetId(settings.pet);
      setPetScale(settings.petScale);
      setLunchMenus(settings.lunchMenus);
      s?.refresh();
      cal?.refresh();
      moments?.refresh();
    });
    // the settings window previews pet / size while the slider moves; cancel or close sends settings-changed to revert
    const unlistenPreview = listen<{ pet: string; petScale: number }>("pet-preview", ({ payload }) => {
      setPetId(payload.pet);
      setPetScale(payload.petScale);
    });
    // dev-only: the settings window's "테스트" tab plays behaviours on demand (see src/debug.ts)
    const unlistenDebug = import.meta.env.DEV
      ? listen<DebugCmd>("debug", ({ payload: c }) => {
          switch (c.type) {
            case "greeting":
              addNote({
                key: "h:greeting",
                kind: "hello",
                message: greetingMessage(
                  new Date(),
                  c.event
                    ? { title: c.event.title, start: new Date(c.event.start) }
                    : (cal?.nextEventToday() ?? { title: "주간회의", start: new Date(Date.now() + 3_600_000) }),
                ),
              });
              break;
            case "lunch":
              showLunch();
              break;
            case "moment":
              addNote({ key: `h:${c.id}`, kind: "hello", message: momentMessage(c.id, !!c.friday) });
              break;
            case "reminder":
              addNote({ key: `r:${c.id}`, kind: "reminder", id: c.id, message: oneOf(reminderMessages[c.id as ReminderId]) });
              break;
            case "calendar":
              addNote({ key: "c:test", kind: "calendar", message: calendarMessage(c.title ?? "주간회의", c.min ?? 10) });
              break;
            case "pile":
              // four at once: the bubble keeps three rows and the oldest reminder is pushed out
              for (const id of ["legs", "posture", "water", "stretch"] as const) {
                addNote({ key: `r:${id}`, kind: "reminder", id, message: reminderMessages[id][0] });
              }
              break;
            case "clear":
              setNotices([]);
              setLunch(null);
              break;
            case "ttl":
              setTtlOverride(c.ms);
              break;
            case "state":
              setForced(c.state);
              break;
            case "quip":
              say(oneOf(quipsFor(petIdRef.current)));
              break;
          }
        })
      : undefined;
    return () => {
      cancelled = true;
      s?.stop();
      cal?.stop();
      moments?.stop();
      unlistenDebug?.then((f) => f());
      unlistenPreview.then((f) => f());
      unlistenQuiet.then((f) => f());
      unlistenSettings.then((f) => f());
    };
  }, []);

  useEffect(() => (import.meta.env.DEV ? undefined : startAutoUpdate()), []);

  // one timer aimed at the soonest expiry (each row runs on its own clock, see pet/notices.ts)
  useEffect(() => {
    const times = [nextExpiry(notices), lunch ? lunch.at + lunchTtl() : undefined].filter((t): t is number => t !== undefined);
    if (!times.length) return;
    const t = setTimeout(() => {
      const now = Date.now();
      setNotices((l) => {
        const live = pruneNotices(l, now);
        return live.length === l.length ? l : live;
      });
      setLunch((l) => (l && l.at + lunchTtl() > now ? l : null));
    }, Math.max(0, Math.min(...times) - Date.now()) + 20);
    return () => clearTimeout(t);
  }, [notices, lunch]);

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

  const answered = () => setActivity((n) => n + 1);
  const done = (key: string) => {
    setNotices((l) => l.filter((n) => n.key !== key));
    answered();
  };
  const doneAll = () => {
    setNotices([]);
    answered();
  };
  const snoozeAll = () => {
    for (const n of notices) if (n.kind === "reminder" && n.id) scheduler.current?.snooze(n.id);
    doneAll();
  };
  const skipToday = () => {
    for (const n of notices) if (n.kind === "reminder" && n.id) scheduler.current?.skipToday(n.id);
    doneAll();
    say(oneOf(petQuips.skipped));
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
    say(oneOf(quipsFor(petId)));
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

  // the menu and a bubble never share the screen: while the menu is open the bubble steps aside (its timers keep running)
  const bubbleVisible = !menu;
  const showNotices = bubbleVisible && !lunch && notices.length > 0;

  return (
    <div className="stage" ref={stage}>
      {bubbleVisible && lunch && (
        <LunchBubble
          menus={lunchMenus}
          onTouch={() => setLunch({ at: Date.now() })}
          onClose={() => {
            setLunch(null);
            answered();
          }}
        />
      )}
      {showNotices && (
        <NoticeBubble notices={notices} onDone={done} onDoneAll={doneAll} onSnoozeAll={snoozeAll} onSkipToday={skipToday} />
      )}
      {!lunch && notices.length === 0 && quip && <div className="toast">{quip}</div>}
      {menu && (
        <PetMenu
          onClose={() => setMenu(false)}
          items={[
            { label: petMenuText.lunch, onSelect: showLunch },
            { label: petMenuText.settings, onSelect: openSettings },
            {
              label: petMenuText.quiet,
              onSelect: () => {
                scheduler.current?.quietFor(60);
                say(oneOf(petQuips.quiet));
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
