# Bilan Demidemi

État au 13 novembre 2026. Détail de la mise en ligne : `docs/release.md`. Raccourcis assumés : `docs/shortcuts.md`.

## Ce qui marche sans aucun compte

L'app tourne entièrement sur l'iPhone, sans aucune clé :
- onboarding ;
- foyer, allergies, régimes et équipement ;
- import par lien (lu sur l'appareil) et par texte collé (trié sur l'appareil) ;
- import par capture d'écran (Apple Vision, sur l'appareil) ;
- recettes d'exemple, plan zéro gaspi, changement de repas ;
- liste de courses en vrais paquets, partage de la liste en texte.

Sans compte, ces fonctions sont simplement masquées ou désactivées :
- l'abonnement (« achats indisponibles dans cette version ») ;
- la liste partagée en temps réel ;
- la connexion Apple ;
- le lecteur IA des légendes difficiles.

## Comptes à créer (par toi)

| Service | Pourquoi | Ce qu'il faut |
|---|---|---|
| Apple Developer (99 $/an) | Signer et publier, connexion Apple | Team ID, clé Sign in with Apple (.p8 + Key ID) |
| App Store Connect | Fiche, abonnements | App `app.demidemi.ios`, abonnements annuel 34,99 $ / 29,99 € (essai 7 j) et mensuel 6,99 $ / 5,99 €, Partage familial |
| Expo / EAS | Build et soumission | `npx eas-cli@latest init` |
| Supabase (région UE) | Compte facultatif, liste partagée, Edge Functions | URL, clé anon, clé service role |
| RevenueCat | Abonnements | Clé publique iOS `appl_…`, clé secrète v1, entitlement `pro`, offering `default` |
| Anthropic | Lecteur IA (serveur uniquement) | Clé API de production |
| Sentry | Plantages | DSN, jeton d'organisation |
| PostHog (UE) | Entonnoir anonyme | Clé publique de projet |

**Variables EAS** (aucune valeur dans le dépôt) :
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_POSTHOG_KEY`
- `EXPO_PUBLIC_POSTHOG_HOST` (facultatif)
- `SENTRY_AUTH_TOKEN`

**Secrets Supabase** :
- `ANTHROPIC_API_KEY`
- `REVENUECAT_SECRET_KEY`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_CLIENT_ID`
- `APPLE_PRIVATE_KEY`

**À remplacer dans `eas.json`** : `ASC_APP_ID` et `APPLE_TEAM_ID`. L'identifiant Apple passe par la variable `EXPO_APPLE_ID`.

**À mettre en ligne avant la soumission** :
- demidemi.app/support
- demidemi.app/privacy
- demidemi.app/terms

## Décisions à trancher par un humain

Ces choix sont dans `docs/ingredients-review.md` (123 entrées sur 324 à relire, en commençant par les allergènes et les régimes) :
- vinaigres de vin exclus du halal ;
- pâte brisée US non exclue du végétarien ;
- fromages à présure animale ;
- halal limité au porc ;
- lait sans lactose absent du référentiel ;
- levure chimique marquée gluten.

Avant le dépôt, il reste aussi la recherche de marque « Demidemi » (USPTO, INPI).

## Risques connus

- Rien n'a été testé contre les vrais services : Supabase, RevenueCat, Apple et Anthropic restent à vérifier en sandbox sur un build `preview`.
- Certains sites bloquent la lecture des pages (Taste of Home, par exemple) ; l'app propose alors de coller le texte.
- Le serveur d'import revérifie l'adresse après le téléchargement (réassociation DNS), mais un risque résiduel demeure.
- Le Maestro 2.0.0 de la CI est épinglé par sa version, sans somme de contrôle vérifiée.

## Tests utilisateurs (4 personas, 5 tours)

Notes sur 10 au 5e tour, avec entre parenthèses celles du 1er tour :

| | Facilité | Design | Animations | Confiance | Payer | En parler |
|---|---|---|---|---|---|---|
| Jess (US) | 6 (6) | 8 (8) | 6 (4) | 6 (5) | 4 (3) | 5 (4) |
| Marcus (US) | 7 (5) | 7 (7) | 4 (4) | 5 (5) | 4 (3) | 5 (4) |
| Nadia (FR) | 7 (7) | 7 (8) | 5 (5) | 7 (6) | 4 (3) | 5 (4) |
| Théo (FR) | 7 (6) | 7 (7) | 5 (4) | 6 (5) | 2 (2) | 3 (3) |

L'objectif n'est pas atteint : il demandait au moins 8 en facilité, en design et en animations, et 10 en confiance pour Nadia. Plusieurs corrections faites après le 5e tour n'ont pas encore été notées :
- l'en-tête du plan sans doublon ;
- le bandeau d'import qui nomme l'ingrédient ;
- le récapitulatif allergies visible en bas de la semaine ;
- le bouton « Tout est juste » ;
- l'équipement affiché dans les réglages ;
- la suppression d'une recette ;
- la synchronisation du foyer fiabilisée.

### Ce que les tests ont fait corriger

