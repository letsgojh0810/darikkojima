import { invoke } from "@tauri-apps/api/core";

export const setHitRect = (r: DOMRect) =>
  invoke("set_hit_rect", { x: r.x, y: r.y, w: r.width, h: r.height });

export const isFullscreenBusy = () => invoke<boolean>("is_fullscreen_busy");

export const openSettings = () => invoke("open_settings");

export const quitApp = () => invoke("quit_app");
