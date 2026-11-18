import { describe, expect, it } from "vitest";
import { pickVoice, scoreVoiceForPref } from "@/lib/speech";

function voice(partial) {
  return {
    name: "Voice",
    lang: "en-US",
    voiceURI: "voice",
    localService: true,
    ...partial,
  };
}

describe("speech voice preference", () => {
  it("prefers English voices", () => {
    const picked = pickVoice(
      [voice({ name: "Spanish", lang: "es-ES" }), voice({ name: "Samantha", lang: "en-US" })],
      "auto"
    );
    expect(picked.name).toBe("Samantha");
  });

  it("scores female preference higher for female-named voices", () => {
    const female = voice({ name: "Microsoft Zira" });
    const male = voice({ name: "Microsoft David" });
    expect(scoreVoiceForPref(female, "female")).toBeGreaterThan(scoreVoiceForPref(male, "female"));
    expect(scoreVoiceForPref(male, "male")).toBeGreaterThan(scoreVoiceForPref(female, "male"));
  });

  it("picks male voice when preferred", () => {
    const picked = pickVoice(
      [
        voice({ name: "Microsoft Zira Desktop", lang: "en-US" }),
        voice({ name: "Microsoft David Desktop", lang: "en-US" }),
      ],
      "male"
    );
    expect(picked.name).toMatch(/David/i);
  });

  it("returns null for empty list", () => {
    expect(pickVoice([], "auto")).toBeNull();
  });
});
