import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import config from "../firebase-config.json";

/**
 * Configuration Firebase (voir INSTALLATION-FIREBASE.md).
 * Ces valeurs sont publiques par nature : la sécurité repose sur les règles
 * Firestore et les domaines autorisés. Tant que le fichier de configuration
 * est vide, le site fonctionne sans comptes (progression locale).
 */
export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

const app = firebaseEnabled ? initializeApp(config) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
