export interface CalEvent {
  uid: string;
  title: string;
  start: Date;
  end: Date;
}

/** Anything that can list events in a range. ICS today; an OAuth source (Google, MS Graph) can implement this later. */
export interface CalendarSource {
  getEvents(from: Date, to: Date): Promise<CalEvent[]>;
}
