import { useCallback, useEffect, useState } from "react";
import type { Progress } from "../types";
import { course } from "../data/course";

export const XP_LESSON = 10;
export const XP_PERFECT_BONUS = 5;
export const XP_PRACTICE = 5;
export const XP_PER_LEVEL = 50;

const STORAGE_KEY = "lingua-progress-v1";

function defaultProgress(): Progress {
  return { xp: 0, lessons: {} };
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const saved = JSON.parse(raw) as Partial<Progress>;
    return { xp: saved.xp ?? 0, lessons: saved.lessons ?? {} };
  } catch {
    return defaultProgress();
  }
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

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
