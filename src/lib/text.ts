/** Normalise un texte pour la comparaison : minuscules, sans accents ni ponctuation. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/[¿¡?!.,;:"()«»-]/g, " ")
    .replace(/['’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Découpe une phrase espagnole en jetons affichables (ponctuation retirée). */
export function tokenize(sentence: string): string[] {
  return sentence
    .replace(/[¿¡?!.,;:"()«»]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
