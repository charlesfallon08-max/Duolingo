import { useCallback, useEffect, useState } from "react";
import type { Progress } from "../types";
import { course } from "../data/course";

export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 30 * 60 * 1000; // 1 cœur toutes les 30 minutes
export const XP_LESSON = 10;
export const XP_PERFECT_BONUS = 5;
export const XP_PRACTICE = 5;
export const XP_PER_LEVEL = 50;

const STORAGE_KEY = "lingua-progress-v1";

function defaultProgress(): Progress {
  return { xp: 0, hearts: MAX_HEARTS, lastHeartAt: Date.now(), lessons: {} };
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...(JSON.parse(raw) as Progress) };
  } catch {
    return defaultProgress();
  }
}

/** Applique la régénération des cœurs écoulée depuis la dernière sauvegarde. */
function withRegen(p: Progress): Progress {
  if (p.hearts >= MAX_HEARTS) return { ...p, lastHeartAt: Date.now() };
  const elapsed = Date.now() - p.lastHeartAt;
  const gained = Math.floor(elapsed / HEART_REGEN_MS);
  if (gained <= 0) return p;
  const hearts = Math.min(MAX_HEARTS, p.hearts + gained);
  const lastHeartAt =
    hearts >= MAX_HEARTS ? Date.now() : p.lastHeartAt + gained * HEART_REGEN_MS;
  return { ...p, hearts, lastHeartAt };
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => withRegen(load()));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // Vérifie la régénération des cœurs toutes les 30 s pour le compte à rebours
  useEffect(() => {
    const id = setInterval(() => setProgress((p) => withRegen(p)), 30_000);
    return () => clearInterval(id);
  }, []);

  const loseHeart = useCallback(() => {
    setProgress((p) => {
      const wasFull = p.hearts >= MAX_HEARTS;
      return {
        ...p,
        hearts: Math.max(0, p.hearts - 1),
        // Le minuteur de régénération démarre quand on quitte les cœurs pleins
        lastHeartAt: wasFull ? Date.now() : p.lastHeartAt,
      };
    });
  }, []);

  const gainHeart = useCallback((n = 1) => {
    setProgress((p) => ({ ...p, hearts: Math.min(MAX_HEARTS, p.hearts + n) }));
  }, []);

  const completeLesson = useCallback(
    (lessonId: string, opts: { perfect: boolean; practice: boolean }) => {
      setProgress((p) => {
        const rec = p.lessons[lessonId] ?? { completions: 0, perfect: false };
        const xpGained = opts.practice
          ? XP_PRACTICE
          : XP_LESSON + (opts.perfect ? XP_PERFECT_BONUS : 0);
        return {
          ...p,
          xp: p.xp + xpGained,
          // S'entraîner sur une leçon déjà réussie redonne un cœur
          hearts: opts.practice ? Math.min(MAX_HEARTS, p.hearts + 1) : p.hearts,
          lessons: {
            ...p.lessons,
            [lessonId]: {
              completions: rec.completions + 1,
              perfect: rec.perfect || opts.perfect,
            },
          },
        };
      });
    },
    [],
  );

  return { progress, loseHeart, gainHeart, completeLesson };
}

/** Une leçon est débloquée si c'est la première ou si la précédente est terminée. */
export function isLessonUnlocked(progress: Progress, unitIndex: number, lessonIndex: number): boolean {
  const flat = course.flatMap((u) => u.lessons.map((l) => l.id));
  const idx = course.slice(0, unitIndex).reduce((n, u) => n + u.lessons.length, 0) + lessonIndex;
  if (idx === 0) return true;
  const prevId = flat[idx - 1];
  return (progress.lessons[prevId]?.completions ?? 0) > 0;
}

/** Temps restant (ms) avant le prochain cœur, ou null si les cœurs sont pleins. */
export function nextHeartIn(progress: Progress): number | null {
  if (progress.hearts >= MAX_HEARTS) return null;
  return Math.max(0, progress.lastHeartAt + HEART_REGEN_MS - Date.now());
}
