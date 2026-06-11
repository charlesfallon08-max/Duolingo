import { useCallback, useEffect, useState } from "react";
import type { Progress } from "../types";
import { course } from "../data/course";
import { supabase } from "./supabase";

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

/** Fusionne deux progressions (appareil + serveur) sans jamais perdre d'acquis. */
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

/**
 * Progression du joueur : toujours sauvegardée en local, et synchronisée
 * avec Supabase quand un utilisateur est connecté (userId non null).
 */
export function useProgress(userId: string | null) {
  const [progress, setProgress] = useState<Progress>(load);

  // À la connexion : récupère la progression du serveur et fusionne
  useEffect(() => {
    if (!supabase || !userId) return;
    let cancelled = false;
    supabase
      .from("progress")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data?.data) return;
        const remote = data.data as Partial<Progress>;
        setProgress((local) =>
          mergeProgress(local, { xp: remote.xp ?? 0, lessons: remote.lessons ?? {} }),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // À chaque changement : sauvegarde locale immédiate + envoi au serveur (différé)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    if (!supabase || !userId) return;
    const client = supabase;
    const timer = setTimeout(() => {
      client
        .from("progress")
        .upsert({ user_id: userId, data: progress, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.warn("Synchronisation impossible :", error.message);
        });
    }, 800);
    return () => clearTimeout(timer);
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
