import { useCallback, useEffect, useState } from "react";

/**
 * Connexion « Se connecter avec Google » (Google Identity Services),
 * sans aucun serveur : l'identité sert à séparer la progression de
 * chaque joueur sur l'appareil.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, options: object) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export interface GoogleUser {
  id: string;
  email: string | null;
  name: string;
  picture: string | null;
}

export interface GoogleAuthApi {
  /** Faux si VITE_GOOGLE_CLIENT_ID n'est pas configuré : le site reste sans comptes */
  enabled: boolean;
  user: GoogleUser | null;
  /** Affiche le bouton officiel Google dans l'élément donné */
  renderButton: (el: HTMLElement) => void;
  signOut: () => void;
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const USER_KEY = "lingua-user";

function loadStoredUser(): GoogleUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as GoogleUser) : null;
  } catch {
    return null;
  }
}

/** Décode la partie utile (payload) du jeton renvoyé par Google. */
function parseJwt(token: string): Record<string, string | undefined> {
  const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function useGoogleAuth(): GoogleAuthApi {
  const [user, setUser] = useState<GoogleUser | null>(loadStoredUser);
  const [gisReady, setGisReady] = useState(false);

  // Le script Google (chargé dans index.html) arrive de façon asynchrone
  useEffect(() => {
    if (!CLIENT_ID) return;
    if (window.google) {
      setGisReady(true);
      return;
    }
    const timer = setInterval(() => {
      if (window.google) {
        setGisReady(true);
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!CLIENT_ID || !gisReady || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response: { credential: string }) => {
        const payload = parseJwt(response.credential);
        const u: GoogleUser = {
          id: payload.sub ?? "inconnu",
          email: payload.email ?? null,
          name: payload.given_name ?? payload.name ?? "Joueur",
          picture: payload.picture ?? null,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        setUser(u);
      },
    });
  }, [gisReady]);

  const renderButton = useCallback(
    (el: HTMLElement) => {
      if (!gisReady || !window.google) return;
      window.google.accounts.id.renderButton(el, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        locale: "fr",
        width: 280,
      });
    },
    [gisReady],
  );

  const signOut = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    window.google?.accounts.id.disableAutoSelect();
    setUser(null);
  }, []);

  return { enabled: Boolean(CLIENT_ID), user, renderButton, signOut };
}
