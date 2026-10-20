import { check } from "@tauri-apps/plugin-updater";

const EVERY_MS = 6 * 60 * 60_000;

async function updateOnce() {
  try {
    // installs silently; on Windows the app exits and the installer takes over
    await (await check())?.downloadAndInstall();
  } catch (err) {
    console.warn("update check failed", err); // offline or no release yet: try again next round
  }
}

export function startAutoUpdate() {
  updateOnce();
  const t = setInterval(updateOnce, EVERY_MS);
  return () => clearInterval(t);
}
