import { describe, expect, it } from "vitest";
import { defaultSettings, migrateSettings, withProfile, type Settings } from "./settings";

describe("migrateSettings", () => {
  it("moves a turtle owner to the bot with the turtle's name and clothes", () => {
    const old: Settings = { ...defaultSettings, pet: "turtle", petProfiles: { turtle: { name: "꼬북", outfit: { head: "cap" } }, cat: { name: "나비" } } };
    const s = migrateSettings(old);
    expect(s.pet).toBe("robot");
    expect(s.petProfiles).toEqual({ robot: { name: "꼬북", outfit: { head: "cap" } }, cat: { name: "나비" } });
    expect(migrateSettings({ ...defaultSettings, pet: "dog" })).toEqual({ ...defaultSettings, pet: "dog" });
  });
});

describe("withProfile", () => {
  it("renaming keeps the outfit, dressing keeps the name, other pets are untouched", () => {
    let s: Settings = { ...defaultSettings, petProfiles: { cat: { name: "나비", outfit: { head: "crown" } }, dog: { name: "바둑이" } } };
    s = withProfile(s, "cat", { name: "치즈" });
    expect(s.petProfiles.cat).toEqual({ name: "치즈", outfit: { head: "crown" } });
    s = withProfile(s, "cat", { outfit: { head: "crown", neck: "tie" } });
    expect(s.petProfiles.cat.name).toBe("치즈");
    expect(s.petProfiles.dog).toEqual({ name: "바둑이" });
    expect(withProfile(defaultSettings, "rabbit", { outfit: { face: "glasses" } }).petProfiles.rabbit).toEqual({ name: "", outfit: { face: "glasses" } });
  });
});
