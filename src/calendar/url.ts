/** The address bar of Google Calendar is a web page; the feed to paste lives under `/ical/` and ends in `.ics`. */
export function isGoogleCalendarPage(url: string): boolean {
  try {
    const u = new URL(url);
    return u.host === "calendar.google.com" && !u.pathname.includes("/ical/");
  } catch {
    return false;
  }
}

/** Accepts what users paste for an ICS subscription; returns an https/http URL or null. */
export function normalizeIcsUrl(input: string): string | null {
  const raw = input.trim().replace(/^webcal:\/\//i, "https://");
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}
