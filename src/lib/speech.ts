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

/**
 * Note la qualité probable d'une voix : les navigateurs proposent souvent
 * plusieurs voix espagnoles, des plus robotiques aux voix neuronales très
 * naturelles — mais ne mettent pas les meilleures en premier.
 */
function voiceScore(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let score = 0;
  // Voix neuronales de Edge (ex. "Microsoft Elvira Online (Natural)")
  if (name.includes("natural")) score += 100;
  // Voix en ligne de Chrome, bien meilleures que les voix systèmes
  if (name.includes("google")) score += 80;
  // Voix améliorées d'iOS / macOS
  if (name.includes("premium") || name.includes("enhanced")) score += 70;
  // Bonnes voix connues d'Apple
  if (/m[oó]nica|paulina|marisol/.test(name)) score += 40;
  // Les voix distantes sont en général de meilleure qualité que les locales
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

/** Lit un texte à voix haute en espagnol (ne fait rien si le son est coupé). */
export function speakSpanish(text: string, opts: { slow?: boolean } = {}) {
  if (!speechSupported || !enabled) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-ES";
  const voice = bestSpanishVoice();
  if (voice) u.voice = voice;
  u.rate = opts.slow ? 0.65 : 0.95;
  speechSynthesis.speak(u);
}
