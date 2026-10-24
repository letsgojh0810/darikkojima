import { beforeEach, describe, expect, it, vi } from "vitest";

// both store files, as plain maps; reset per test along with the "this PC has saved" mark
const files: Record<string, Map<string, unknown>> = {};
vi.mock("@tauri-apps/plugin-store", () => ({
  LazyStore: class {
    data: Map<string, unknown>;
    constructor(name: string) {
      this.data = files[name] ??= new Map();
    }
    length = async () => this.data.size;
    get = async (k: string) => this.data.get(k);
    set = async (k: string, v: unknown) => void this.data.set(k, v);
    save = async () => {};
    reload = async () => {};
  },
}));
vi.mock("@tauri-apps/api/event", () => ({ emit: async () => {} }));

const local = new Map<string, string>();
vi.stubGlobal("localStorage", { getItem: (k: string) => local.get(k) ?? null, setItem: (k: string, v: string) => local.set(k, v) });

beforeEach(() => {
  for (const f of Object.values(files)) f.clear();
  local.clear();
  vi.resetModules(); // the store remembers whether it can write, once per window
});

describe("loadSettings: autostart on by default", () => {
  it("a fresh install asks for it once", async () => {
    const { loadSettings } = await import("./index");
    expect((await loadSettings()).autostartDefaulted).toBe(false);
  });

  it("settings saved before the switch existed leave autostart alone", async () => {
    files["settings.json"].set("settings", { pet: "dog" });
    const { loadSettings } = await import("./index");
    expect((await loadSettings()).autostartDefaulted).toBe(true);
  });

  it("a failed read on a PC that has saved before leaves autostart alone", async () => {
    vi.useFakeTimers();
    local.set("hasSavedData", "1");
    const { loadSettings } = await import("./index");
    const s = loadSettings();
    await vi.runAllTimersAsync(); // the read retries for a few seconds before giving up
    expect((await s).autostartDefaulted).toBe(true);
    vi.useRealTimers();
  });
});
