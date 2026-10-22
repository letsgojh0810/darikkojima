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
