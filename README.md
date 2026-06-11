# Lingua 🇪🇸

Une plateforme d'apprentissage des langues inspirée de Duolingo, pour apprendre
**l'espagnol** quand on parle français.

## Fonctionnalités

- **Parcours de leçons** : 5 chapitres thématiques (Premiers pas, Nourriture,
  Famille, Voyage, Quotidien) de 4 leçons chacun, débloqués au fur et à mesure.
- **Exercices variés**, générés à partir du vocabulaire de chaque leçon pour que
  chaque session soit différente :
  - QCM (espagnol → français et français → espagnol)
  - Traduction de phrases avec banque de mots
  - Saisie libre (accents et majuscules non pénalisés)
  - Paires à associer
- **Cœurs** : 5 vies, une erreur coûte un cœur ; ils se régénèrent (1 toutes les
  30 minutes) et on peut en regagner en s'entraînant sur une leçon terminée.
- **XP et niveaux** : +10 XP par leçon, +5 de bonus sans faute, +5 XP en
  entraînement. Un niveau tous les 50 XP.
- **Progression sauvegardée** dans le navigateur (localStorage) — pas de compte
  nécessaire pour l'instant.

## Lancer le projet

```bash
npm install
npm run dev       # serveur de développement
npm run build     # build de production (dist/)
```

## Stack

React 18 + TypeScript + Vite, sans backend. Les données du cours vivent dans
`src/data/course.ts` : pour ajouter une leçon ou un chapitre, il suffit d'y
ajouter du vocabulaire, les exercices sont générés automatiquement.
