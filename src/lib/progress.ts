import { useCallback, useEffect, useState } from "react";
import type { Progress } from "../types";
import { course } from "../data/course";

export const XP_LESSON = 10;
export const XP_PERFECT_BONUS = 5;
export const XP_PRACTICE = 5;
export const XP_PER_LEVEL = 50;

const STORAGE_KEY = "lingua-progress-v1";

/** Chaque compte Google a sa propre progression sur l'appareil. */
function keyFor(userId: string | null): string {
  return userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;
}

function defaultProgress(): Progress {
  return { xp: 0, lessons: {} };
}

function load(key: string): Progress {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultProgress();
    const saved = JSON.parse(raw) as Partial<Progress>;
    return { xp: saved.xp ?? 0, lessons: saved.lessons ?? {} };
  } catch {
    return defaultProgress();
  }
}

/** Fusionne deux progressions sans jamais perdre d'acquis. */
function mergeProgress(a: Progress, b: Progress): Progress {
  const lessons = { ...a.lessons };
  for (const [id, rec] of Object.entries(b.lessons)) {
    const cur = lessons[id];
    lessons[id] = cur
      ? {
          completions: Math.max(cur.completions, rec.completions),
          perfect: cur.perfect || rec.perfect,
        }
      : rec;
  }
  return { xp: Math.max(a.xp, b.xp), lessons };
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function useProgress(userId: string | null) {
  const [progress, setProgress] = useState<Progress>(() => load(keyFor(userId)));

  // Changement de compte : charge la progression du compte, en adoptant
  // ce qui a été fait sans compte sur cet appareil (rien n'est perdu)
  useEffect(() => {
    const own = load(keyFor(userId));
    setProgress(userId ? mergeProgress(own, load(STORAGE_KEY)) : own);
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(keyFor(userId), JSON.stringify(progress));
  }, [progress, userId]);

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

  return { progress, completeLesson };
}

/** Une leçon est débloquée si c'est la première ou si la précédente est terminée. */
export function isLessonUnlocked(progress: Progress, unitIndex: number, lessonIndex: number): boolean {
  const flat = course.flatMap((u) => u.lessons.map((l) => l.id));
  const idx = course.slice(0, unitIndex).reduce((n, u) => n + u.lessons.length, 0) + lessonIndex;
  if (idx === 0) return true;
  const prevId = flat[idx - 1];
  return (progress.lessons[prevId]?.completions ?? 0) > 0;
}
