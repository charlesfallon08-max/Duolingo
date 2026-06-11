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
