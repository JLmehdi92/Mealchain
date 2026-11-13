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

## Tests utilisateurs (4 personas, 3 itérations)

Notes sur 10, itérations 1 → 2 → 3 :

| | Facilité | Design | Animations | Confiance | Payer | En parler |
|---|---|---|---|---|---|---|
| Jess (US) | 6 → 6 → 7 | 8 → 7 → 8 | 4 → 4 → 6 | 5 → 4 → 6 | 3 → 3 → 4 | 4 → 4 → 5 |
| Marcus (US) | 5 → 7 → 7 | 7 → 6 → 7 | 4 → 4 → 6 | 5 → 5 → 7 | 3 → 3 → 4 | 4 → 4 → 5 |
| Nadia (FR) | 7 → 7 → 7 | 8 → 7 → 7 | 5 → 5 → 4 | 6 → 7 → 7 | 3 → 3 → 4 | 4 → 5 → 6 |
| Théo (FR) | 6 → 6 → 7 | 7 → 7 → 7 | 4 → 4 → 4 | 5 → 5 → 5 | 2 → 2 → 2 | 3 → 4 → 3 |

Objectif non atteint : au moins 8 en facilité, design et animations pour chacun, et 10 en confiance pour Nadia.

### Corrigé grâce à eux

- Bugs bloquants :
  - page « Unmatched Route » après l'onboarding ;
  - bouton d'import caché par le clavier ;
  - paywall qui recouvrait le premier plan ;
  - toucher d'un repas sans effet ;
  - feuille « Changer ce repas » vide ;
  - « 36 paquets de 1 » tomates cerises.
- Partage de la liste en texte sans compte, et recettes d'exemple accessibles depuis la semaine vide.
- Allergies :
  - bandeau rouge à l'import ;
  - « Jamais dans ce plan, allergie du foyer : … » sur la semaine ;
  - étiquette qui nomme l'allergie du foyer.
- Message honnête quand un site bloque la lecture, points à vérifier nommés, restes minuscules masqués, prix affichés sur le paywall de test.

### Restant, par ordre d'impact (recommandations)

1. **Animations (4 à 6/10).** Il manque :
   - un retour visible dès « Planifier ma semaine » ;
   - une célébration « semaine prête » (haptique `success` et les deux moitiés de la marque qui se rejoignent, déjà prévues dans la DA) ;
   - l'entrée du contenu de l'onboarding ;
   - un toast à la place de l'alerte système des recettes d'exemple.

   À juger sur un vrai iPhone : le simulateur de la CI, très lent, et la capture à 4 images par seconde sous-estiment le mouvement.
2. **Variété avec peu de recettes.** Jess et Théo, avec 2 recettes, mangent le même plat 3 fois. Pistes :
   - prévenir avant de composer (« ajoutez au moins N recettes ») ;
   - proposer les recettes d'exemple en complément.
3. **Unités sans libellé** dans la liste : « Ail 10 », « Poireau 1 ». Il faut « 10 gousses », « 1 poireau ».
4. **Confiance de Nadia (7/10)** :
   - nommer l'ingrédient en cause (« Écartée : noix de cajou (fruits à coque) ») ;
   - un récapitulatif « aucun ingrédient de vos allergies dans ce plan » en bas de la semaine ;
   - expliquer l'écart entre la quantité dans le plan (ce repas) et dans la liste (toute la semaine) ;
   - à terme, des allergies par personne.
5. **Paywall.** Avec la vraie clé RevenueCat, il affiche les deux offres et l'essai. Il reste à décider s'il doit apparaître dès que le premier plan et la liste ont été vus (règle actuelle, conforme au brief) ou plus tard.
6. **Le simulateur de la CI démarre parfois en anglais**, avant que le robot force la langue : c'est un artefact des tests, pas de l'app.
