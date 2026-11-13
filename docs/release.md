# Publier Demidemi sur l'App Store

Runbook de la première soumission puis des mises à jour. Bundle id `app.demidemi.ios`, iPhone uniquement.
Textes de la fiche : `store/metadata/<langue>/`. Notes pour la revue : `store/review-notes.md`. Étiquettes de
confidentialité : `store/privacy-labels.md`.

## 1. Comptes nécessaires

| Service | Ce qu'il faut créer | Où ça sert |
|---|---|---|
| Apple Developer Program | Abonnement, Team ID ; clé Sign in with Apple (fichier .p8, Key ID) | Build, signature, connexion Apple, révocation à la suppression du compte |
| App Store Connect | Fiche d'app `app.demidemi.ios`, nom « Demidemi: Meal Plan, No Waste », langue principale en-US, fr-FR ajoutée | Soumission, achats intégrés |
| Expo / EAS | Projet lié (`npx eas-cli@latest init` écrit `extra.eas.projectId` dans `app.json`) | Builds cloud, variables d'environnement, soumission |
| Supabase | Projet (région UE), Auth › Apple activé avec le Services ID | Compte facultatif, foyer partagé, Edge Functions |
| Anthropic | Clé API dédiée à la production | Lecteur IA des légendes et captures (serveur uniquement) |
| RevenueCat | Projet, app iOS reliée à App Store Connect (clé In-App Purchase .p8) | Abonnements |
| Sentry | Projet React Native, DSN, jeton d'organisation pour l'envoi des source maps | Rapports de plantage |
| PostHog | Projet, région UE, clé publique | Entonnoir anonyme |

## 2. Supabase

