# Activer la connexion Google — guide pas à pas

Le site affiche une page « Continuer avec Google » à l'entrée dès que la
configuration ci-dessous est faite. Sans elle, le site s'ouvre directement
(mode sans comptes). Il n'y a **qu'une seule valeur à créer** : un « Client ID »
Google. Durée : ~10 minutes, gratuit.

> À savoir : la connexion sert à mettre la progression au nom du joueur sur
> l'appareil utilisé. Il n'y a pas de serveur, donc la progression ne se
> synchronise pas entre plusieurs appareils.

## Étape 1 — Créer un projet Google

1. Va sur [console.cloud.google.com](https://console.cloud.google.com) et
   connecte-toi avec ton compte Google.
2. En haut à gauche, clique sur le sélecteur de projet → **New project** →
   nomme-le (ex. `lingua`) → **Create**, puis sélectionne-le.

## Étape 2 — Écran de consentement

1. Menu ☰ → **APIs & Services** → **OAuth consent screen**.
2. Choisis **External**, puis renseigne juste le nom de l'appli (ex. `Lingua`)
   et ton adresse email là où c'est obligatoire. Sauvegarde — tu peux ignorer
   toutes les étapes facultatives.
3. Si Google te parle de « Publishing status », clique sur **Publish app**
   (sinon seuls des comptes de test pourront se connecter).

## Étape 3 — Créer le Client ID

1. Menu ☰ → **APIs & Services** → **Credentials** → **Create credentials** →
   **OAuth client ID**.
2. Type d'application : **Web application**.
3. Dans **Authorized JavaScript origins**, ajoute :
   - `https://ton-site.vercel.app` (l'adresse exacte de ton site)
   - `http://localhost:5173` (pour tester sur ton ordinateur)
4. Valide : Google t'affiche ton **Client ID** (il se termine par
   `.apps.googleusercontent.com`). Copie-le ; le « Client secret » ne sert pas.

## Étape 4 — Donner le Client ID au site

### Sur Vercel (site en ligne)

1. [vercel.com](https://vercel.com) → ton projet → **Settings** →
   **Environment Variables**.
2. Ajoute : `VITE_GOOGLE_CLIENT_ID` = ton Client ID.
3. Onglet **Deployments** → menu `…` du dernier déploiement → **Redeploy**.

### En local (optionnel)

Copie `.env.example` en `.env.local`, colle ton Client ID, relance
`npm run dev`.

## C'est terminé 🎉

Ouvre ton site : la page « Continuer avec Google » apparaît. Après connexion,
le prénom et la photo du joueur s'affichent en haut à droite, et sa
progression est enregistrée à son nom. Le bouton « Continuer sans compte »
permet de jouer sans se connecter.
