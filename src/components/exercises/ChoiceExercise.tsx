import type { Exercise } from "../../types";
import { speakSpanish } from "../../lib/speech";
import SpanishPrompt from "./SpanishPrompt";

interface Props {
  exercise: Extract<Exercise, { type: "choice" }>;
  selected: number | null;
  onSelect: (i: number) => void;
  locked: boolean;
}

export default function ChoiceExercise({ exercise, selected, onSelect, locked }: Props) {
  return (
    <div className="exercise">
      <h2 className="exercise-title">
        {exercise.promptLang === "es"
          ? "Que veut dire cette expression ?"
          : "Comment dit-on en espagnol ?"}
      </h2>
      {exercise.promptLang === "es" ? (
        <SpanishPrompt text={exercise.prompt} />
      ) : (
        <p className="exercise-prompt">🇫🇷 {exercise.prompt}</p>
      )}
      <div className="choices">
        {exercise.options.map((opt, i) => (
          <button
            key={i}
            className={`choice ${selected === i ? "selected" : ""}`}
            disabled={locked}
            onClick={() => {
              onSelect(i);
              // En sens FR → ES, les options sont en espagnol : on les prononce
              if (exercise.promptLang === "fr") speakSpanish(opt);
            }}
          >
            <span className="choice-num">{i + 1}</span> {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
