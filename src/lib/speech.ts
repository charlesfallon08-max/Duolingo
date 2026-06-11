const STORAGE_KEY = "lingua-sound";

/** La synthèse vocale dépend du navigateur (disponible sur tous les récents). */
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
    /* stockage indisponible : le réglage ne sera pas retenu */
  }
  if (!on && speechSupported) speechSynthesis.cancel();
}

// Les voix se chargent de façon asynchrone selon les navigateurs
let voices: SpeechSynthesisVoice[] = [];
if (speechSupported) {
  const refresh = () => {
    voices = speechSynthesis.getVoices();
  };
  refresh();
  speechSynthesis.addEventListener("voiceschanged", refresh);
}

function bestSpanishVoice(): SpeechSynthesisVoice | null {
  const es = voices.filter((v) => v.lang.toLowerCase().startsWith("es"));
  return es.find((v) => v.lang.toLowerCase().startsWith("es-es")) ?? es[0] ?? null;
}

/** Lit un texte à voix haute en espagnol (ne fait rien si le son est coupé). */
export function speakSpanish(text: string, opts: { slow?: boolean } = {}) {
  if (!speechSupported || !enabled) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-ES";
  const voice = bestSpanishVoice();
  if (voice) u.voice = voice;
  u.rate = opts.slow ? 0.5 : 0.9;
  speechSynthesis.speak(u);
}
