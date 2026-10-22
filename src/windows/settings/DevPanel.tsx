import { useState } from "react";
import type { CalEvent } from "../../calendar/CalendarSource";
import { IcsSource } from "../../calendar/IcsSource";
import { applyTheme, sendDebug } from "../../debug";
import { momentsOf } from "../../greetings/moments";
import { devText as d, reminderLabels } from "../../messages/ko";
import type { PetState } from "../../pet/anim/types";
import type { ReminderId, Settings } from "../../store/settings";

const states = Object.keys(d.stateNames) as PetState[];
const reminders = Object.keys(reminderLabels) as ReminderId[];

function Buttons({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      <div className="group dev-buttons">{children}</div>
    </section>
  );
}

const status = (m: { at: Date; until: Date }) => {
  const now = Date.now();
  if (m.until.getTime() <= now) return d.past;
  if (m.at.getTime() <= now) return d.now;
  return d.inMin(Math.ceil((m.at.getTime() - now) / 60_000));
};

/** Dev-only: plays the pet's behaviours on demand so they can be checked without waiting for the clock. */
const DAY = 24 * 60 * 60_000;
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export function DevPanel({ s }: { s: Settings }) {
  const schedule = momentsOf(new Date(), s);
  const [mode, setMode] = useState<"light" | "dark" | null>(document.documentElement.dataset.theme === "light" ? "light" : document.documentElement.dataset.theme === "dark" ? "dark" : null);
  const [events, setEvents] = useState<CalEvent[]>();
  const [error, setError] = useState<string>();

  // reads the feeds the same way the app does, but from the draft addresses, so an unsaved address can be tried
  const load = async () => {
    setError(undefined);
    try {
      const now = Date.now();
      const lists = await Promise.all(s.icsUrls.map((u) => new IcsSource(u).getEvents(new Date(now - DAY), new Date(now + 2 * DAY))));
      setEvents(lists.flat().sort((a, b) => a.start.getTime() - b.start.getTime()));
    } catch (e) {
      setEvents(undefined);
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  // a past event is replayed as "in 10 minutes" so the wording can still be checked
  const minutesTo = (e: CalEvent) => (e.start.getTime() > Date.now() ? Math.max(1, Math.round((e.start.getTime() - Date.now()) / 60_000)) : 10);
  return (
    <div className="dev">
      <p className="desc dev-hint">{d.hint}</p>
      <div className="cols">
        <div className="col">
          <Buttons title={d.talk}>
            <button className="secondary" onClick={() => sendDebug({ type: "greeting" })}>{d.greeting}</button>
            <button className="secondary" onClick={() => sendDebug({ type: "lunch" })}>{d.lunch}</button>
            <button className="secondary" onClick={() => sendDebug({ type: "moment", id: "countdown3h" })}>{d.countdown3h}</button>
            <button className="secondary" onClick={() => sendDebug({ type: "moment", id: "countdown1h" })}>{d.countdown1h}</button>
            <button className="secondary" onClick={() => sendDebug({ type: "moment", id: "goodbye" })}>{d.goodbye}</button>
            <button className="secondary" onClick={() => sendDebug({ type: "moment", id: "goodbye", friday: true })}>{d.goodbyeFriday}</button>
          </Buttons>

          <Buttons title={d.alerts}>
            {reminders.map((id) => (
              <button key={id} className="secondary" onClick={() => sendDebug({ type: "reminder", id })}>{reminderLabels[id]}</button>
            ))}
            <button className="secondary" onClick={() => sendDebug({ type: "calendar" })}>{d.calendar}</button>
            <button className="secondary" onClick={() => sendDebug({ type: "pile" })}>{d.pile}</button>
            <button className="secondary" onClick={() => sendDebug({ type: "clear" })}>{d.clear}</button>
          </Buttons>

          <Buttons title={d.ttl}>
            <button className="secondary" onClick={() => sendDebug({ type: "ttl", ms: null })}>{d.ttl30}</button>
            <button className="secondary" onClick={() => sendDebug({ type: "ttl", ms: 5_000 })}>{d.ttl5}</button>
          </Buttons>
        </div>

        <div className="col">
          <Buttons title={d.theme}>
            {([null, "light", "dark"] as const).map((m) => (
              <button
                key={String(m)}
                className={mode === m ? "primary" : "secondary"}
                onClick={() => {
                  setMode(m);
                  applyTheme(m); // this window
                  sendDebug({ type: "theme", mode: m }); // the pet window
                }}
              >
                {m === null ? d.themeSystem : m === "light" ? d.themeLight : d.themeDark}
              </button>
            ))}
            <span className="desc">{d.osNow(window.matchMedia("(prefers-color-scheme: dark)").matches)}</span>
          </Buttons>

          <Buttons title={d.states}>
            {states.map((st) => (
              <button key={st} className="secondary" onClick={() => sendDebug({ type: "state", state: st })}>{d.stateNames[st]}</button>
            ))}
            <button className="remove" onClick={() => sendDebug({ type: "state", state: null })}>{d.release}</button>
            <button className="secondary" onClick={() => sendDebug({ type: "quip" })}>{d.quip}</button>
          </Buttons>

          <section>
            <h2>{d.myCalendar}</h2>
            <div className="group">
              {s.icsUrls.length === 0 ? (
                <p className="desc dev-hint">{d.noUrls}</p>
              ) : (
                <div className="row">
                  <button className="primary" onClick={load}>{d.load}</button>
                </div>
              )}
              {error && <p className="err">{d.loadFail + error}</p>}
              {events?.length === 0 && <p className="desc dev-hint">{d.noEvents}</p>}
              {events?.map((e) => (
                <div className="row" key={`${e.uid}@${e.start.getTime()}`}>
                  <div className="text">
                    <div className="label ellipsis">{e.title}</div>
                    <div className="desc">{`${e.start.getMonth() + 1}/${e.start.getDate()} ${hhmm(e.start)}`}</div>
                  </div>
                  <button className="secondary" onClick={() => sendDebug({ type: "calendar", title: e.title, min: minutesTo(e) })}>{d.sendAlert}</button>
                  <button className="secondary" onClick={() => sendDebug({ type: "greeting", event: { title: e.title, start: e.start.getTime() } })}>{d.sendHello}</button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>{d.schedule}</h2>
            <div className="group">
              {schedule.length === 0 && <p className="desc dev-hint">{d.none}</p>}
              {schedule.map((m) => (
                <div className="row" key={m.id}>
                  <div className="text">
                    <div className="label">{d.momentNames[m.id]}</div>
                    <div className="desc">{`${String(m.at.getHours()).padStart(2, "0")}:${String(m.at.getMinutes()).padStart(2, "0")}`}</div>
                  </div>
                  <span className="unit">{status(m)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
