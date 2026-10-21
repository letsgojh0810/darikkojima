import { useEffect, useState, type ReactNode } from "react";
import { emit } from "@tauri-apps/api/event";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { normalizeIcsUrl } from "../../calendar/url";
import { dayLabels, reminderLabels, settingsText as t } from "../../messages/ko";
import { loadSettings, saveSettings } from "../../store";
import type { ReminderId, Settings } from "../../store/settings";
import "../../tokens.css";
import "./SettingsApp.css";

const ids = Object.keys(reminderLabels) as ReminderId[];
/** Monday first; the stored values stay Date#getDay (0 = Sunday). */
const dayOrder = [1, 2, 3, 4, 5, 6, 0];

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

function Row({ label, desc, children }: { label?: string; desc?: string; children?: ReactNode }) {
  return (
    <div className="row">
      <div className="text">
        {label && <div className="label">{label}</div>}
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
  const [s, setS] = useState<Settings>();
  const [auto, setAuto] = useState(false);
  const [url, setUrl] = useState("");
  const [badUrl, setBadUrl] = useState(false);

  useEffect(() => {
    loadSettings().then(setS);
    isEnabled().then(setAuto);
  }, []);
  if (!s) return null;

  const update = (next: Settings) => {
    setS(next);
    saveSettings(next).then(() => emit("settings-changed"));
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
        <p className="sub">{t.autoSave}</p>
      </header>

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
          </Group>

          <Group title={t.system}>
            <Row label={t.autostart}>
              <Switch checked={auto} label={t.autostart} onChange={(v) => (v ? enable() : disable()).then(() => setAuto(v))} />
            </Row>
          </Group>
        </div>

        <div className="col">
          <Group title={t.hours}>
            <Row label={t.work}>
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
            <Row label={t.lunch}>
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
    </main>
  );
}
