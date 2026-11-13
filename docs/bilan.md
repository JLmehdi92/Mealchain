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
