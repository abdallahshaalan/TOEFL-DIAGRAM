/**
 * Browser TTS helper with gender preference + study rate.
 * Offline-friendly: uses speechSynthesis only; designed so a future
 * neural/cloud provider can plug in behind the same API.
 */

import { getMeta, setMeta } from "@/lib/db";

export const SPEECH_VOICE_PREFS = ["auto", "female", "male"];
export const SPEECH_RATES = { normal: 1, slow: 0.78 };

const FEMALE_HINTS =
  /\b(female|woman|zira|samantha|karen|moira|tessa|veena|fiona|victoria|susan|hazel|linda|heather|kate|serena|allison|ava|susan|jenny|aria|jenny\s*neural|natasha|google\s*us\s*english\s*female)\b/i;
const MALE_HINTS =
  /\b(male|man|david|mark|daniel|alex|fred|tom|james|george|ravi|lee|gordon|bruce|microsoft\s*david|google\s*us\s*english\s*male)\b/i;

let cachedPrefs = null;
let speakingListeners = new Set();
let isSpeaking = false;

export function isSpeechSupported() {
  return typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
}

export function subscribeSpeaking(listener) {
  speakingListeners.add(listener);
  listener(isSpeaking);
  return () => speakingListeners.delete(listener);
}

function setSpeaking(next) {
  isSpeaking = next;
  speakingListeners.forEach((fn) => {
    try {
      fn(next);
    } catch {
      /* ignore */
    }
  });
}

export function scoreVoiceForPref(voice, pref) {
  if (!voice) return -Infinity;
  const blob = `${voice.name || ""} ${voice.voiceURI || ""}`;
  const lang = String(voice.lang || "").toLowerCase();
  let score = 0;
  if (lang.startsWith("en")) score += 40;
  if (lang === "en-us" || lang === "en_us") score += 8;
  if (lang === "en-gb" || lang === "en_gb") score += 4;
  if (/neural|premium|enhanced|natural|online/i.test(blob)) score += 12;
  if (pref === "female") {
    if (FEMALE_HINTS.test(blob)) score += 30;
    if (MALE_HINTS.test(blob)) score -= 25;
  } else if (pref === "male") {
    if (MALE_HINTS.test(blob)) score += 30;
    if (FEMALE_HINTS.test(blob)) score -= 25;
  }
  if (voice.localService) score += 2;
  return score;
}

/** Pure helper for tests / selection. */
export function pickVoice(voices, pref = "auto") {
  const list = Array.isArray(voices) ? voices.filter(Boolean) : [];
  if (!list.length) return null;
  const english = list.filter((v) => String(v.lang || "").toLowerCase().startsWith("en"));
  const pool = english.length ? english : list;
  const effective = SPEECH_VOICE_PREFS.includes(pref) ? pref : "auto";
  let best = pool[0];
  let bestScore = -Infinity;
  for (const v of pool) {
    const s = scoreVoiceForPref(v, effective);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return best;
}

export async function getSpeechPrefs() {
  if (cachedPrefs) return cachedPrefs;
  const [voicePref, rate] = await Promise.all([
    getMeta("speechVoicePref", "auto"),
    getMeta("speechRate", "normal"),
  ]);
  cachedPrefs = {
    voicePref: SPEECH_VOICE_PREFS.includes(voicePref) ? voicePref : "auto",
    rate: rate === "slow" ? "slow" : "normal",
  };
  return cachedPrefs;
}

export async function setSpeechPrefs(partial = {}) {
  const current = await getSpeechPrefs();
  const next = {
    voicePref: SPEECH_VOICE_PREFS.includes(partial.voicePref)
      ? partial.voicePref
      : current.voicePref,
    rate: partial.rate === "slow" || partial.rate === "normal" ? partial.rate : current.rate,
  };
  await Promise.all([
    setMeta("speechVoicePref", next.voicePref),
    setMeta("speechRate", next.rate),
  ]);
  cachedPrefs = next;
  return next;
}

function loadVoices() {
  if (!isSpeechSupported()) return [];
  const synth = window.speechSynthesis;
  let voices = synth.getVoices() || [];
  if (!voices.length) {
    // Chrome often populates asynchronously
    try {
      synth.getVoices();
    } catch {
      /* ignore */
    }
    voices = synth.getVoices() || [];
  }
  return voices;
}

export function cancelSpeech() {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
  setSpeaking(false);
}

/**
 * Speak English text with persisted preferences.
 * @param {string} text
 * @param {{ lang?: string, rate?: number, voicePref?: string }} [opts]
 */
export async function speakText(text, opts = {}) {
  const value = String(text || "").trim();
  if (!value || !isSpeechSupported()) return false;

  const prefs = await getSpeechPrefs();
  const voicePref = opts.voicePref || prefs.voicePref;
  const rateKey = opts.rateKey || prefs.rate;
  const rate =
    typeof opts.rate === "number"
      ? opts.rate
      : SPEECH_RATES[rateKey] ?? SPEECH_RATES.normal;

  cancelSpeech();

  const utterance = new SpeechSynthesisUtterance(value);
  utterance.lang = opts.lang || "en-US";
  utterance.rate = rate;

  const voice = pickVoice(loadVoices(), voicePref);
  if (voice) utterance.voice = voice;

  utterance.onstart = () => setSpeaking(true);
  utterance.onend = () => setSpeaking(false);
  utterance.onerror = () => setSpeaking(false);

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    setSpeaking(false);
    return false;
  }
}

/** Warm voices list (call once on app/settings mount). */
export function warmSpeechVoices() {
  if (!isSpeechSupported()) return;
  const synth = window.speechSynthesis;
  synth.getVoices();
  if (typeof synth.addEventListener === "function") {
    synth.addEventListener("voiceschanged", () => synth.getVoices(), { once: true });
  } else {
    synth.onvoiceschanged = () => synth.getVoices();
  }
}
