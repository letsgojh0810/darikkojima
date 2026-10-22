import { sendDebug } from "../../debug";
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
export function DevPanel({ s }: { s: Settings }) {
  const schedule = momentsOf(new Date(), s);
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
          <Buttons title={d.states}>
            {states.map((st) => (
              <button key={st} className="secondary" onClick={() => sendDebug({ type: "state", state: st })}>{d.stateNames[st]}</button>
            ))}
            <button className="remove" onClick={() => sendDebug({ type: "state", state: null })}>{d.release}</button>
            <button className="secondary" onClick={() => sendDebug({ type: "quip" })}>{d.quip}</button>
          </Buttons>

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
