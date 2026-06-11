import { useState } from "react";
import type { AuthApi } from "../lib/auth";

interface Props {
  auth: AuthApi;
  onClose: () => void;
}

export default function AuthModal({ auth, onClose }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setInfo(null);
    setBusy(true);
    const result =
      mode === "signin" ? await auth.signIn(email, password) : await auth.signUp(email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
    } else if (result.info) {
      setInfo(result.info);
    } else {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon" style={{ background: "#1cb0f6" }}>
          👤
        </div>
        <h3>{mode === "signin" ? "Connexion" : "Créer un compte"}</h3>
        <p className="modal-sub">
          {mode === "signin"
            ? "Retrouve ta progression sur tous tes appareils."
            : "Ta progression sera sauvegardée en ligne."}
        </p>

        <button
          className="btn btn-google"
          disabled={busy}
          onClick={async () => {
            setError(null);
            const result = await auth.signInWithGoogle();
            if (result.error) setError(result.error);
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          Continuer avec Google
        </button>

        <div className="auth-divider">ou</div>

        <form className="auth-form" onSubmit={submit}>
          <input
            type="email"
            className="type-input"
            placeholder="Adresse email"
            value={email}
            autoComplete="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="type-input"
            placeholder="Mot de passe (6 caractères min.)"
            value={password}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "…" : mode === "signin" ? "Se connecter" : "S'inscrire"}
          </button>
        </form>

        <button
          className="btn btn-ghost"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "signin" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
}