- **Bugs bloquants :**
  - page « Unmatched Route » ;
  - bouton d'import sous le clavier ;
  - paywall qui recouvrait le premier plan ;
  - repas qui ne s'ouvrait pas ;
  - feuille « Changer ce repas » vide ;
  - « 36 paquets de 1 » tomates cerises ;
  - blancs de poulet non reconnus ;
  - réglages qui affichaient « aucun équipement ».
- **Allergies dites partout :** bandeau rouge à l'import qui nomme l'ingrédient, « Jamais dans ce plan » sur la semaine, récapitulatif vérifié en bas, étiquette « Écartée : noix de cajou (fruits à coque), allergie du foyer ».
- **Usage :**
  - partage de la liste en texte sans compte ;
  - recettes d'exemple dès la semaine vide ;
  - alerte de variété avant de composer ;
  - unités lisibles (« 10 gousses ») ;
  - quantités de la recette étiquetées (« Recette d'origine / Pour vos 2 ») ;
  - suppression d'une recette ;
  - paywall seulement aux limites du gratuit, avec la valeur de la semaine.
- **Vie :** cascade du plan, célébration « Votre semaine est prête », squelette qui respire, onboarding par étapes, repas remplacé qui s'allume, annonces VoiceOver.

### Pourquoi les notes plafonnent (recommandations)

1. **Animations (4 à 6).** Les preuves sont des images prises toutes les 0,25 s sur un simulateur de CI très lent : un ressort de moins de 250 ms, l'haptique et la fluidité réelle ne s'y voient pas. Il faut les juger sur un vrai iPhone avant d'investir davantage.
2. **Payer (2 à 4).** Les testeurs veulent voir des économies chiffrées en euros ou en dollars. Il faudrait de vraies données de prix (V2) : aucun montant n'est inventé. Théo demande aussi un prix étudiant : c'est une décision commerciale.
3. **Variété.** Avec 2 recettes pour 5 dîners, la répétition est inévitable. L'app le dit avant de composer et propose les recettes d'exemple.
4. **Recettes d'exemple Wikibooks / Wikilivres.** Les 8 recettes écrites à la main sont remplacées par 7 recettes EN (Wikibooks Cookbook) et 5 FR (Wikilivres, Livre de cuisine), sous licence CC BY-SA 4.0, texte repris mot pour mot. Sélection reproductible : `npx tsx scripts/buildSamples.mjs <dossier des candidates>` (plats principaux, 60 min au plus, sans barbecue ni friteuse, toutes les lignes reconnues ou relues à la main, choix glouton par protéine puis ingrédients frais partagés). Attribution sur chaque fiche (site, auteurs, licence avec lien) et dans Conditions › Crédits des recettes. Les exemples comptent dans les 15 recettes du gratuit ; ils sont chargés dans la limite des places libres (tous pour Pro). **À faire valider juridiquement :** l'ancienne page Wikilivres:Copyright ne mentionne que la GFDL 1.2, alors que l'API siteinfo et le pied de page de fr.wikibooks.org indiquent CC BY-SA 4.0 ; en cas de doute, retirer le jeu FR. Limite : en français, 5 exemples seulement, et le planificateur répète un plat sur 5 dîners.
5. **Sites qui bloquent la lecture** (Taste of Home) : l'app propose de coller le texte. Une extension de partage iOS depuis Safari réglerait le cas (V2).

## Captures App Store

6,9 pouces (1320 × 2868), barre d'état à 9:41, dans `store/screenshots/en-US/` et `store/screenshots/fr-FR/` (6 chacune) :
1. le plan de la semaine ;
2. la liste en paquets ;
3. les recettes ;
4. une fiche recette ;
5. les allergies ;
6. l'accueil.

La capture du paywall est à refaire avec RevenueCat branché : en version de test, elle affiche « achats indisponibles ».

## Audits finaux

- **Sécurité :** aucun point critique ni élevé. Les points moyens et bas sont corrigés :
  - suppression de compte rejouable ;
  - redirections revalidées ;
  - limites de taille en base ;
  - interrupteur des statistiques, désactivé par défaut en français ;
  - nettoyage du jeton Apple.
- **Ponytail :** les 4 points « à corriger » sont faits :
  - une allergie retirée ressuscitée par la synchro du foyer ;
  - des coches écrasées à l'aveugle ;
  - la table `shopping_items` sans plafond ;
  - une limite d'import différente entre l'app et le serveur.

  Les points « devrait être corrigé » sont faits aussi :
  - suppression d'une recette ;
  - table inutilisée retirée ;
  - doublon fusionné ;
  - double toucher sur la liste.
- **Contrôles :** typecheck 0, lint 0 avertissement, 677 tests, 19 tests RLS, expo-doctor 20/20, 4 parcours Maestro verts sur iPhone 17 Pro Max.

## Points ouverts

- Bouton « Appliquer le retrait » quand un autre membre du foyer retire une allergie : le retrait est détecté et gardé par prudence, mais pas encore proposé à l'écran.
- Une coche plus ancienne refusée par le serveur n'est corrigée sur l'appareil qu'à la synchronisation suivante.
- La semaine gratuite se récupère en effaçant l'app (`docs/shortcuts.md`).
- `MAESTRO_SHA256` à renseigner dans la CI.
- Les règles serveur (triggers, limites, suppression de compte) n'ont été testées que sur une base locale, pas encore sur un projet Supabase réel.
