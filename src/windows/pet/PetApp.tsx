import { useEffect, useRef, useState } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import { availableMonitors, currentMonitor, getCurrentWindow, PhysicalPosition, primaryMonitor } from "@tauri-apps/api/window";
import { createCalendar } from "../../calendar/calendar";
import type { DebugCmd } from "../../debug";
import { applyAppearance } from "../../theme";
import { createMoments, leaveStatus } from "../../greetings/moments";
import {
  calendarMessage,
  chatterLines,
  greetingMessage,
  itemGotMessage,
  itemNames,
  leaveMessage,
  levelUpMessage,
  reminderLine,
  secretMessage,
  momentMessage,
  oneOf,
  petNames,
  petMenuText,
  petQuips,
  quipsFor,
  reminderMessages,
  scheduleMessage,
  nextWeek,
  todayMessage,
  weekMessage,
} from "../../messages/ko";
import { idleSeconds, isFullscreenBusy, openSettings, quitApp, setHitRect } from "../../native";
import { pets } from "../../pet/anim/pets";
import type { PetState } from "../../pet/anim/types";
import { bringOnScreen, FORCE_WINDOW_MS, TOO_HIDDEN, visibleFraction, type Rect } from "../../pet/edges";
import { LunchBubble } from "../../pet/LunchBubble";
import { NoticeBubble } from "../../pet/NoticeBubble";
import { addNotice, lunchTtl, nextExpiry, pruneNotices, setTtlOverride, type Notice } from "../../pet/notices";
import { PetMenu } from "../../pet/PetMenu";
import { ITEMS, wearable } from "../../pet/outfit";
import { award, emptyProgress, LEVELS, levelOf, type Progress, type ProgressEvent } from "../../pet/progress";
import { newTitles } from "../../pet/titles";
import { usePetState } from "../../pet/usePetState";
import { createScheduler } from "../../scheduler/scheduler";
import { loadPetPos, loadProgress, loadSettings, savePetPos, saveProgress } from "../../store";
import { defaultSettings, type PetPreview, type ReminderId, type Settings } from "../../store/settings";
import { startAutoUpdate } from "../../updater";
import "../../tokens.css";
import "./PetApp.css";

const GREET_GAP = 30 * 60_000; // restarting the app over and over does not greet over and over
/**
 * no keyboard or mouse input for this long means the desk is empty: nothing is said, and the reminders start over on
 * return. Long enough not to fire while reading or listening in a call.
 */
const AWAY_AFTER_SEC = 10 * 60;
/** minutes between two "심심하네요" */
const CHATTER_MIN = 35;
const CHATTER_MAX = 80;
const greetedRecently = () => Date.now() - Number(localStorage.getItem("lastGreetAt") ?? 0) < GREET_GAP;