```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push
npx supabase secrets set ANTHROPIC_API_KEY=... REVENUECAT_SECRET_KEY=... \
  APPLE_TEAM_ID=... APPLE_KEY_ID=... APPLE_CLIENT_ID=app.demidemi.ios APPLE_PRIVATE_KEY="$(cat AuthKey_XXXX.p8)"
npx supabase functions deploy import-recipe
npx supabase functions deploy apple-token
npx supabase functions deploy delete-account
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sont fournis par Supabase aux fonctions.
`REVENUECAT_SECRET_KEY` est la clé secrète v1 de RevenueCat : elle sert uniquement à effacer l'abonné à la
suppression du compte. Vérifier ensuite que `npm run test:db` passe (RLS par `household_id`).

## 3. Achats intégrés (App Store Connect puis RevenueCat)

1. App Store Connect › Abonnements : un groupe « Demidemi Pro », deux produits auto-renouvelables :
   - annuel : 34,99 USD (palier US) et 29,99 € (France), offre d'introduction « essai gratuit 7 jours »,
     nouveaux abonnés ;
   - mensuel : 6,99 USD et 5,99 €, sans offre.
   Partage familial activé sur les deux. Pas de produit hebdomadaire. Noms et descriptions en en-US et fr-FR.
2. RevenueCat : importer les deux produits, créer l'entitlement `pro` (identifiant exact lu par
   `src/features/subscription/purchase.ts`) et y attacher les deux produits.
3. RevenueCat › Offerings : offering `default` marquée Current, packages `$rc_annual` (annuel) et
   `$rc_monthly` (mensuel). `loadPlans()` exige les deux, sinon le paywall affiche l'erreur.
4. Tester en sandbox sur un build `preview` : achat, essai, restauration, Ask to Buy.

## 4. Variables EAS

Les noms exacts lus dans `src/lib/*` et `src/features/subscription/purchase.ts`. Aucune valeur dans le dépôt.
À créer pour les environnements `production`, `preview` et `development` (`eas.json` pointe chaque profil
sur l'environnement du même nom) :

```bash
npx eas-cli@latest env:create --environment production --visibility plaintext --name EXPO_PUBLIC_SUPABASE_URL --value ...
```

| Nom | Source | Visibilité |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase › Settings › API | plaintext |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase › Settings › API (clé anon, protégée par la RLS) | sensitive |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat › clé publique iOS (`appl_...`) | sensitive |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry › Client Keys | sensitive |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog › Project API key | sensitive |
| `EXPO_PUBLIC_POSTHOG_HOST` | Facultatif, défaut `https://eu.i.posthog.com` | plaintext |
| `SENTRY_AUTH_TOKEN` | Sentry › Organization tokens (envoi des source maps au build, jamais dans l'app) | secret |

Les `EXPO_PUBLIC_*` sont intégrées au binaire : elles ne doivent contenir que des clés publiques. Les clés
Anthropic, RevenueCat secrète, Apple .p8 et service role restent dans les secrets Supabase.

## 5. Soumission

`eas.json` contient deux valeurs à remplacer avant la première soumission, dans `submit.production.ios` :

| Champ | Valeur | Où la trouver |
|---|---|---|
| `ascAppId` | remplacer `ASC_APP_ID` par l'Apple ID numérique de l'app | App Store Connect › App › Informations générales › Apple ID |
| `appleTeamId` | remplacer `APPLE_TEAM_ID` par le Team ID (10 caractères) | developer.apple.com › Membership |

L'identifiant Apple de connexion se passe par la variable `EXPO_APPLE_ID` (ou une clé API App Store Connect
configurée par `eas credentials`), jamais en clair dans le dépôt.

```bash
npm run check                                   # tout vert avant de construire
npx eas-cli@latest build -p ios --profile production
npx eas-cli@latest submit -p ios --profile production --latest
```

`appVersionSource: remote` et `autoIncrement` gèrent le numéro de build. La version affichée (`version` dans
`app.json`) s'augmente à la main à chaque version publique.

Le profil `development` (`developmentClient: true`) demande `expo-dev-client` : l'installer avec
`npx expo install expo-dev-client` avant le premier build de développement. `preview` produit un build
interne pour appareils enregistrés (achats en sandbox).

## 6. Fiche App Store Connect

1. Copier `store/metadata/en-US/*.txt` et `store/metadata/fr-FR/*.txt` dans les champs du même nom (ou
   `fastlane deliver` qui lit cette arborescence). Limites : nom et sous-titre 30, texte promotionnel 170,
   mots-clés 100, description 4 000 caractères. Contrôle après chaque modification :
   `for f in store/metadata/*/*.txt; do printf '%5s %s\n' "$(tr -d '\n' < "$f" | wc -m)" "$f"; done`
2. App Privacy : reprendre `store/privacy-labels.md` ligne par ligne.
3. App Review Information : coller `store/review-notes.md` (sections « How to review » et « Guidelines »),
   contact hello@demidemi.app. Aucun compte de démonstration nécessaire.
4. Âge : 4+. Catégorie : Food & Drink, secondaire Lifestyle.
5. URL de support et de confidentialité : https://demidemi.app/support et https://demidemi.app/privacy
   doivent être en ligne avant la soumission. Conditions : https://demidemi.app/terms (lien aussi dans la
   description, exigé pour les abonnements).
6. Associer les deux abonnements à la version avant d'envoyer en revue (première soumission d'achats).

## 7. Intégration continue

`.github/workflows/ios.yml` tourne sur `macos-26` à chaque push sur la branche de travail et à la demande :
`npm ci`, `npm run check` (typecheck, lint, tests, tests RLS, expo-doctor), `expo prebuild`, build Release
simulateur, lancement, capture à 15 s, détection d'écran rouge, flux Maestro (`e2e/maestro/`), vidéo et
journaux en artefacts. Les clés `EXPO_PUBLIC_*` viennent des secrets GitHub du dépôt, mêmes noms qu'au
tableau 4. Le build App Store, lui, passe par EAS (étape 5) ; la CI ne signe rien.

## 8. Captures d'écran

Format exigé : iPhone 6,9 pouces (1320 × 2868), en-US et fr-FR, 3 à 10 par langue. La première montre le
mécanisme : le plan de la semaine avec le fil vert entre le repas qui ouvre la crème et celui qui la finit.

1. Simulateur iPhone 17 Pro Max, langue et région réglées (English/United States, puis Français/France).
2. Build Release : `npx expo run:ios --configuration Release`.
3. Accueil, puis Réglages › Load sample recipes / Charger des recettes d'exemple, puis créer le plan.
4. `xcrun simctl status_bar booted override --time 9:41 --batteryState charged --batteryLevel 100`.
5. Capturer : `xcrun simctl io booted screenshot store/screenshots/<langue>/01-plan.png`, puis la liste,
   une recette importée avec son lien source, les allergies, le paywall.
6. Les flux Maestro peuvent rejouer le parcours (`maestro test e2e/maestro --test-output-dir build/screens`,
   simulateur en en-US) ; la CI publie ces captures en artefacts, à vérifier avant de les reprendre.
7. Aucun texte marketing incrusté qui promette plus que l'app : pas de « sans allergène », pas d'image
   générée par IA.
