/** Accent colours to pick from in 일반 → 화면; the first is the default. Names live in messages/ko.ts accentNames. */
export const ACCENTS: Record<string, string> = {
  coral: "#e8603f",
  blue: "#3182f6",
  mint: "#12a58c",
  lavender: "#7b61f0",
  charcoal: "#4a4540",
};

export type ThemeMode = "system" | "light" | "dark";

/** Light/dark and the accent for this window; tokens.css derives the pressed, weak and focus shades from --accent. */
export function applyAppearance(theme: ThemeMode, accent: string) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  root.style.setProperty("--accent", ACCENTS[accent] ?? ACCENTS.coral);
}