export function PetApp() {
  const stage = useRef<HTMLDivElement>(null);
  const scheduler = useRef<ReturnType<typeof createScheduler>>(undefined);
  // the right-click menu answers from these, so they live outside the start-up effect too
  const settingsRef = useRef<Settings>(undefined);
  const calRef = useRef<ReturnType<typeof createCalendar>>(undefined);
  // Everything waiting is shown in ONE bubble (see pet/notices.ts); the lunch roulette is its own bubble and has priority.
  const [notices, setNotices] = useState<Notice[]>([]);
  const [lunch, setLunch] = useState<{ at: number } | null>(null);
  const [activity, setActivity] = useState(0);
  // only reminders put the pet in its nagging mood; greetings and the lunch bubble keep it friendly
  const awake = usePetState(notices.some((n) => n.kind === "reminder"), activity);
  // read by the chatter timer, which outlives renders
  const sleepingRef = useRef(false);
  sleepingRef.current = awake === "sleep";
  const busyRef = useRef(false);
  busyRef.current = notices.length > 0 || !!lunch;

  // now and then the pet says it is bored; one that fell asleep wakes up for it. Held back like a reminder:
  // quiet mode, fullscreen, outside work hours, lunch and meetings.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      t = setTimeout(tick, (CHATTER_MIN + Math.random() * (CHATTER_MAX - CHATTER_MIN)) * 60_000);
    };
    const tick = async () => {
      next();
      if (!settingsRef.current?.moments.chatter || busyRef.current || !(await scheduler.current?.canNotify("reminder"))) return;
      const woke = sleepingRef.current;
      setActivity((n) => n + 1); // wakes it
      say(oneOf(woke ? chatterLines.woke : chatterLines.awake), 8000);
    };
    next();
    return () => clearTimeout(t);
  }, []);

  // "조용히 하기" has no end time, so it is remembered across restarts and the pet wears an X of tape over its mouth the whole time
  const [quiet, setQuietState] = useState(() => localStorage.getItem("quiet") === "1");
  const quietRef = useRef(quiet);
  const setQuiet = (on: boolean) => {
    quietRef.current = on;
    setQuietState(on);
    scheduler.current?.setQuiet(on);
    localStorage.setItem("quiet", on ? "1" : "0");
    emit("quiet-state", on);
    say(oneOf(on ? petQuips.quiet : petQuips.resumed));
  };
  const base = awake;
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
  const [edgeWorry, setEdgeWorry] = useState(false);
  const petRef = useRef<HTMLDivElement>(null);
  const [forced, setForced] = useState<PetState | null>(null); // dev-only: pins an animation so it can be looked at
  const state: PetState = forced ?? (dragging ? (edgeWorry ? "nag" : "drag") : clicked ? "click" : hover && base !== "nag" ? "hover" : base);
  const [petId, setPetId] = useState(defaultSettings.pet);
  const petIdRef = useRef(petId);
  petIdRef.current = petId;
  const Anim = pets[petId] ?? pets[defaultSettings.pet];
  const [petScale, setPetScale] = useState(1);
  const [petProfiles, setPetProfiles] = useState<Settings["petProfiles"]>({});
  const [petLabel, setPetLabel] = useState<Settings["petLabel"]>("both");
  const petName = petProfiles[petId]?.name.trim() || petNames[petId] || "";
  const nameRef = useRef(petName);
  nameRef.current = petName;

  // closeness: kept in a ref too, because the scheduler callbacks were created on the first render
  const [progress, setProgress] = useState<Progress | null>(null);
  const progressRef = useRef<Progress | null>(null);
  const level = progress ? levelOf(progress.exp).level : 1;
  const levelRef = useRef(level);
  levelRef.current = level;
  // every change goes through here: it saves, and announces a level-up, a found secret and any clothes that just opened
  const commit = (next: Progress) => {
    const before = progressRef.current;
    if (!before) return;
    const fresh = newTitles(next);
    const after = fresh.length ? { ...next, titles: [...next.titles, ...fresh] } : next;
    progressRef.current = after;
    setProgress(after);
    saveProgress(after);
    const was = levelOf(before.exp).level;
    const lv = levelOf(after.exp).level;
    if (lv > was) addNote({ key: "h:levelup", kind: "hello", message: levelUpMessage(lv, nameRef.current) });
    // a secret's line already hands over its item, so only the level items are announced, as one line
    for (const id of fresh) addNote({ key: `h:secret:${id}`, kind: "hello", message: secretMessage(id) });
    const opened = ITEMS.filter((it) => it.level && it.level > was && it.level <= lv);
    if (opened.length) addNote({ key: "h:items", kind: "hello", message: itemGotMessage(opened.map((it) => itemNames[it.id] ?? it.id)) });
  };
  /** `id`: the reminder answered, for "done" */
  const gain = (e: ProgressEvent, id?: string) => {
    if (progressRef.current) commit(award(progressRef.current, e, new Date(), id));
  };

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
      settingsRef.current = loaded;
      setPetId(loaded.pet);
      setPetScale(loaded.petScale);
      setLunchMenus(loaded.lunchMenus);
      setPetProfiles(loaded.petProfiles);
      setPetLabel(loaded.petLabel);
      applyAppearance(loaded.theme, loaded.accent);      loadProgress().then((p) => {
        if (cancelled) return;
        progressRef.current = p;
        setProgress(p);
      });
      s = createScheduler({
        getSettings: () => settings!,
        getEnv: async () => ({
          fullscreen: await isFullscreenBusy(),
          inMeeting: cal?.inMeeting() ?? false,
          away: (await idleSeconds()) >= AWAY_AFTER_SEC,
        }),
        onFire: (id, message) => {
          // from Lv.5 the pet sometimes says it in its closer tone
          addNote({ key: `r:${id}`, kind: "reminder", id, message: reminderLine(id, levelRef.current) ?? message });
          gain("fired");
        },
      });
      cal = createCalendar({
        getSettings: () => settings!,
        canAlert: () => s!.canNotify("calendar"),
        onAlert: (message) => {
          addNote({ key: `c:${message}`, kind: "calendar", message });
          gain("calendar");
        },
      });
      moments = createMoments({
        getSettings: () => settings!,
        canShow: () => s!.canNotify("greeting"),
        onMoment: (id) => {
          if (id === "lunch") return showLunch();
          addNote({ key: `h:${id}`, kind: "hello", message: momentMessage(id, new Date().getDay() === 5) });
          if (id === "goodbye") gain("goodbye");
        },
      });
      scheduler.current = s;
      calRef.current = cal;
      s.setQuiet(quietRef.current);
      emit("quiet-state", quietRef.current); // the tray label starts out right
      s.start();
      const firstFetch = cal.start();
      moments.start();

      // greet on start, and/or list today's events, but wait (at most 5s) for the calendar so events can be named
      const greet = loaded.moments.greeting;
      const digest = loaded.calendarDigest;
      if ((greet || digest) && !greetedRecently()) {
        localStorage.setItem("lastGreetAt", String(Date.now()));
        Promise.race([firstFetch, new Promise((done) => setTimeout(done, 5000))]).then(async () => {
          if (cancelled || !(await s!.canNotify("greeting"))) return;
          const left = digest ? cal!.eventsLeftToday() : [];
          if (greet) {
            // the list below names the first event already, so the greeting does not
            const first = left.length ? undefined : cal!.nextEventToday();
            addNote({ key: "h:greeting", kind: "hello", message: greetingMessage(new Date(), first, Math.random, levelRef.current) });
            gain("greet");
          }
          if (left.length) addNote({ key: "h:today", kind: "hello", message: todayMessage(left) });
        });
      }
    });
    const unlistenQuiet = listen("quiet-toggle", () => setQuiet(!quietRef.current));
    // "친밀도 초기화" in the settings window: start over; nothing is announced
    const unlistenReset = listen("progress-reset", () => {
      const p = emptyProgress(new Date());
      progressRef.current = p;
      setProgress(p);
      saveProgress(p);
    });
    // "모두 초기화": on top of the above, forget quiet mode and the small things remembered in localStorage
    const unlistenFactory = listen("factory-reset", () => {
      localStorage.clear();
      quietRef.current = false;
      setQuietState(false);
      scheduler.current?.setQuiet(false);
      emit("quiet-state", false);
      setNotices([]);
      setLunch(null);
    });
    const unlistenSettings = listen("settings-changed", async () => {
      settings = await loadSettings();
      settingsRef.current = settings;
      setPetId(settings.pet);
      setPetScale(settings.petScale);
      setLunchMenus(settings.lunchMenus);
      setPetProfiles(settings.petProfiles);
      setPetLabel(settings.petLabel);
      applyAppearance(settings.theme, settings.accent);
      s?.refresh();
      cal?.refresh();
      moments?.refresh();
    });
    // the settings window previews pet / size while the slider moves; cancel or close sends settings-changed to revert
    const unlistenPreview = listen<PetPreview>("pet-preview", ({ payload }) => {
      setPetId(payload.pet);
      setPetScale(payload.petScale);
      setPetProfiles(payload.petProfiles);
      setPetLabel(payload.petLabel);
      applyAppearance(payload.theme, payload.accent);
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
              say(oneOf(quipsFor(petIdRef.current, levelRef.current, progressRef.current?.totals)));
              break;
            case "chatter":
              setActivity((n) => n + 1);
              say(oneOf(c.woke ? chatterLines.woke : chatterLines.awake), 8000);
              break;
            case "unlockAll": {
              const p = progressRef.current;
              if (!p) break;
              const done = { ...p.totals.done, water: 100, posture: 50, legs: 100, stretch: 50 };
              commit({ ...p, exp: LEVELS[LEVELS.length - 1], totals: { ...p.totals, done, streak: 30, spinDays: 10, goodbyes: 20, clicks: 500, calendar: 30 } });
              break;
            }
            case "exp":
              if (progressRef.current) commit({ ...progressRef.current, exp: progressRef.current.exp + c.amount });
              break;
            case "level":
              if (progressRef.current) commit({ ...progressRef.current, exp: LEVELS[c.level - 1] ?? 0 });
              break;
            case "levelUp":
              addNote({ key: "h:levelup", kind: "hello", message: levelUpMessage(levelOf(progressRef.current?.exp ?? 0).level, nameRef.current) });
              break;
            case "pet":
              setPetId(c.id);
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
      unlistenReset.then((f) => f());
      unlistenFactory.then((f) => f());
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

  // click-through hit area: the bubble + pet, widened to take in a menu flyout that sticks out beside them
  useEffect(() => {
    const el = stage.current!;
    const update = () => {
      const rects = [el, ...el.querySelectorAll(".flyout")].map((e) => e.getBoundingClientRect());
      const left = Math.min(...rects.map((r) => r.left));
      const top = Math.min(...rects.map((r) => r.top));
      setHitRect(new DOMRect(left, top, Math.max(...rects.map((r) => r.right)) - left, Math.max(...rects.map((r) => r.bottom)) - top));
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const mo = new MutationObserver(update); // a flyout opening does not resize the stage
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  // "펫 위치 초기화" (tray / settings): back to the bottom right of the main monitor, just above the taskbar; onMoved saves it
  const resetPosition = async () => {
    const win = getCurrentWindow();
    const mon = (await primaryMonitor()) ?? (await currentMonitor());
    if (!mon) return;
    const s = mon.scaleFactor;
    const size = await win.outerSize();
    const { position: wp, size: ws } = mon.workArea; // the screen minus the taskbar, wherever the taskbar is
    const petCenterX = wp.x + ws.width - 140 * s;
    const petBottom = wp.y + ws.height - 16 * s;
    // the pet sits at the bottom centre of its (wider, transparent) window, 24px above the window edge
    await win.setPosition(new PhysicalPosition(Math.round(petCenterX - size.width / 2), Math.round(petBottom - size.height + 24 * s)));
    say(oneOf(petQuips.found));
  };
  const resetRef = useRef(resetPosition);
  resetRef.current = resetPosition;
  useEffect(() => {
    const unlisten = listen("reset-position", () => resetRef.current());
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  // a menu group opens toward the middle of the screen the pet is on, so it is never cut off at the edge
  const [menuSide, setMenuSide] = useState<"left" | "right">("right");
  const openMenu = async () => {
    setMenu(true);
    const win = getCurrentWindow();
    const [pos, size, mon] = await Promise.all([win.outerPosition(), win.outerSize(), currentMonitor()]);
    if (mon) setMenuSide(pos.x + size.width / 2 > mon.position.x + mon.size.width / 2 ? "left" : "right");
  };

  // restore and persist position; keep the pet from being dropped (mostly) off every screen
  useEffect(() => {
    const win = getCurrentWindow();
    let saveTimer: ReturnType<typeof setTimeout>;
    let dragTimer: ReturnType<typeof setTimeout>;
    let ignoreUntil = Infinity; // the move that restores the saved position is not a drag
    let moving = false;
    let lastPush = 0;
    let at = { x: 0, y: 0 };
    let screens: Rect[] = [];
    const loadScreens = async () => {
      screens = (await availableMonitors()).map((m) => ({
        x: m.workArea.position.x,
        y: m.workArea.position.y,
        w: m.workArea.size.width,
        h: m.workArea.size.height,
      }));
    };
    // the pet's body (not the bubble or the label) in screen pixels, for a window whose top-left is (x, y)
    const petRectAt = (x: number, y: number): Rect => {
      const r = petRef.current!.getBoundingClientRect();
      const dpr = window.devicePixelRatio;
      return { x: x + r.left * dpr, y: y + r.top * dpr, w: r.width * dpr, h: r.height * dpr };
    };
    const tooHidden = () => screens.length > 0 && visibleFraction(petRectAt(at.x, at.y), screens) < TOO_HIDDEN;

    const slideBy = async (dx: number, dy: number) => {
      const from = at;
      ignoreUntil = Date.now() + 1000; // a slide is not a drag
      for (let i = 1; i <= 12; i++) {
        const e = 1 - (1 - i / 12) ** 3; // ease out
        await win.setPosition(new PhysicalPosition(Math.round(from.x + dx * e), Math.round(from.y + dy * e)));
        await new Promise((done) => setTimeout(done, 16));
      }
    };

    // dropped too far into a corner: slide back and complain; dropped there again soon after: give in
    const onDrop = () => {
      if (!tooHidden()) return;
      if (Date.now() - lastPush < FORCE_WINDOW_MS) {
        lastPush = 0;
        say(oneOf(petQuips.edgeGiveUp));
        return;
      }
      lastPush = Date.now();
      const pet = petRectAt(at.x, at.y);
      const to = bringOnScreen(pet, screens, 8 * window.devicePixelRatio);
      say(oneOf(petQuips.edgeNo));
      slideBy(to.x - pet.x, to.y - pet.y);
    };

    loadScreens();
    loadPetPos().then(async (p) => {
      if (p) await win.setPosition(new PhysicalPosition(p.x, p.y));
      ignoreUntil = Date.now() + 500;
    });
    const unlisten = win.onMoved(({ payload }) => {
      at = { x: payload.x, y: payload.y };
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => savePetPos(at), 500);
      // there is no mouse-up after startDragging, so "the window stopped moving" ends the drag
      if (Date.now() < ignoreUntil) return;
      if (!moving) loadScreens(); // monitors may have been plugged in or out since the last drag
      moving = true;
      setDragging(true);
      setEdgeWorry(tooHidden()); // the pet looks uneasy while it is being pushed into the corner
      clearTimeout(dragTimer);
      dragTimer = setTimeout(() => {
        moving = false;
        setDragging(false);
        setEdgeWorry(false);
        onDrop();
      }, 250);
    });
    return () => {
      clearTimeout(saveTimer);
      clearTimeout(dragTimer);
      unlisten.then((f) => f());
    };
  }, []);

  const answered = () => setActivity((n) => n + 1);
  // only "했어요" on a reminder earns closeness; snoozing or skipping just closes
  const done = (key: string) => {
    const n = notices.find((x) => x.key === key);
    if (n?.kind === "reminder") gain("done", n.id);
    setNotices((l) => l.filter((n) => n.key !== key));
    answered();
  };
  const clearAll = () => {
    setNotices([]);
    answered();
  };
  const doneAll = () => {
    for (const n of notices) if (n.kind === "reminder") gain("done", n.id);
    clearAll();
  };
  const snoozeAll = () => {
    for (const n of notices) if (n.kind === "reminder" && n.id) scheduler.current?.snooze(n.id);
    clearAll();
  };
  const skipToday = () => {
    for (const n of notices) if (n.kind === "reminder" && n.id) scheduler.current?.skipToday(n.id);
    clearAll();
    say(oneOf(petQuips.skipped));
  };

  /** `ms`: how long it stays; longer when the pet speaks first and the user may not be looking */
  const say = (text: string, ms = 2500) => {
    clearTimeout(quipTimer.current);
    setQuip(text);
    quipTimer.current = setTimeout(() => setQuip(undefined), ms);
  };

  // a press that never moved is a click; moving past 4px turns it into a window drag
  const poke = () => {
    setActivity((n) => n + 1);
    setMenu(false);
    clearTimeout(clickTimer.current);
    setClicked(true);
    setClickCount((n) => n + 1); // remounts the sprite so a second click replays the hop
    clickTimer.current = setTimeout(() => setClicked(false), 500);
    say(oneOf(quipsFor(petId, level, progress?.totals)));
    gain("click");
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
          onSpin={() => gain("spin")}
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
          side={menuSide}
          onClose={() => setMenu(false)}
          items={[
            // asking the pet: one level down, so the menu stays short as more requests are added
            {
              label: petMenuText.ask,
              children: [
                { label: petMenuText.lunch, onSelect: showLunch },
                {
                  label: petMenuText.leave,
                  onSelect: () => {
                    if (settingsRef.current) {
                      addNote({ key: "h:ask-leave", kind: "hello", message: leaveMessage(leaveStatus(new Date(), settingsRef.current)) });
                    }
                  },
                },
                {
                  label: petMenuText.schedule,
                  onSelect: () =>
                    addNote({
                      key: "h:ask-schedule",
                      kind: "hello",
                      message: scheduleMessage(calRef.current?.eventsLeftToday() ?? [], (settingsRef.current?.icsUrls.length ?? 0) > 0),
                    }),
                },
                {
                  label: petMenuText.week,
                  onSelect: () =>
                    addNote({
                      key: "h:ask-week",
                      kind: "hello",
                      message: weekMessage(calRef.current?.eventsBetween(...nextWeek(new Date())) ?? [], (settingsRef.current?.icsUrls.length ?? 0) > 0),
                    }),
                },
              ],
            },
            // the app itself
            { label: quiet ? petMenuText.quietOff : petMenuText.quietOn, divider: true, onSelect: () => setQuiet(!quiet) },
            { label: petMenuText.settings, onSelect: openSettings },
            { label: petMenuText.quit, onSelect: quitApp, danger: true },
          ]}
        />
      )}
      {/* zoom (unlike transform) changes layout size, so the click-through hit rect follows it */}
      <div
        ref={petRef}
        style={{ zoom: petScale, position: "relative" }}
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
          openMenu();
        }}
      >
        {/* a dev run (`npm run app`) wears a tag so it is never mistaken for the installed app */}
        {import.meta.env.DEV && <div className="dev-badge">DEV</div>}
        <Anim key={clickCount} state={state} muted={quiet} outfit={wearable(petProfiles[petId]?.outfit, level, progress?.titles ?? [])} color={petProfiles[petId]?.color} />
      </div>
      {/* keyed by level so the tag pops once when the level goes up */}
      {petLabel !== "off" && progress && (
        <div className="pet-label" key={level}>
          {petLabel !== "name" && <span className="lv">Lv.{level}</span>}
          {petLabel !== "level" && <span>{petName}</span>}
        </div>
      )}
    </div>
  );
}
