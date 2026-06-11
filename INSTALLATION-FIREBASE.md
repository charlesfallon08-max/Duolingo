# Activer les comptes Google + sauvegarde en ligne (Firebase)

Une fois configuré : page « Continuer avec Google » à l'entrée du site, et
progression sauvegardée en ligne — on la retrouve sur tous ses appareils.
Sans configuration, le site s'ouvre directement en mode local.

Durée : ~10 minutes. Gratuit, sans carte bancaire. Tout se passe au même
endroit : [console.firebase.google.com](https://console.firebase.google.com).

## Étape 1 — Créer le projet Firebase

1. Va sur [console.firebase.google.com](https://console.firebase.google.com)
   et connecte-toi avec ton compte Google.
2. **Create a project** (ou « Ajouter un projet ») → nomme-le (ex. `lingua`).
3. Quand on te propose **Google Analytics**, tu peux le désactiver. → **Create**.

## Étape 2 — Activer la connexion Google

1. Menu de gauche → **Build** → **Authentication** → **Get started**.
2. Onglet **Sign-in method** → choisis **Google** → **Enable**.
3. Renseigne l'email d'assistance demandé → **Save**.

C'est tout : pas besoin de passer par la console Google Cloud, Firebase crée
les identifiants tout seul. 🎉

## Étape 3 — Autoriser ton site

1. Toujours dans **Authentication** → onglet **Settings** →
   **Authorized domains** → **Add domain**.
2. Ajoute le domaine de ton site, **sans** `https://` (ex.
   `duolingo-xxx.vercel.app`). `localhost` est déjà autorisé pour tes tests.

## Étape 4 — Créer la base de données

1. Menu de gauche → **Build** → **Firestore Database** → **Create database**.
2. Choisis une région en Europe (ex. `europe-west9` = Paris) → mode
   **production** → **Create**.
3. Onglet **Rules** : remplace tout le contenu par celui du fichier
   [`firebase/firestore.rules`](firebase/firestore.rules) de ce dépôt →
   **Publish**.

## Étape 5 — Récupérer la configuration et me l'envoyer

1. Roue dentée en haut à gauche → **Project settings** → onglet **General**.
2. Descends jusqu'à **Your apps** → clique sur l'icône **`</>`** (Web) →
   donne un surnom (ex. `lingua-web`) → **Register app** (sans Hosting).
3. Firebase affiche un bloc de code contenant `const firebaseConfig = { … }`.
   **Copie ce bloc et envoie-le-moi** : je le mets dans
   `src/firebase-config.json` et je pousse. (Ces valeurs sont publiques, tu
   peux les partager sans risque — la sécurité vient des règles de l'étape 4.)

Tu peux aussi le faire toi-même : recopie les valeurs dans
`src/firebase-config.json`, puis commit.

## C'est terminé 🎉

Après le déploiement, le site accueille les joueurs avec « Continuer avec
Google ». La progression de chaque joueur est sauvegardée en ligne et le suit
sur tous ses appareils. « Continuer sans compte » reste possible (progression
locale uniquement).
