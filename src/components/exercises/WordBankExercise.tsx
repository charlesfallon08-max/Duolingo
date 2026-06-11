import type { Exercise } from "../../types";

interface Props {
  exercise: Extract<Exercise, { type: "wordbank" }>;
  /** Indices (dans exercise.tokens) des jetons choisis, dans l'ordre */
  chosen: number[];
  onChange: (chosen: number[]) => void;
  locked: boolean;
}

export default function WordBankExercise({ exercise, chosen, onChange, locked }: Props) {
  return (
    <div className="exercise">
      <h2 className="exercise-title">Traduis cette phrase en espagnol</h2>
      <p className="exercise-prompt">🇫🇷 {exercise.promptFr}</p>

      <div className="bank-answer" aria-label="Ta réponse">
        {chosen.length === 0 && <span className="bank-placeholder">Touche les mots ci-dessous…</span>}
        {chosen.map((tokenIdx, pos) => (
          <button
            key={pos}
            className="token chosen"
            disabled={locked}
            onClick={() => onChange(chosen.filter((_, p) => p !== pos))}
          >
            {exercise.tokens[tokenIdx]}
          </button>
        ))}
      </div>

      <div className="bank-pool">
        {exercise.tokens.map((token, i) => {
          const used = chosen.includes(i);
          return (
            <button
              key={i}
              className={`token ${used ? "used" : ""}`}
              disabled={locked || used}
              onClick={() => onChange([...chosen, i])}
            >
              {token}
            </button>
          );
        })}
      </div>
    </div>
  );
}
