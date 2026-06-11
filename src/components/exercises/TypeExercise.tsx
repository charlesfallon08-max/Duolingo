import type { Exercise } from "../../types";
import SpanishPrompt from "./SpanishPrompt";

interface Props {
  exercise: Extract<Exercise, { type: "type" }>;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  locked: boolean;
}

export default function TypeExercise({ exercise, value, onChange, onSubmit, locked }: Props) {
  return (
    <div className="exercise">
      <h2 className="exercise-title">Écris la traduction en français</h2>
      <SpanishPrompt text={exercise.promptEs} />
      <input
        className="type-input"
        type="text"
        value={value}
        placeholder="Écris en français…"
        autoFocus
        disabled={locked}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
      />
      <p className="type-hint">Les accents et majuscules ne sont pas pénalisés.</p>
    </div>
  );
}
