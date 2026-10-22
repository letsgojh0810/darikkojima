import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { emit } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { normalizeIcsUrl } from "../../calendar/url";
import { dayLabels, defaultLunchMenus, devText, petNames, reminderLabels, settingsText as t } from "../../messages/ko";
import { DevPanel } from "./DevPanel";
import { loadSettings, saveSettings } from "../../store";
import type { CustomReminder, ReminderId, Settings } from "../../store/settings";
import { petIds, pets } from "../../pet/anim/pets";
import "../../tokens.css";
import "./SettingsApp.css";

const ids = Object.keys(reminderLabels) as ReminderId[];
/** Monday first; the stored values stay Date#getDay (0 = Sunday). */
const dayOrder = [1, 2, 3, 4, 5, 6, 0];
/** Add a tab here and a matching `tab === id` block below; the footer's 저장/취소 covers every tab. */
const tabs = [
  { id: "general", label: t.tabGeneral },
  { id: "pet", label: t.tabPet },
  { id: "talk", label: t.tabTalk },
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
  // edits stay in this draft until 저장; closing the window or 취소 throws them away
  const [s, setS] = useState<Settings>();
  const [saved, setSaved] = useState<{ s: Settings; auto: boolean }>();
  const [auto, setAuto] = useState(false);
  const [url, setUrl] = useState("");
  const [badUrl, setBadUrl] = useState(false);
  const [newText, setNewText] = useState("");
  const [newMenu, setNewMenu] = useState("");
  const [tab, setTab] = useState<TabId>("general");

  // closing without saving (X or 취소) tells the pet window to drop the preview and reload what is stored
  useEffect(() => {
    const unlisten = getCurrentWindow().onCloseRequested(() => emit("settings-changed"));
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  useEffect(() => {
    Promise.all([loadSettings(), isEnabled()]).then(([loaded, on]) => {
      setS(loaded);
      setAuto(on);
      setSaved({ s: loaded, auto: on });
    });
  }, []);

  const pet = s?.pet;
  const petScale = s?.petScale;
  useEffect(() => {
    if (pet !== undefined && petScale !== undefined) emit("pet-preview", { pet, petScale });
  }, [pet, petScale]);
  if (!s || !saved) return null;

  const update = setS;
  const dirty = JSON.stringify(s) !== JSON.stringify(saved.s) || auto !== saved.auto || !!url.trim() || !!newText.trim() || !!newMenu.trim();

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

  const save = async () => {
    // text typed but not yet added would be lost silently, so take it along
    const pending = normalizeIcsUrl(url);
    const next = { ...s, custom: newCustom(), lunchMenus: withMenu(s.lunchMenus), icsUrls: pending && !s.icsUrls.includes(pending) ? [...s.icsUrls, pending] : s.icsUrls };
    await saveSettings(next);
    if (auto !== saved.auto) await (auto ? enable() : disable());
    await emit("settings-changed");
    await getCurrentWindow().close();
  };
  const setReminder = (id: ReminderId, patch: Partial<Settings["reminders"][ReminderId]>) =>
    update({ ...s, reminders: { ...s.reminders, [id]: { ...s.reminders[id], ...patch } } });

  const addUrl = () => {
    const u = normalizeIcsUrl(url);
    setBadUrl(!u);
    if (!u) return;
    if (!s.icsUrls.includes(u)) update({ ...s, icsUrls: [...s.icsUrls, u] });
    setUrl("");
  };

  const toggleDay = (d: number) => {
    const days = s.workHours.days.includes(d) ? s.workHours.days.filter((x) => x !== d) : [...s.workHours.days, d];
    update({ ...s, workHours: { ...s.workHours, days } });
  };

  return (
    <main className="settings">
      <header>
        <h1>{t.title}</h1>
      </header>

      <nav className="tabs" role="tablist">
        {visibleTabs.map((x) => (
          <button key={x.id} role="tab" aria-selected={tab === x.id} className="tab" onClick={() => setTab(x.id)}>
            {x.label}
          </button>
        ))}
      </nav>

      {tab === "general" && (
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

          <Group title={t.system}>
            <Row label={t.autostart}>
              <Switch checked={auto} label={t.autostart} onChange={setAuto} />
            </Row>
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

          <Group title={t.calendar}>
            <Row desc={t.calendarHint} />
            {s.icsUrls.map((u) => (
              // private ICS links are secret tokens: show only the host, the full URL stays in the tooltip
              <Row key={u} label={`${new URL(u).host} …`}>
                <button className="remove" title={u} onClick={() => update({ ...s, icsUrls: s.icsUrls.filter((x) => x !== u) })}>
                  {t.remove}
                </button>
              </Row>
            ))}
            <div className="row">
              <input
                className="grow"
                value={url}
                placeholder={t.urlPlaceholder}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addUrl()}
              />
              <button className="primary" disabled={!url.trim()} onClick={addUrl}>
                {t.add}
              </button>
            </div>
            {badUrl && <p className="err">{t.badUrl}</p>}
            <Row label={t.lead}>
              <span className="unit">
                <NumberField value={s.calendarLeadMin} min={1} max={120} onCommit={(n) => update({ ...s, calendarLeadMin: n })} />
                {t.leadUnit}
              </span>
            </Row>
          </Group>
        </div>
      </div>
      )}

      {tab === "pet" && (
        <section className="pet-tab">
          <h2>{t.pickPet}</h2>
          <div className="pets">
            {petIds.map((id) => {
              const Anim = pets[id];
              return (
                <button key={id} className="pet-card" aria-pressed={s.pet === id} onClick={() => update({ ...s, pet: id })}>
                  <Anim state="idle" />
                  <span>{petNames[id] ?? id}</span>
                </button>
              );
            })}
          </div>

          <h2>{t.petSize}</h2>
          <div className="group">
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
          </div>
        </section>
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
        <button className="secondary" onClick={() => getCurrentWindow().close()}>
          {t.cancel}
        </button>
        <button className="primary" disabled={!dirty} onClick={save}>
          {t.save}
        </button>
      </footer>
    </main>
  );
}
