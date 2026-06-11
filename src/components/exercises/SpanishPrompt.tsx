import { useEffect } from "react";
import { speakSpanish, speechSupported } from "../../lib/speech";

interface Props {
  text: string;
}

/** Affiche un texte espagnol avec lecture automatique et boutons d'écoute. */
export default function SpanishPrompt({ text }: Props) {
  useEffect(() => {
    speakSpanish(text);
  }, [text]);

  return (
    <p className="exercise-prompt">
      <span>🇪🇸 {text}</span>
      {speechSupported && (
        <span className="speak-group">
          <button
            className="speak-btn"
            onClick={() => speakSpanish(text)}
            aria-label="Écouter"
            title="Écouter"
          >
            🔊
          </button>
          {text.includes(" ") && (
            <button
              className="speak-btn"
              onClick={() => speakSpanish(text, { slow: true })}
              aria-label="Écouter lentement"
              title="Écouter lentement"
            >
              🐢
            </button>
          )}
        </span>
      )}
    </p>
  );
}
