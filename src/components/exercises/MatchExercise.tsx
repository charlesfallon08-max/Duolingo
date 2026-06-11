import { useMemo, useState } from "react";
import type { Exercise } from "../../types";
import { shuffle } from "../../lib/text";

interface Props {
  exercise: Extract<Exercise, { type: "match" }>;
  /** Une erreur d'association compte seulement pour la précision */
  onMistake: () => void;
  onComplete: () => void;
}

export default function MatchExercise({ exercise, onMistake, onComplete }: Props) {
  const left = useMemo(() => shuffle(exercise.pairs.map((p) => p.es)), [exercise]);
  const right = useMemo(() => shuffle(exercise.pairs.map((p) => p.fr)), [exercise]);
  const [selEs, setSelEs] = useState<string | null>(null);
  const [selFr, setSelFr] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [shakeKey, setShakeKey] = useState(0);

  function tryMatch(es: string | null, fr: string | null) {
    if (es === null || fr === null) return;
    const pair = exercise.pairs.find((p) => p.es === es);
    if (pair && pair.fr === fr) {
      const next = new Set(matched).add(es);
      setMatched(next);
      setSelEs(null);
      setSelFr(null);
      if (next.size === exercise.pairs.length) onComplete();
    } else {
      onMistake();
      setShakeKey((k) => k + 1);
      setSelEs(null);
      setSelFr(null);
    }
  }

  const frMatched = new Set(
    exercise.pairs.filter((p) => matched.has(p.es)).map((p) => p.fr),
  );

  return (
    <div className="exercise" key={shakeKey}>
      <h2 className="exercise-title">Associe les paires</h2>
      <div className="match-grid">
        <div className="match-col">
          {left.map((es) => (
            <button
              key={es}
              className={`choice ${selEs === es ? "selected" : ""} ${matched.has(es) ? "matched" : ""}`}
              disabled={matched.has(es)}
              onClick={() => {
                const v = selEs === es ? null : es;
                setSelEs(v);
                tryMatch(v, selFr);
              }}
            >
              {es}
            </button>
          ))}
        </div>
        <div className="match-col">
          {right.map((fr) => (
            <button
              key={fr}
              className={`choice ${selFr === fr ? "selected" : ""} ${frMatched.has(fr) ? "matched" : ""}`}
              disabled={frMatched.has(fr)}
              onClick={() => {
                const v = selFr === fr ? null : fr;
                setSelFr(v);
                tryMatch(selEs, v);
              }}
            >
              {fr}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
