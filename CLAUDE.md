@AGENTS.md

# Projet

Planificateur de repas « zéro gaspi » pour iPhone, bilingue EN-US / FR, qui part des recettes de l'utilisateur.
Expo SDK 58, Expo Router (`src/app/`), TypeScript strict, expo-sqlite + Drizzle, Supabase, RevenueCat.

Non négociable : on n'invente ni ne réécrit jamais une recette importée (champ douteux → `needsReview`,
ingrédient inconnu → `unmatched`) ; allergies, régimes et équipement sont des règles codées et testées, jamais
confiées à un modèle de langage ; aucune recette ni image générée par IA ; le planificateur est déterministe et
tourne sur l'appareil.

# Structure

- `src/app/` : écrans (routes Expo Router) uniquement.
- `src/features/<domaine>/` : logique métier pure + tests à côté (`*.test.ts`).
- `src/ui/` : composants et tokens de la DA. `src/lib/` : utilitaires transverses.
- `data/` : référentiels (ingrédients, conditionnements). `supabase/` : migrations SQL, RLS, Edge Functions.
- `design/` : DA, canvas HTML, prototypes GSAP. `docs/` : décisions, `docs/shortcuts.md`.

# Règles de code (s'appliquent à chaque ligne)

1. **Ponytail, du premier au dernier commit.** Avant chaque fonctionnalité : est-ce que ça doit exister ? Le code
   existe-t-il déjà ? La plateforme ou une dépendance installée le fait-elle ? Est-ce que ça tient en une ligne ?
   Seulement ensuite, le minimum qui marche. Fichier > 200 lignes ou fonction > 40 lignes : justifier ou découper.
   Ponytail ne coupe jamais : validation des entrées, sécurité, pertes de données, accessibilité.
2. **ECC à chaque fonctionnalité.**
   - Avant de coder : plan court ECC (fichiers touchés, risques, tests).
   - Toute logique (planificateur, conversions, arrondis aux paquets, filtres d'allergènes, parsing d'import,
     règles du gratuit) en TDD (`tdd-workflow`) : test rouge → code minimum → test vert.
   - Après chaque fonctionnalité : `/code-review` ECC en contexte neuf, puis `/ponytail-review` sur le diff.
     Tout ce qui est remonté est corrigé.
   - Avant chaque fin d'étape : `/security-scan` (OWASP, secrets, RLS, Edge Function, stockage local) et
     `/quality-gate`. Boucle `verification-loop` jusqu'au vert.
3. **Zéro erreur.** Terminé seulement si, simultanément : `npm run typecheck` 0 erreur ; `npm run lint` 0 erreur
   et 0 avertissement ; `npm test` vert avec un test par branche de logique métier ; `npx expo-doctor` 0 problème ;
   l'app démarre sans écran rouge, sans avertissement jaune, sans erreur console ; revues ECC, ponytail et audit
   sécurité sans point bloquant. On exécute et on lit la sortie, on ne suppose jamais. Cause racine toujours :
   interdits `any`, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, désactivation de règle ou de test.
   Raccourci : `npm run check`.
4. **Aucun commentaire.** Le code se lit par ses noms. Seule exception : un POURQUOI non évident et important
   (bug de plateforme, contrainte légale, choix de sécurité). Pas de JSDoc décoratif, pas de `TODO`.
   **Pas de commentaires `shortcut:` de Ponytail** : chaque raccourci volontaire est consigné dans
   `docs/shortcuts.md` (fichier, limite, quand l'améliorer).
5. **Sécurité et données.** Aucun secret dans l'app ni dans le dépôt (`.env` ignoré ; secrets EAS et Supabase).
   RLS sur toutes les tables, par `household_id`, testé. Validation zod à chaque frontière (Edge Function, import,
   stockage). La clé du modèle de langage ne quitte jamais le serveur.
6. **Un commit par étape qui marche**, message clair. Jamais de commit avec un test rouge.

# Dépendances

Toujours `npx expo install <pkg>` (jamais `npm install <pkg>`), puis vérifier qu'un outil de dev atterrit bien
dans `devDependencies`. TypeScript 6 : les types globaux se déclarent dans `tsconfig.json` (`types`).

# Animations

Dans l'app : Reanimated (worklets thread UI) + Gesture Handler + expo-haptics, skill `animate-expo`.
Respecter « Réduire les animations ». GSAP uniquement dans `design/` (prototypes HTML).
