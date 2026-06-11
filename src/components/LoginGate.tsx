import { useEffect, useRef } from "react";
import type { GoogleAuthApi } from "../lib/googleAuth";

interface Props {
  auth: GoogleAuthApi;
  onSkip: () => void;
}

/** Page de connexion affichée à l'entrée du site. */
export default function LoginGate({ auth, onSkip }: Props) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (buttonRef.current) auth.renderButton(buttonRef.current);
  }, [auth]);

  return (
    <div className="login-gate">
      <div className="login-card">
        <div className="login-logo">🇪🇸</div>
        <h1>Lingua</h1>
        <p className="login-tagline">
          Apprends l'espagnol avec des leçons courtes et ludiques — gratuit et sans limite.
        </p>
        <div className="google-button" ref={buttonRef} />
        <p className="login-hint">
          Connecte-toi pour garder ta progression à ton nom sur cet appareil.
        </p>
        <button className="btn btn-ghost" onClick={onSkip}>
          Continuer sans compte
        </button>
      </div>
    </div>
  );
}
