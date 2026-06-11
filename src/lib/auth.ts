import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, firebaseEnabled } from "./firebase";

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  picture: string | null;
}

export interface AuthApi {
  /** Faux si Firebase n'est pas configuré : le site reste sans comptes */
  enabled: boolean;
  /** Faux tant que Firebase n'a pas restauré la session (évite un flash de la page de connexion) */
  ready: boolean;
  user: AuthUser | null;
  /** Ouvre la fenêtre Google ; renvoie un message d'erreur ou null */
  signIn: () => Promise<string | null>;
  signOut: () => void;
}

function frenchError(code: string): string | null {
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request")
    return null; // l'utilisateur a simplement fermé la fenêtre
  if (code === "auth/popup-blocked")
    return "Ton navigateur a bloqué la fenêtre Google : autorise les pop-ups pour ce site.";
  if (code === "auth/network-request-failed")
    return "Problème de connexion internet, réessaie.";
  if (code === "auth/unauthorized-domain")
    return "Ce site n'est pas encore autorisé dans Firebase (Authentication → Settings → Authorized domains).";
  return "La connexion a échoué, réessaie. (" + code + ")";
}

export function useAuth(): AuthApi {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(!firebaseEnabled);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(
        u
          ? {
              id: u.uid,
              name: u.displayName ?? "Joueur",
              email: u.email,
              picture: u.photoURL,
            }
          : null,
      );
      setReady(true);
    });
  }, []);

  return {
    enabled: firebaseEnabled,
    ready,
    user,
    async signIn() {
      if (!auth) return "Comptes non configurés.";
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
        return null;
      } catch (e) {
        const code = (e as { code?: string }).code ?? "inconnu";
        return frenchError(code);
      }
    },
    signOut() {
      if (auth) firebaseSignOut(auth);
    },
  };
}
