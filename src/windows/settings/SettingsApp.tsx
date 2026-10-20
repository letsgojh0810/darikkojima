import { useEffect, useState } from "react";
import { emit } from "@tauri-apps/api/event";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { normalizeIcsUrl } from "../../calendar/url";
import { dayLabels, reminderLabels, settingsText as t } from "../../messages/ko";
import { loadSettings, saveSettings } from "../../store";
import type { ReminderId, Settings } from "../../store/settings";
import "./SettingsApp.css";

const ids = Object.keys(reminderLabels) as ReminderId[];

/** Uncontrolled number box that commits on blur, so the field can be emptied while typing. */
function NumberField({ value, min, max, onCommit }: { value: number; min: number; max: number; onCommit(n: number): void }) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      key={value}
      defaultValue={value}
      onBlur={(e) => {
        const n = Math.floor(Number(e.target.value));
        if (n >= min && n <= max) onCommit(n);
        else e.target.value = String(value);
      }}
    />
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
      <h2>{t.reminders}</h2>
      {ids.map((id) => (
        <div className="row" key={id}>
          <label>
            <input
              type="checkbox"
              checked={s.reminders[id].enabled}
              onChange={(e) => update({ ...s, reminders: { ...s.reminders, [id]: { ...s.reminders[id], enabled: e.target.checked } } })}
            />
            {reminderLabels[id]}
          </label>
          <span>
            {t.every}{" "}
            <NumberField
              value={s.reminders[id].intervalMin}
              min={1}
              max={480}
              onCommit={(n) => update({ ...s, reminders: { ...s.reminders, [id]: { ...s.reminders[id], intervalMin: n } } })}
            />
          </span>
        </div>
      ))}

      <h2>{t.work}</h2>
      <div className="row">
        <input type="time" value={s.workHours.start} onChange={(e) => e.target.value && update({ ...s, workHours: { ...s.workHours, start: e.target.value } })} />
        ~
        <input type="time" value={s.workHours.end} onChange={(e) => e.target.value && update({ ...s, workHours: { ...s.workHours, end: e.target.value } })} />
      </div>
      <div className="row days">
        {dayLabels.map((label, d) => (
          <label key={d}>
            <input type="checkbox" checked={s.workHours.days.includes(d)} onChange={() => toggleDay(d)} />
            {label}
          </label>
        ))}
      </div>

      <h2>{t.lunch}</h2>
      <div className="row">
        <input type="time" value={s.lunch.start} onChange={(e) => e.target.value && update({ ...s, lunch: { ...s.lunch, start: e.target.value } })} />
        ~
        <input type="time" value={s.lunch.end} onChange={(e) => e.target.value && update({ ...s, lunch: { ...s.lunch, end: e.target.value } })} />
      </div>

      <h2>{t.calendar}</h2>
      {s.icsUrls.map((u) => (
        <div className="row url" key={u}>
          <span title={u}>{u}</span>
          <button onClick={() => update({ ...s, icsUrls: s.icsUrls.filter((x) => x !== u) })}>{t.remove}</button>
        </div>
      ))}
      <div className="row">
        <input className="grow" value={url} placeholder={t.urlPlaceholder} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addUrl()} />
        <button onClick={addUrl}>{t.add}</button>
      </div>
      {badUrl && <p className="err">{t.badUrl}</p>}
      <div className="row">
        <span>{t.lead}</span>
        <NumberField value={s.calendarLeadMin} min={1} max={120} onCommit={(n) => update({ ...s, calendarLeadMin: n })} />
      </div>

      <h2>&nbsp;</h2>
      <label className="row">
        <input
          type="checkbox"
          checked={auto}
          onChange={(e) => (e.target.checked ? enable() : disable()).then(() => setAuto(e.target.checked))}
        />
        {t.autostart}
      </label>
    </main>
  );
}
