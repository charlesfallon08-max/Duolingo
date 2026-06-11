import { useEffect, useState } from "react";
import { accountsEnabled, supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthResult {
  /** Message d'erreur à afficher, ou null si tout s'est bien passé */
  error: string | null;
  /** Message d'information (ex. confirmation d'email envoyée) */
  info?: string;
}

export interface AuthApi {
  enabled: boolean;
  user: AuthUser | null;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

function frenchError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (m.includes("user already registered")) return "Un compte existe déjà avec cet email.";
  if (m.includes("password should be at least"))
    return "Le mot de passe doit faire au moins 6 caractères.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Adresse email invalide.";
  if (m.includes("email not confirmed"))
    return "Email non confirmé : clique sur le lien reçu par email.";
  if (m.includes("rate limit")) return "Trop de tentatives, réessaie dans quelques minutes.";
  return message;
}

export function useAuth(): AuthApi {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUser(u ? { id: u.id, email: u.email ?? null } : null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setUser(u ? { id: u.id, email: u.email ?? null } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    enabled: accountsEnabled,
    user,
    async signUp(email, password) {
      if (!supabase) return { error: "Comptes non configurés." };
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: frenchError(error.message) };
      if (!data.session)
        return {
          error: null,
          info: "Compte créé ! Vérifie ta boîte mail et clique sur le lien de confirmation, puis connecte-toi.",
        };
      return { error: null };
    },
    async signIn(email, password) {
      if (!supabase) return { error: "Comptes non configurés." };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? frenchError(error.message) : null };
    },
    async signInWithGoogle() {
      if (!supabase) return { error: "Comptes non configurés." };
      // Redirige vers Google puis revient sur le site, déjà connecté
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      return { error: error ? frenchError(error.message) : null };
    },
    async signOut() {
      await supabase?.auth.signOut();
    },
  };
}
