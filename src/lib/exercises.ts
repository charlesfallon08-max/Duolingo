import type { Exercise, Lesson, Unit, VocabItem } from "../types";
import { normalize, pick, shuffle, tokenize } from "./text";

/**
 * Construit une session d'exercices (~10) à partir d'une leçon.
 * Les intrus (mauvaises réponses des QCM, mots en trop de la banque de mots)
 * sont tirés des autres leçons du chapitre pour rester plausibles.
 */
export function buildSession(lesson: Lesson, unit: Unit): Exercise[] {
  const words = lesson.items.filter((i) => !i.sentence);
  const sentences = lesson.items.filter((i) => i.sentence);

  // Réservoir d'intrus : tous les mots du chapitre, hors leçon courante en priorité
  const unitWords = unit.lessons.flatMap((l) => l.items.filter((i) => !i.sentence));

  const exercises: Exercise[] = [];

  // QCM dans les deux sens sur des mots variés
  for (const item of pick(words, 4)) {
    exercises.push(
      Math.random() < 0.5
        ? makeChoiceEsToFr(item, unitWords)
        : makeChoiceFrToEs(item, unitWords),
    );
  }

  // Banque de mots sur les phrases de la leçon
  for (const item of pick(sentences, 2)) {
    exercises.push(makeWordBank(item, unitWords));
  }

  // Saisie libre (espagnol -> français)
  for (const item of pick(words, 2)) {
    exercises.push({
      type: "type",
      promptEs: item.es,
      answers: [item.fr, ...(item.altFr ?? [])],
    });
  }

  // Paires à associer
  exercises.push(makeMatch(words));

  // QCM supplémentaire sur une phrase pour finir
  if (sentences.length > 0) {
    const item = pick(sentences, 1)[0];
    exercises.push(makeChoiceEsToFr(item, sentences.length > 2 ? sentences : unit.lessons.flatMap((l) => l.items.filter((i) => i.sentence))));
  }

  return shuffle(exercises);
}

function distractors(correct: VocabItem, pool: VocabItem[], field: "es" | "fr", n: number): string[] {
  const seen = new Set([normalize(correct[field])]);
  const out: string[] = [];
  for (const item of shuffle(pool)) {
    const value = item[field];
    if (seen.has(normalize(value))) continue;
    seen.add(normalize(value));
    out.push(value);
    if (out.length === n) break;
  }
  return out;
}

function makeChoiceEsToFr(item: VocabItem, pool: VocabItem[]): Exercise {
  const options = shuffle([item.fr, ...distractors(item, pool, "fr", 3)]);
  return {
    type: "choice",
    prompt: item.es,
    promptLang: "es",
    options,
    correctIndex: options.indexOf(item.fr),
  };
}

function makeChoiceFrToEs(item: VocabItem, pool: VocabItem[]): Exercise {
  const options = shuffle([item.es, ...distractors(item, pool, "es", 3)]);
  return {
    type: "choice",
    prompt: item.fr,
    promptLang: "fr",
    options,
    correctIndex: options.indexOf(item.es),
  };
}

function makeWordBank(item: VocabItem, unitWords: VocabItem[]): Exercise {
  const target = tokenize(item.es);
  const targetSet = new Set(target.map(normalize));
  const extraPool = unitWords
    .flatMap((w) => tokenize(w.es))
    .filter((t) => !targetSet.has(normalize(t)));
  const uniqueExtras = [...new Map(extraPool.map((t) => [normalize(t), t])).values()];
  return {
    type: "wordbank",
    promptFr: item.fr,
    targetEs: item.es,
    tokens: shuffle([...target, ...pick(uniqueExtras, 3)]),
  };
}

function makeMatch(words: VocabItem[]): Exercise {
  // Évite deux paires avec la même traduction (ex. deux mots rendus par « bonjour »)
  const chosen: VocabItem[] = [];
  const usedFr = new Set<string>();
  for (const w of shuffle(words)) {
    if (usedFr.has(normalize(w.fr))) continue;
    usedFr.add(normalize(w.fr));
    chosen.push(w);
    if (chosen.length === 4) break;
  }
  return { type: "match", pairs: chosen.map((w) => ({ es: w.es, fr: w.fr })) };
}

/** Vérifie une réponse en saisie libre. */
export function checkTyped(answer: string, accepted: string[]): boolean {
  const a = normalize(answer);
  return a.length > 0 && accepted.some((acc) => normalize(acc) === a);
}

/** Vérifie l'ordre des jetons choisis dans une banque de mots. */
export function checkWordBank(chosen: string[], targetEs: string): boolean {
  const target = tokenize(targetEs).map(normalize);
  const got = chosen.map(normalize);
  return got.length === target.length && got.every((t, i) => t === target[i]);
}
