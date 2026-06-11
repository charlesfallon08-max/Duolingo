# Activer les comptes utilisateurs (Supabase) — guide pas à pas

Sans cette configuration, le site fonctionne normalement mais la progression
reste locale à chaque appareil. Une fois configuré, un bouton **« Se
connecter »** apparaît et la progression suit l'utilisateur partout.

Durée : ~5 minutes. Gratuit, sans carte bancaire.

## Étape 1 — Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **Start your project** →
   inscris-toi (tu peux utiliser ton compte GitHub).
2. Clique sur **New project** : choisis un nom (ex. `lingua`), un mot de passe
   de base de données (garde-le quelque part), une région en Europe, puis
   **Create new project**. Attends 1 à 2 minutes qu'il soit prêt.

## Étape 2 — Créer la table de progression

1. Dans le menu de gauche, ouvre **SQL Editor**.
2. Colle tout le contenu du fichier [`supabase/setup.sql`](supabase/setup.sql)
   de ce dépôt, puis clique sur **Run**. C'est tout.

## Étape 3 — Récupérer les 2 valeurs de configuration

1. Menu de gauche → **Project Settings** (roue dentée) → **API**.
2. Note ces deux valeurs :
   - **Project URL** (ressemble à `https://abcdefgh.supabase.co`)
   - **anon public** key (longue chaîne commençant par `eyJ…`)

> Cette clé « anon » est faite pour être publique : la sécurité est assurée
> côté serveur par les règles posées à l'étape 2.

## Étape 4 — Donner ces valeurs au site

### Sur Vercel (site en ligne)

1. [vercel.com](https://vercel.com) → ton projet **Duolingo** → onglet
   **Settings** → **Environment Variables**.
2. Ajoute les deux variables :
   - `VITE_SUPABASE_URL` = ta Project URL
   - `VITE_SUPABASE_ANON_KEY` = ta clé anon
3. Onglet **Deployments** → menu `…` du dernier déploiement → **Redeploy**.

### En local (optionnel, pour tester sur ton ordi)

Copie `.env.example` en `.env.local`, remplis les deux valeurs, puis relance
`npm run dev`.

## Étape 5 — (Conseillé) Simplifier l'inscription

Par défaut, Supabase demande de confirmer son adresse email en cliquant sur un
lien. Pour permettre de jouer immédiatement après l'inscription :

1. Supabase → **Authentication** → **Sign In / Up** → fournisseur **Email**.
2. Désactive **Confirm email** et sauvegarde.

## Étape 6 — (Optionnel) Activer « Continuer avec Google »

Le bouton Google est déjà dans le site ; il faut juste donner à Supabase des
identifiants Google. Durée : ~10 minutes, gratuit.

1. **Récupère l'adresse de retour Supabase** : Supabase → **Authentication** →
   **Sign In / Up** → fournisseur **Google** → copie la **Callback URL**
   (ressemble à `https://xxxx.supabase.co/auth/v1/callback`). Garde cette page
   ouverte.
2. **Crée les identifiants Google** sur
   [console.cloud.google.com](https://console.cloud.google.com) :
   - Crée un projet (ex. `lingua`).
   - Menu → **APIs & Services** → **OAuth consent screen** : type **External**,
     renseigne le nom de l'appli et ton email, sauvegarde (tu peux ignorer les
     étapes facultatives).
   - Menu → **APIs & Services** → **Credentials** → **Create credentials** →
     **OAuth client ID** → type **Web application** :
     - « Authorized JavaScript origins » : l'adresse de ton site
       (ex. `https://duolingo-xxx.vercel.app`)
     - « Authorized redirect URIs » : la **Callback URL** copiée à l'étape 1
   - Valide : Google t'affiche un **Client ID** et un **Client secret**.
3. **Colle-les dans Supabase** : retourne sur la page Google de l'étape 1,
   active le fournisseur, colle Client ID + Client secret, sauvegarde.
4. **Déclare l'adresse de ton site** : Supabase → **Authentication** →
   **URL Configuration** → mets ton adresse Vercel dans **Site URL** (c'est là
   que Google renverra les joueurs après connexion).

> Si Google affiche un écran « appli non vérifiée » pendant tes tests : dans
> l'OAuth consent screen, ajoute ton adresse Gmail comme « Test user », ou
> clique sur « Publish app ».

## C'est terminé 🎉

Recharge le site : le bouton **Se connecter** apparaît en haut à droite.
La progression locale existante est conservée et fusionnée avec le compte à la
première connexion (rien n'est perdu).
