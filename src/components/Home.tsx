import { useState } from "react";
import { course } from "../data/course";
import {
  isLessonUnlocked,
  levelFromXp,
  nextHeartIn,
  xpIntoLevel,
  XP_PER_LEVEL,
} from "../lib/progress";
import type { Lesson, Progress, Unit } from "../types";

interface HomeProps {
  progress: Progress;
  onStartLesson: (unitId: string, lessonId: string, practice: boolean) => void;
}

interface Selected {
  unit: Unit;
  lesson: Lesson;
  unlocked: boolean;
  completed: boolean;
}

function formatCountdown(ms: number): string {
  const totalMin = Math.ceil(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h} h ${m.toString().padStart(2, "0")} min` : `${m} min`;
}

export default function Home({ progress, onStartLesson }: HomeProps) {
  const [selected, setSelected] = useState<Selected | null>(null);
  const level = levelFromXp(progress.xp);
  const heartWait = nextHeartIn(progress);

  return (
    <div className="home">
      <header className="topbar">
        <div className="brand">
          <span className="brand-flag">🇪🇸</span> Lingua
        </div>
        <div className="stats">
          <div className="stat hearts" title="Tes cœurs">
            ❤️ {progress.hearts}
            {heartWait !== null && (
              <span className="heart-timer">+1 dans {formatCountdown(heartWait)}</span>
            )}
          </div>
          <div className="stat xp" title="Tes points d'expérience">
            ⚡ {progress.xp} XP
          </div>
          <div className="stat level" title={`${xpIntoLevel(progress.xp)} / ${XP_PER_LEVEL} XP vers le niveau ${level + 1}`}>
            <span>Niveau {level}</span>
            <div className="level-bar">
              <div
                className="level-bar-fill"
                style={{ width: `${(xpIntoLevel(progress.xp) / XP_PER_LEVEL) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="path">
        {course.map((unit, ui) => (
          <section key={unit.id} className="unit">
            <div className="unit-banner" style={{ background: unit.color }}>
              <h2>{unit.title}</h2>
              <p>{unit.description}</p>
            </div>
            <div className="lessons">
              {unit.lessons.map((lesson, li) => {
                const unlocked = isLessonUnlocked(progress, ui, li);
                const record = progress.lessons[lesson.id];
                const completed = (record?.completions ?? 0) > 0;
                const offset = [0, 44, 0, -44][li % 4];
                return (
                  <div key={lesson.id} className="lesson-row" style={{ transform: `translateX(${offset}px)` }}>
                    <button
                      className={
                        "lesson-node" +
                        (completed ? " done" : unlocked ? " active" : " locked") +
                        (record?.perfect ? " perfect" : "")
                      }
                      style={unlocked ? { background: unit.color } : undefined}
                      onClick={() => setSelected({ unit, lesson, unlocked, completed })}
                      aria-label={lesson.title}
                    >
                      <span className="lesson-icon">{unlocked ? lesson.icon : "🔒"}</span>
                      {completed && <span className="lesson-check">✓</span>}
                    </button>
                    <span className="lesson-title">{lesson.title}</span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        <footer className="path-end">🏁 D'autres chapitres arrivent bientôt !</footer>
      </main>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon" style={{ background: selected.unlocked ? selected.unit.color : "#e5e5e5" }}>
              {selected.unlocked ? selected.lesson.icon : "🔒"}
            </div>
            <h3>{selected.lesson.title}</h3>
            <p className="modal-sub">
              {selected.unit.title} · {selected.lesson.items.length} mots et phrases
            </p>

            {!selected.unlocked ? (
              <p className="modal-info">Termine la leçon précédente pour débloquer celle-ci.</p>
            ) : selected.completed ? (
              <>
                <p className="modal-info">
                  Leçon déjà terminée{progress.lessons[selected.lesson.id]?.perfect ? " (sans faute 🏆)" : ""}.
                  L'entraînement ne coûte pas de cœur et t'en redonne un !
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => onStartLesson(selected.unit.id, selected.lesson.id, true)}
                >
                  S'entraîner · +5 XP · ❤️ +1
                </button>
              </>
            ) : progress.hearts === 0 ? (
              <p className="modal-info">
                💔 Tu n'as plus de cœurs ! Attends qu'ils se régénèrent ({heartWait !== null ? formatCountdown(heartWait) : ""})
                ou entraîne-toi sur une leçon déjà terminée pour en regagner.
              </p>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => onStartLesson(selected.unit.id, selected.lesson.id, false)}
              >
                Commencer · +10 XP
              </button>
            )}

            <button className="btn btn-ghost" onClick={() => setSelected(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
