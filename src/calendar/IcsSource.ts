import { fetch } from "@tauri-apps/plugin-http";
import { settingsText } from "../messages/ko";
import type { CalendarSource, CalEvent } from "./CalendarSource";
import { isIcs, parseEvents } from "./ics";

export class IcsSource implements CalendarSource {
  constructor(private url: string) {}

  async getEvents(from: Date, to: Date): Promise<CalEvent[]> {
    const res = await fetch(this.url);
    if (!res.ok) throw new Error(`ICS ${res.status}`);
    const text = await res.text();
    if (!isIcs(text)) throw new Error(settingsText.notFeed);
    return parseEvents(text, from, to);
  }
}

/** `events`: the next week's events, earliest first */
export type IcsCheck = { ok: true; events: CalEvent[] } | { ok: false; reason: string };

const WEEK = 7 * 24 * 60 * 60_000;

/** For the settings' 확인 button: fetches the feed once and says in plain words what is wrong, or lists the next week's events. */
export async function checkIcs(url: string, get: (u: string) => Promise<Response> = fetch, now = new Date()): Promise<IcsCheck> {
  const c = settingsText.check;
  let res: Response;
  try {
    res = await get(url);
  } catch {
    return { ok: false, reason: c.offline };
  }
  if (res.status === 401 || res.status === 403) return { ok: false, reason: c.denied };
  if (res.status === 404 || res.status === 410) return { ok: false, reason: c.gone };
  if (!res.ok) return { ok: false, reason: c.status(res.status) };
  const text = await res.text();
  if (!isIcs(text)) return { ok: false, reason: settingsText.notFeed };
  try {
    const events = parseEvents(text, now, new Date(now.getTime() + WEEK)).sort((a, b) => a.start.getTime() - b.start.getTime());
    return { ok: true, events };
  } catch {
    return { ok: false, reason: c.broken };
  }
}
