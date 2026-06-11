import type { Exercise } from "../../types";

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
      <p className="exercise-prompt">
        {exercise.promptLang === "es" ? "🇪🇸" : "🇫🇷"} {exercise.prompt}
      </p>
      <div className="choices">
        {exercise.options.map((opt, i) => (
          <button
            key={i}
            className={`choice ${selected === i ? "selected" : ""}`}
            disabled={locked}
            onClick={() => onSelect(i)}
          >
            <span className="choice-num">{i + 1}</span> {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
