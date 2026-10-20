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
