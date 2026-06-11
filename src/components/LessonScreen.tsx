import { useMemo, useState } from "react";
import type { Exercise, Lesson, Unit } from "../types";
import { buildSession, checkTyped, checkWordBank } from "../lib/exercises";
import { XP_LESSON, XP_PERFECT_BONUS, XP_PRACTICE } from "../lib/progress";
import ChoiceExercise from "./exercises/ChoiceExercise";
import WordBankExercise from "./exercises/WordBankExercise";
import TypeExercise from "./exercises/TypeExercise";
import MatchExercise from "./exercises/MatchExercise";

interface LessonScreenProps {
  unit: Unit;
  lesson: Lesson;
  practice: boolean;
  onComplete: (perfect: boolean) => void;
  onExit: () => void;
}

type Phase = "answering" | "correct" | "wrong" | "done";

function correctAnswerOf(ex: Exercise): string {
  switch (ex.type) {
    case "choice":
      return ex.options[ex.correctIndex];
    case "wordbank":
      return ex.targetEs;
    case "type":
      return ex.answers[0];
    case "match":
      return "";
  }
}

export default function LessonScreen({
  unit,
  lesson,
  practice,
  onComplete,
  onExit,
}: LessonScreenProps) {
  const exercises = useMemo(() => buildSession(lesson, unit), [lesson, unit]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [mistakes, setMistakes] = useState(0);
  // Réponse en cours selon le type d'exercice
  const [choiceIdx, setChoiceIdx] = useState<number | null>(null);
  const [bankChosen, setBankChosen] = useState<number[]>([]);
  const [typed, setTyped] = useState("");

  const exercise = exercises[index];
  const total = exercises.length;

  const canCheck =
    phase === "answering" &&
    (exercise.type === "choice"
      ? choiceIdx !== null
      : exercise.type === "wordbank"
        ? bankChosen.length > 0
        : exercise.type === "type"
          ? typed.trim().length > 0
          : false);

  function check() {
    if (!canCheck) return;
    let ok = false;
    if (exercise.type === "choice") ok = choiceIdx === exercise.correctIndex;
    else if (exercise.type === "wordbank")
      ok = checkWordBank(bankChosen.map((i) => exercise.tokens[i]), exercise.targetEs);
    else if (exercise.type === "type") ok = checkTyped(typed, exercise.answers);

    if (ok) {
      setPhase("correct");
    } else {
      setPhase("wrong");
      setMistakes((m) => m + 1);
    }
  }

  function next() {
    if (index + 1 >= total) {
      onComplete(mistakes === 0);
      setPhase("done");
      return;
    }
    setIndex(index + 1);
    setPhase("answering");
    setChoiceIdx(null);
    setBankChosen([]);
    setTyped("");
  }

  if (phase === "done") {
    const xp = practice ? XP_PRACTICE : XP_LESSON + (mistakes === 0 ? XP_PERFECT_BONUS : 0);
    return (
      <div className="lesson-end">
        <div className="end-emoji">{mistakes === 0 ? "🏆" : "🎉"}</div>
        <h2>{mistakes === 0 ? "Sans faute, incroyable !" : "Leçon terminée !"}</h2>
        <div className="end-cards">
          <div className="end-card xp-card">
            <span className="end-card-label">XP gagnés</span>
            <span className="end-card-value">⚡ +{xp}</span>
          </div>
          <div className="end-card">
            <span className="end-card-label">Précision</span>
            <span className="end-card-value">
              {Math.round((total / (total + mistakes)) * 100)} %
            </span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={onExit}>
          Continuer
        </button>
      </div>
    );
  }

  return (
    <div className="lesson">
      <header className="lesson-top">
        <button className="quit" onClick={onExit} aria-label="Quitter la leçon">
          ✕
        </button>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(index / total) * 100}%` }} />
        </div>
        <div className="lesson-hearts">{practice ? "🔁" : lesson.icon}</div>
      </header>

      <main className="exercise-area">
        {exercise.type === "choice" && (
          <ChoiceExercise
            exercise={exercise}
            selected={choiceIdx}
            onSelect={setChoiceIdx}
            locked={phase !== "answering"}
          />
        )}
        {exercise.type === "wordbank" && (
          <WordBankExercise
            exercise={exercise}
            chosen={bankChosen}
            onChange={setBankChosen}
            locked={phase !== "answering"}
          />
        )}
        {exercise.type === "type" && (
          <TypeExercise
            exercise={exercise}
            value={typed}
            onChange={setTyped}
            onSubmit={check}
            locked={phase !== "answering"}
          />
        )}
        {exercise.type === "match" && (
          <MatchExercise
            exercise={exercise}
            onMistake={() => setMistakes((m) => m + 1)}
            onComplete={() => setPhase("correct")}
          />
        )}
      </main>

      <footer className={`lesson-footer ${phase}`}>
        {phase === "answering" ? (
          exercise.type === "match" ? (
            <p className="footer-hint">Associe toutes les paires pour continuer</p>
          ) : (
            <button className="btn btn-primary" disabled={!canCheck} onClick={check}>
              Valider
            </button>
          )
        ) : (
          <div className="feedback">
            <div className="feedback-text">
              {phase === "correct" ? (
                <strong>Excellent ! ✅</strong>
              ) : (
                <>
                  <strong>Incorrect ❌</strong>
                  <span>Bonne réponse : {correctAnswerOf(exercise)}</span>
                </>
              )}
            </div>
            <button
              className={`btn ${phase === "correct" ? "btn-primary" : "btn-danger"}`}
              onClick={next}
              autoFocus
            >
              Continuer
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
