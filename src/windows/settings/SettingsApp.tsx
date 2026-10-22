import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import { getVersion } from "@tauri-apps/api/app";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { openUrl } from "@tauri-apps/plugin-opener";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { checkIcs, type IcsCheck } from "../../calendar/IcsSource";
import { isGoogleCalendarPage, normalizeIcsUrl } from "../../calendar/url";
import {
  accentNames,
  dayLabels,
  defaultLunchMenus,
  devText,
  itemNames,
  petNames,
  reminderLabels,
  settingsText as t,
  colorNames,
  secretHints,
  slotNames,
  unlockHint,
} from "../../messages/ko";
import { DevPanel } from "./DevPanel";
import { loadProgress, loadSettings, saveSettings } from "../../store";
import { isUnlocked, ITEMS, SLOTS, wearable, type Slot } from "../../pet/outfit";
import { emptyProgress, levelOf, type Progress } from "../../pet/progress";
import { defaultSettings, withProfile, type CustomReminder, type PetPreview, type ReminderId, type Settings } from "../../store/settings";
import { petColors, petIds, pets } from "../../pet/anim/pets";
import { ACCENTS, applyAppearance, type ThemeMode } from "../../theme";
import "../../tokens.css";
import "./SettingsApp.css";

const ids = Object.keys(reminderLabels) as ReminderId[];
const REPO = "https://github.com/letsgojh0810/darikkojima";
/** Monday first; the stored values stay Date#getDay (0 = Sunday). */
const dayOrder = [1, 2, 3, 4, 5, 6, 0];
/** Add a tab here and a matching `tab === id` block below; the footer's 저장/취소 covers remind and talk, the other tabs save live. */
const tabs = [
  { id: "remind", label: t.tabRemind },
  { id: "calendar", label: t.tabCalendar },
  { id: "talk", label: t.tabTalk },
  { id: "pet", label: t.tabPet },
  { id: "grow", label: t.tabGrow },
  { id: "general", label: t.tabGeneral },
  { id: "dev", label: devText.tab },
] as const;
type TabId = (typeof tabs)[number]["id"];
/** the test tab only exists when running `npm run tauri dev` */
const visibleTabs = tabs.filter((x) => x.id !== "dev" || import.meta.env.DEV);

function Switch({ checked, label, onChange }: { checked: boolean; label: string; onChange(v: boolean): void }) {
  return (
    <label className="switch">
      <input type="checkbox" role="switch" aria-label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
    </label>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      <div className="group">{children}</div>
    </section>
  );
}

