const STORAGE_KEY = "lingua-sound";

export const speechSupported =
  typeof window !== "undefined" && "speechSynthesis" in window;

let enabled = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
})();

export function isSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* stockage indisponible */
  }
  if (!on) {
    currentAudio?.pause();
    currentAudio = null;
    if (speechSupported) speechSynthesis.cancel();
  }
}

// ── ElevenLabs via /api/speak ──────────────────────────────────────────────

let currentAudio: HTMLAudioElement | null = null;
const audioCache = new Map<string, string>(); // cacheKey → object URL

async function speakElevenLabs(text: string, slow: boolean): Promise<boolean> {
  const key = `${slow ? "slow:" : ""}${text}`;
  let url = audioCache.get(key);

  if (!url) {
    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, slow }),
    });
    if (!res.ok) return false;
    const blob = await res.blob();
    url = URL.createObjectURL(blob);
    audioCache.set(key, url);
  }

  currentAudio?.pause();
  const audio = new Audio(url);
  currentAudio = audio;
  audio.play();
  return true;
}

// ── Fallback : Web Speech API ──────────────────────────────────────────────

let voices: SpeechSynthesisVoice[] = [];
if (speechSupported) {
  const refresh = () => { voices = speechSynthesis.getVoices(); };
  refresh();
  speechSynthesis.addEventListener("voiceschanged", refresh);
}

function voiceScore(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let score = 0;
  if (name.includes("natural")) score += 100;
  if (name.includes("google")) score += 80;
  if (name.includes("premium") || name.includes("enhanced")) score += 70;
  if (/m[oó]nica|paulina|marisol/.test(name)) score += 40;
  if (!v.localService) score += 20;
  if (lang.startsWith("es-es")) score += 10;
  else if (lang.startsWith("es-mx") || lang.startsWith("es-us")) score += 5;
  return score;
}

function bestSpanishVoice(): SpeechSynthesisVoice | null {
  const es = voices.filter((v) => v.lang.toLowerCase().startsWith("es"));
  if (es.length === 0) return null;
  return es.reduce((best, v) => (voiceScore(v) > voiceScore(best) ? v : best));
}

function speakFallback(text: string, slow: boolean) {
  if (!speechSupported) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-ES";
  const voice = bestSpanishVoice();
  if (voice) u.voice = voice;
  u.rate = slow ? 0.65 : 0.95;
  speechSynthesis.speak(u);
}

// ── API publique ───────────────────────────────────────────────────────────

export function speakSpanish(text: string, opts: { slow?: boolean } = {}) {
  if (!enabled) return;
  const slow = opts.slow ?? false;
  speakElevenLabs(text, slow).then((ok) => {
    if (!ok) speakFallback(text, slow);
  });
}
