import { fetch } from "@tauri-apps/plugin-http";
import type { CalendarSource, CalEvent } from "./CalendarSource";
import { parseEvents } from "./ics";

export class IcsSource implements CalendarSource {
  constructor(private url: string) {}

  async getEvents(from: Date, to: Date): Promise<CalEvent[]> {
    const res = await fetch(this.url);
    if (!res.ok) throw new Error(`ICS ${res.status}`);
    return parseEvents(await res.text(), from, to);
  }
}