/** `stack` puts the control under the label at full width (time ranges would be clipped beside it). */
function Row({ label, desc, stack, ellipsis, children }: { label?: string; desc?: string; stack?: boolean; ellipsis?: boolean; children?: ReactNode }) {
  return (
    <div className={stack ? "row stack" : "row"}>
      <div className="text">
        {label && <div className={ellipsis ? "label ellipsis" : "label"} title={ellipsis ? label : undefined}>{label}</div>}
        {desc && <div className="desc">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

/** Uncontrolled number box that commits on blur or Enter, so the field can be emptied while typing. */
function NumberField({ value, min, max, onCommit }: { value: number; min: number; max: number; onCommit(n: number): void }) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      title={`${min}~${max}`}
      key={value}
      defaultValue={value}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      onBlur={(e) => {
        const n = Math.floor(Number(e.target.value));
        if (n >= min && n <= max) onCommit(n);
        else e.target.value = String(value);
      }}
    />
  );
}

function TimeRange({ start, end, onChange }: { start: string; end: string; onChange(start: string, end: string): void }) {
  return (
    <div className="range">
      <input type="time" value={start} onChange={(e) => e.target.value && onChange(e.target.value, end)} />
      <span>~</span>
      <input type="time" value={end} onChange={(e) => e.target.value && onChange(start, e.target.value)} />
    </div>
  );
}

export function SettingsApp() {
  // edits stay in this draft until 저장; closing the window or 취소 throws them away (pet and grow tabs excepted, see below)
  const [s, setS] = useState<Settings>();
  const [saved, setSaved] = useState<{ s: Settings }>();
  const [auto, setAuto] = useState(false);
  const [url, setUrl] = useState("");
  const [newCalName, setNewCalName] = useState("");
  /** the calendar whose name is being edited (by URL) */
  const [editingCal, setEditingCal] = useState<string | null>(null);
  const [badUrl, setBadUrl] = useState<string>();
  const [newText, setNewText] = useState("");
  const [newMenu, setNewMenu] = useState("");
  const [tab, setTab] = useState<TabId>("remind");
  const [version, setVersion] = useState("");
  useEffect(() => {
    getVersion().then(setVersion);
  }, []);
  const [checks, setChecks] = useState<Record<string, IcsCheck | "busy">>({});
  const check = async (u: string) => {
    setChecks((m) => ({ ...m, [u]: "busy" }));
    const r = await checkIcs(u);
    setChecks((m) => ({ ...m, [u]: r }));
  };
  // opening the calendar tab checks every address once, so the upcoming list fills itself
  useEffect(() => {
    if (tab === "calendar") s?.icsUrls.filter((u) => !checks[u]).forEach(check);
  }, [tab]);

  // closing without saving (X or 취소) tells the pet window to drop the preview and reload what is stored
  useEffect(() => {
    const unlisten = getCurrentWindow().onCloseRequested(() => emit("settings-changed"));
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  // read-only here: closeness is earned in the pet window, which sends every change
  const [progress, setProgress] = useState<Progress>();
  useEffect(() => {
    loadProgress().then(setProgress);
    const unlisten = listen<Progress>("progress-changed", (e) => setProgress(e.payload));
    return () => {
      unlisten.then((f) => f());
    };
  }, []);
  const lv = levelOf(progress?.exp ?? 0);
  const titles = progress?.titles ?? [];
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const [slot, setSlot] = useState<Slot>("head");
  const [hoverPet, setHoverPet] = useState<string | null>(null);
  const barPct = lv.max ? 100 : (lv.into / lv.need) * 100;
  const Preview = pets[s?.pet ?? ""] ?? pets.cat;

  useEffect(() => {
    Promise.all([loadSettings(), isEnabled()]).then(([loaded, on]) => {
      setS(loaded);
      setAuto(on);
      setSaved({ s: loaded });
    });
  }, []);

  // the general, pet and grow tabs have no 저장: what is picked there shows at once (on the pet too) and is stored,
  // leaving the other tabs' unsaved edits alone
  const preview: PetPreview | undefined = s && {
    pet: s.pet,
    petScale: s.petScale,
    petProfiles: s.petProfiles,
    petLabel: s.petLabel,
    theme: s.theme,
    accent: s.accent,
  };
  const previewKey = JSON.stringify(preview ?? null);
  useEffect(() => {
    if (!preview || !saved) return;
    applyAppearance(preview.theme, preview.accent);
    emit("pet-preview", preview);
    const next = { ...saved.s, ...preview };
    if (JSON.stringify(next) === JSON.stringify(saved.s)) return;
    saveSettings(next);
    setSaved({ ...saved, s: next });
    // previewKey stands for the preview's content, which is what should trigger a resend
  }, [previewKey, !!saved]);
  if (!s || !saved) return null;
  const live = tab === "general" || tab === "calendar" || tab === "pet" || tab === "grow";
  const calName = (u: string) => s.icsNames[u]?.trim() || new URL(u).host;
  const upcoming = s.icsUrls
    .flatMap((u) => {
      const c = checks[u];
      return c && c !== "busy" && c.ok ? c.events.map((e) => ({ e, cal: u })) : [];
    })
    .sort((a, b) => a.e.start.getTime() - b.e.start.getTime());

  const update = setS;
  /**
   * Applies a change and stores it at once, leaving other tabs' unsaved edits alone (the calendar tab works this way: a
   * calendar added there and then left behind on another tab used to be lost). `notify` makes the pet window reload.
   */
  const commitNow = (patch: Partial<Settings>, notify = true) => {
    update({ ...s, ...patch });
    const next = { ...saved.s, ...patch };
    setSaved({ s: next });
    saveSettings(next).then(() => {
      if (notify) emit("settings-changed");
    });
  };
  /**
   * 모두 초기화: settings back to the defaults, and the pet window clears what it owns (closeness, position, quiet mode,
   * the little things remembered in localStorage). Autostart is a Windows setting and stays as it is.
   */
  const resetAll = async () => {
    const fresh = { ...defaultSettings };
    await saveSettings(fresh);
    update(fresh);
    setSaved({ s: fresh });
    setProgress(emptyProgress(new Date()));
    setChecks({});
    setConfirmAll(false);
    await emit("progress-reset");
    await emit("factory-reset");
    await emit("reset-position");
    await emit("settings-changed");
  };

  // a system setting, applied the moment it is flipped like everything else on the general tab
  const setAutostart = async (on: boolean) => {
    await (on ? enable() : disable());
    setAuto(on);
  };
  const dirty = JSON.stringify(s) !== JSON.stringify(saved.s) || !!url.trim() || !!newText.trim() || !!newMenu.trim();

  const withMenu = (list: string[]) => {
    const m = newMenu.trim();
    return m && !list.includes(m) ? [...list, m] : list;
  };
  const addMenu = () => {
    update({ ...s, lunchMenus: withMenu(s.lunchMenus) });
    setNewMenu("");
  };

  const newCustom = (): CustomReminder[] => {
    const text = newText.trim();
    return text ? [...s.custom, { id: crypto.randomUUID(), text, enabled: true, intervalMin: 30 }] : s.custom;
  };
  const addCustom = () => {
    update({ ...s, custom: newCustom() });
    setNewText("");
  };
  const setCustom = (id: string, patch: Partial<CustomReminder>) =>
    update({ ...s, custom: s.custom.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  /** the typed calendar (with its name, if one was given) added to the list; nothing when the address is not usable */
  const withCalendar = (u: string | null) =>
    !u || isGoogleCalendarPage(u)
      ? {}
      : {
          icsUrls: s.icsUrls.includes(u) ? s.icsUrls : [...s.icsUrls, u],
          icsNames: newCalName.trim() ? { ...s.icsNames, [u]: newCalName.trim() } : s.icsNames,
        };

  const save = async () => {
    // text typed but not yet added would be lost silently, so take it along
    const next = { ...s, custom: newCustom(), lunchMenus: withMenu(s.lunchMenus), ...withCalendar(normalizeIcsUrl(url)) };
    await saveSettings(next);
    await emit("settings-changed");
    await getCurrentWindow().close();
  };
  const setReminder = (id: ReminderId, patch: Partial<Settings["reminders"][ReminderId]>) =>
    update({ ...s, reminders: { ...s.reminders, [id]: { ...s.reminders[id], ...patch } } });

  const addUrl = () => {
    const u = normalizeIcsUrl(url);
    setBadUrl(!u ? t.badUrl : isGoogleCalendarPage(u) ? t.googlePage : undefined);
    if (!u || isGoogleCalendarPage(u)) return;
    commitNow(withCalendar(u));
    setUrl("");
    setNewCalName("");
    check(u); // a new address is checked right away
  };

  const toggleDay = (d: number) => {
    const days = s.workHours.days.includes(d) ? s.workHours.days.filter((x) => x !== d) : [...s.workHours.days, d];
    update({ ...s, workHours: { ...s.workHours, days } });
  };

  return (
    <main className="settings">
      <aside className="side">
        <h1>{t.title}</h1>
        <nav className="tabs" role="tablist" aria-orientation="vertical">
          {visibleTabs.map((x) => (
            <button key={x.id} role="tab" aria-selected={tab === x.id} className="tab" onClick={() => setTab(x.id)}>
              {x.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="content">

      {tab === "general" && (
        <div className="cols">
          <div className="col">
            <Group title={t.looks}>
              <Row label={t.themeLabel}>
                <div className="seg" role="radiogroup" aria-label={t.themeLabel}>
                  {(Object.keys(t.themeOptions) as ThemeMode[]).map((k) => (
                    <button key={k} role="radio" aria-checked={s.theme === k} onClick={() => update({ ...s, theme: k })}>
                      {t.themeOptions[k]}
                    </button>
                  ))}
                </div>
              </Row>
              <Row label={t.accentLabel}>
                <div className="swatches" role="radiogroup" aria-label={t.accentLabel}>
                  {Object.entries(ACCENTS).map(([id, hex]) => (
                    <button
                      key={id}
                      role="radio"
                      className="swatch"
                      style={{ background: hex }}
                      title={accentNames[id]}
                      aria-label={accentNames[id]}
                      aria-checked={(ACCENTS[s.accent] ? s.accent : "coral") === id}
                      onClick={() => update({ ...s, accent: id })}
                    />
                  ))}
                </div>
              </Row>
            </Group>

            <Group title={t.system}>
              <Row label={t.autostart}>
                <Switch checked={auto} label={t.autostart} onChange={setAutostart} />
              </Row>
              {/* irreversible, so two steps like the closeness reset: the first press only unfolds the warning */}
              {!confirmAll ? (
                <Row label={t.resetAllLabel}>
                  <button className="remove" onClick={() => setConfirmAll(true)}>
                    {t.resetAllOpen}
                  </button>
                </Row>
              ) : (
                <div className="danger-box" role="alertdialog" aria-label={t.resetAllTitle}>
                  <strong>{t.resetAllTitle}</strong>
                  <p>{t.resetAllWarn}</p>
                  <div className="actions">
                    <button className="secondary" onClick={() => setConfirmAll(false)}>
                      {t.resetKeep}
                    </button>
                    <button className="danger-btn" onClick={resetAll}>
                      {t.resetAllConfirm}
                    </button>
                  </div>
                </div>
              )}
            </Group>
          </div>

          <div className="col">
            <Group title={t.about}>
              <div className="about">
                <img src="/favicon.svg" alt="" width="48" height="48" />
                <div>
                  <strong>{t.appName}</strong> <span className="ver">v{version}</span>
                  <p>{t.tagline}</p>
                </div>
              </div>
              <div className="row about-links">
                <button className="secondary small" onClick={() => openUrl(REPO)}>
                  ★ {t.star}
                </button>
                <button className="text-btn" onClick={() => openUrl(`${REPO}/issues`)}>
                  {t.report}
                </button>
              </div>
              <p className="copyright">{t.copyright(new Date().getFullYear())}</p>
            </Group>
          </div>
        </div>
      )}

      {tab === "remind" && (
      <div className="cols">
        <div className="col">
          <Group title={t.reminders}>
            {ids.map((id) => (
              <Row key={id} label={reminderLabels[id]}>
                <span className="unit">
                  <NumberField value={s.reminders[id].intervalMin} min={1} max={480} onCommit={(n) => setReminder(id, { intervalMin: n })} />
                  {t.every}
                </span>
                <Switch checked={s.reminders[id].enabled} label={reminderLabels[id]} onChange={(v) => setReminder(id, { enabled: v })} />
              </Row>
            ))}
            {s.custom.map((c) => (
              <Row key={c.id} label={c.text} ellipsis>
                <span className="unit">
                  <NumberField value={c.intervalMin} min={1} max={480} onCommit={(n) => setCustom(c.id, { intervalMin: n })} />
                  {t.every}
                </span>
                <Switch checked={c.enabled} label={c.text} onChange={(v) => setCustom(c.id, { enabled: v })} />
                <button className="remove" title={t.remove} onClick={() => update({ ...s, custom: s.custom.filter((x) => x.id !== c.id) })}>
                  {t.remove}
                </button>
              </Row>
            ))}
            <div className="row">
              <input
                className="grow"
                value={newText}
                maxLength={60}
                placeholder={t.customPlaceholder}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
              />
              <button className="primary" disabled={!newText.trim()} onClick={addCustom}>
                {t.add}
              </button>
            </div>
          </Group>
        </div>

        <div className="col">
          <Group title={t.hours}>
            <Row label={t.work} stack>
              <TimeRange start={s.workHours.start} end={s.workHours.end} onChange={(start, end) => update({ ...s, workHours: { ...s.workHours, start, end } })} />
            </Row>
            <div className="row">
              <div className="days">
                {dayOrder.map((d) => (
                  <label className="day" key={d}>
                    <input type="checkbox" checked={s.workHours.days.includes(d)} onChange={() => toggleDay(d)} />
                    <span>{dayLabels[d]}</span>
                  </label>
                ))}
              </div>
            </div>
            <Row label={t.lunch} stack>
              <TimeRange start={s.lunch.start} end={s.lunch.end} onChange={(start, end) => update({ ...s, lunch: { start, end } })} />
            </Row>
          </Group>
        </div>
      </div>
      )}

      {tab === "calendar" && (
      <div className="cols">
        <div className="col">
          <Group title={t.calendar}>
            <Row desc={t.calendarHint} />
            {s.icsUrls.map((u) => {
              const c = checks[u];
              const { [u]: _, ...otherNames } = s.icsNames;
              const status = c === "busy" ? t.checking : c ? (c.ok ? t.check.ok(c.events.length) : c.reason) : t.notChecked;
              // private ICS links are secret tokens: show only the host, the full URL stays in the tooltip
              return editingCal === u ? (
                <div key={u} className="cal-edit">
                  <div className="row">
                    <input
                      className="grow"
                      autoFocus
                      value={s.icsNames[u] ?? ""}
                      maxLength={20}
                      placeholder={t.calNamePlaceholder}
                      aria-label={t.calNamePlaceholder}
                      // a name is only shown here, so the pet window need not reload on every key
                      onChange={(e) => commitNow({ icsNames: { ...s.icsNames, [u]: e.target.value } }, false)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingCal(null)}
                    />
                  </div>
                  <div className="row actions">
                    <button className="remove check" disabled={c === "busy"} onClick={() => check(u)}>
                      {t.recheck}
                    </button>
                    <button
                      className="remove"
                      title={u}
                      onClick={() => {
                        commitNow({ icsUrls: s.icsUrls.filter((x) => x !== u), icsNames: otherNames });
                        setEditingCal(null);
                      }}
                    >
                      {t.remove}
                    </button>
                    <button className="secondary small" onClick={() => setEditingCal(null)}>
                      {t.done}
                    </button>
                  </div>
                </div>
              ) : (
                <div key={u} className="row">
                  <div className="text">
                    <div className="label ellipsis">{calName(u)}</div>
                    <div className={`desc cal-status${c && c !== "busy" ? (c.ok ? " ok" : " bad") : ""}`} title={c && c !== "busy" && !c.ok ? c.reason : u}>
                      {new URL(u).host} · {status}
                    </div>
                  </div>
                  <button className="remove check" onClick={() => setEditingCal(u)}>
                    {t.edit}
                  </button>
                </div>
              );
            })}
          </Group>

          <Group title={t.addCalendar}>
            <div className="row">
              <input className="grow" value={newCalName} maxLength={20} placeholder={t.calNamePlaceholder} aria-label={t.calNamePlaceholder} onChange={(e) => setNewCalName(e.target.value)} />
            </div>
            <div className="row">
              <input
                className="grow"
                value={url}
                placeholder={t.urlPlaceholder}
                aria-label={t.urlPlaceholder}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addUrl()}
              />
              <button className="primary" disabled={!url.trim()} onClick={addUrl}>
                {t.add}
              </button>
            </div>
            {badUrl && <p className="err">{badUrl}</p>}
          </Group>

          <Group title={t.leadGroup}>
            <Row label={t.lead}>
              <span className="unit">
                <NumberField value={s.calendarLeadMin} min={1} max={120} onCommit={(n) => commitNow({ calendarLeadMin: n })} />
                {t.leadUnit}
              </span>
            </Row>
          </Group>
        </div>

        <div className="col">
          <section>
            {/* fetches every calendar again, here and in the pet window, for events added since the last look */}
            <div className="h2row">
              <h2>{t.upcomingTitle}</h2>
              {s.icsUrls.length > 0 && (
                <button
                  className="text-btn"
                  disabled={s.icsUrls.some((u) => checks[u] === "busy")}
                  onClick={() => {
                    s.icsUrls.forEach(check);
                    emit("settings-changed");
                  }}
                >
                  {t.refresh}
                </button>
              )}
            </div>
            <div className="group">
            {upcoming.length ? (
              <ul className="events">
                {upcoming.map(({ e, cal }) => (
                  <li key={`${cal}${e.uid}${e.start.getTime()}`}>
                    <span className="when">{t.eventWhen(e.start)}</span>
                    <span className="what" title={e.title}>{e.title}</span>
                    {s.icsUrls.length > 1 && <span className="cal">{calName(cal)}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <Row desc={!s.icsUrls.length ? t.upcomingNoCal : s.icsUrls.some((u) => checks[u] === "busy") ? t.checking : t.upcomingNone} />
            )}
            </div>
          </section>

          {/* the guide is needed once, when adding the first address, so it stays folded away */}
          <details className="guide-box" open={!s.icsUrls.length}>
            <summary>{t.guideTitle}</summary>
            <div className="guide">
              <h3>{t.guideGoogle}</h3>
              <ol>
                {t.guideGoogleSteps.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
              <h3>{t.guideOutlook}</h3>
              <ol>
                {t.guideOutlookSteps.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
              <p>{t.guideNote}</p>
            </div>
          </details>
        </div>
      </div>
      )}

      {tab === "pet" && (
        <section className="pet-tab">
          {/* the reset sits on the title row so the tab does not grow; it acts at once, like the tray item */}
          <div className="h2row">
            <h2>{t.pickPet}</h2>
            <button className="text-btn" onClick={() => emit("reset-position")}>
              {t.resetPosition}
            </button>
          </div>
          <div className="pets">
            {petIds.map((id) => {
              const Anim = pets[id];
              return (
                // no label, so the pets answer instead: the picked one smiles, one under the mouse hops once
                <button
                  key={id}
                  className="pet-card"
                  aria-pressed={s.pet === id}
                  aria-label={petNames[id]}
                  title={petNames[id]}
                  onClick={() => update({ ...s, pet: id })}
                  onMouseEnter={() => setHoverPet(id)}
                  onMouseLeave={() => setHoverPet(null)}
                >
                  <Anim state={hoverPet === id ? "click" : s.pet === id ? "hover" : "idle"} color={s.petProfiles[id]?.color} />
                </button>
              );
            })}
          </div>

          <div className="cols">
            <div className="col">
              <Group title={t.profile}>
                <Row label={t.petName}>
                  <input
                    className="name-input"
                    value={s.petProfiles[s.pet]?.name ?? ""}
                    maxLength={8}
                    placeholder={petNames[s.pet]}
                    onChange={(e) => update(withProfile(s, s.pet, { name: e.target.value }))}
                  />
                </Row>
                <Row label={t.petColor}>
                  <div className="swatches" role="radiogroup" aria-label={t.petColor}>
                    {(petColors[s.pet] ?? []).map((c, _, list) => (
                      <button
                        key={c.id}
                        role="radio"
                        className="swatch"
                        style={{ background: c.swatch }}
                        title={colorNames[c.id]}
                        aria-label={colorNames[c.id]}
                        // no (or an unknown) colour stored means the first, which is what the pet draws
                        aria-checked={(list.find((x) => x.id === s.petProfiles[s.pet]?.color) ?? list[0]).id === c.id}
                        onClick={() => update(withProfile(s, s.pet, { color: c.id }))}
                      />
                    ))}
                  </div>
                </Row>
              </Group>
            </div>

            <div className="col">
              <Group title={t.petSize}>
                <div className="row">
                  <input
                    type="range"
                    aria-label={t.petSize}
                    min={50}
                    max={150}
                    step={5}
                    value={Math.round(s.petScale * 100)}
                    style={{ "--pct": `${s.petScale * 100 - 50}%` } as CSSProperties}
                    onChange={(e) => update({ ...s, petScale: Number(e.target.value) / 100 })}
                  />
                  <span className="pct">{Math.round(s.petScale * 100)}%</span>
                </div>
              </Group>

              <Group title={t.labelTitle}>
                <div className="row">
                  <div className="seg" role="radiogroup" aria-label={t.labelTitle}>
                    {(Object.keys(t.labelOptions) as Settings["petLabel"][]).map((k) => (
                      <button key={k} role="radio" aria-checked={s.petLabel === k} onClick={() => update({ ...s, petLabel: k })}>
                        {t.labelOptions[k]}
                      </button>
                    ))}
                  </div>
                </div>
              </Group>
            </div>
          </div>
        </section>
      )}

      {tab === "grow" && (
        <div className="cols">
          <div className="col">
            {/* what the draft outfit looks like, before 저장 */}
            <div className="outfit-preview" aria-hidden>
              <Preview state="idle" outfit={wearable(s.petProfiles[s.pet]?.outfit, lv.level, titles)} color={s.petProfiles[s.pet]?.color} />
            </div>

            <Group title={t.level}>
              <div className="row stack" title={t.levelHint}>
                <div className="lvline">
                  <strong>Lv.{lv.level}</strong>
                  <span className="desc">{lv.max ? t.levelMax : t.levelNext(lv.need - lv.into)}</span>
                  {!confirmReset && (
                    <button className="remove" onClick={() => setConfirmReset(true)}>
                      {t.resetOpen}
                    </button>
                  )}
                </div>
                <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(barPct)}>
                  <span style={{ width: `${barPct}%` }} />
                </div>
              </div>
              {/* irreversible, so two steps: the first press only unfolds the warning */}
              {confirmReset && (
                <div className="danger-box" role="alertdialog" aria-label={t.resetTitle}>
                  <strong>{t.resetTitle}</strong>
                  <p>{t.resetWarn}</p>
                  <div className="actions">
                    <button className="secondary" onClick={() => setConfirmReset(false)}>
                      {t.resetKeep}
                    </button>
                    <button
                      className="danger-btn"
                      onClick={() => {
                        emit("progress-reset"); // the pet window owns the record; it resets and saves it
                        setProgress(emptyProgress(new Date()));
                        setConfirmReset(false);
                      }}
                    >
                      {t.resetConfirm}
                    </button>
                  </div>
                </div>
              )}
            </Group>
          </div>

          <div className="col">
            <Group title={t.wardrobe(s.petProfiles[s.pet]?.name.trim() || petNames[s.pet])}>
              <Row desc={t.secretCount(ITEMS.filter((it) => it.title && titles.includes(it.title)).length, ITEMS.filter((it) => it.title).length)} />
              {/* one slot at a time keeps the tab short; the head alone has over a dozen pieces */}
              <div className="row">
                <div className="seg" role="tablist" aria-label={t.wardrobeSlots}>
                  {SLOTS.map((x) => (
                    <button key={x} role="tab" aria-checked={slot === x} aria-selected={slot === x} onClick={() => setSlot(x)}>
                      {slotNames[x]}
                    </button>
                  ))}
                </div>
              </div>
              {[slot].map((slot) => {
                const worn = s.petProfiles[s.pet]?.outfit?.[slot];
                const wear = (id: string | undefined) => update(withProfile(s, s.pet, { outfit: { ...s.petProfiles[s.pet]?.outfit, [slot]: id } }));
                return (
                  <div className="row stack" key={slot}>
                    <div className="choices tight">
                      <button className="choice" aria-pressed={!worn} onClick={() => wear(undefined)}>
                        {t.itemNone}
                      </button>
                      {ITEMS.filter((it) => it.slot === slot).map((it) => {
                        const open = isUnlocked(it, lv.level, titles);
                        // a locked item shows its name with its level, or 히든 and a vague hint for a secret one
                        return (
                          <button
                            key={it.id}
                            className={it.title ? "choice found" : "choice"}
                            disabled={!open}
                            aria-pressed={worn === it.id}
                            title={open ? undefined : it.title ? secretHints[it.title] : unlockHint(it)}
                            onClick={() => wear(it.id)}
                          >
                            {itemNames[it.id]}
                            {!open && <span className={it.title ? "need secret" : "need"}>{it.title ? t.secretBadge : `Lv.${it.level}`}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </Group>
          </div>
        </div>
      )}

      {import.meta.env.DEV && tab === "dev" && <DevPanel s={s} />}

      {tab === "talk" && (
        <div className="cols">
          <div className="col">
            <Group title={t.talkTitle}>
              {(Object.keys(t.moments) as (keyof typeof t.moments)[]).map((k) => (
                <Row key={k} label={t.moments[k]}>
                  <Switch checked={s.moments[k]} label={t.moments[k]} onChange={(v) => update({ ...s, moments: { ...s.moments, [k]: v } })} />
                </Row>
              ))}
            </Group>
          </div>

          <div className="col">
            <Group title={t.lunchMenus}>
              <div className="row">
                <input
                  className="grow"
                  value={newMenu}
                  maxLength={20}
                  placeholder={t.menuPlaceholder}
                  onChange={(e) => setNewMenu(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMenu()}
                />
                <button className="primary" disabled={!newMenu.trim()} onClick={addMenu}>
                  {t.add}
                </button>
              </div>
              <div className="chips">
                {s.lunchMenus.map((m) => (
                  <span className="chip" key={m}>
                    {m}
                    <button aria-label={`${m} ${t.remove}`} onClick={() => update({ ...s, lunchMenus: s.lunchMenus.filter((x) => x !== m) })}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="row">
                <button className="remove" onClick={() => update({ ...s, lunchMenus: defaultLunchMenus })}>
                  {t.menuReset}
                </button>
              </div>
            </Group>
          </div>
        </div>
      )}

      <footer>
        {/* a live tab hides 저장, unless another tab still has edits that closing would throw away */}
        {live && <span className="desc">{dirty ? t.otherUnsaved : t.liveSaved}</span>}
        <button className="secondary" onClick={() => getCurrentWindow().close()}>
          {t.cancel}
        </button>
        {(!live || dirty) && (
          <button className="primary" disabled={!dirty} onClick={save}>
            {t.save}
          </button>
        )}
      </footer>
      </div>
    </main>
  );
}
