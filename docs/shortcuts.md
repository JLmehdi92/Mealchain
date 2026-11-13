# Raccourcis volontaires

| Fichier | Limite | Quand l'ameliorer |
|---|---|---|

| `data/ingredients.json` | Dinde et canard classés dans la protéine `chicken` | Créer une catégorie `poultry` si une règle « sans poulet » apparaît |
| `src/features/ingredients/schema.ts` | Cohérence unité de base / densité vérifiée par `catalog.test.ts` sur les données livrées, pas au parsing | Ajouter un `superRefine` si le référentiel devient éditable |
| `src/features/import/parseLine.ts` | Une fourchette (« 2-3 », « 2 à 3 ») garde la borne haute, sans signaler l'écart | Stocker min et max si l'utilisateur veut choisir la quantité |
| `src/features/import/parseLine.ts` | Tout chiffre restant dans le nom (« 1 14-oz can », « 2 x 400g ») annule la quantité → `needsReview`, même quand un humain lirait le total | Parser les multiplicateurs « n x taille » si les relectures deviennent trop fréquentes |
| `src/features/planner/simulate.ts` | Durée de conservation (viande et poisson 2 j, crèmerie et fruits et légumes 4 j, boulangerie 3 j) et caractère périssable déduits du rayon ; épicerie, épices, condiments, boissons et surgelés jamais périmés dans la semaine | Ajouter une durée par ingrédient au référentiel si des plans gardent un reste trop longtemps (herbes fraîches, poisson fumé) |
| `src/features/planner/simulate.ts` | Protéine principale = premier ingrédient de la recette qui porte une protéine | Pondérer par quantité si la règle « pas deux fois la même protéine » se trompe sur des recettes mixtes |
| `src/lib/db/repo.ts` | Une ligne qui échoue à zod est ignorée en lecture (laissée en base, non supprimée) | Signaler ou réparer quand le schéma d'une table évolue (nouvelle migration de données) |
| `src/lib/i18n.ts` | Langue lue à chaque appel de `t`, pas de réabonnement au changement de langue | iOS relance l'app au changement de langue ; ajouter un écouteur si on autorise un choix de langue dans l'app |
| `src/lib/sync.ts` | Coches partagées : à l'ouverture, la valeur distante l'emporte sur la locale pour une ligne déjà connue du foyer ; une coche faite hors ligne sur cette ligne est écrasée | Comparer `updated_at` local et distant si des coches hors ligne se perdent |
| `src/lib/sync.ts` | Pas de file d'attente : une coche dont l'envoi échoue (hors ligne) n'est renvoyée qu'à la prochaine ouverture si le foyer ne connaît pas encore la ligne ; pas de bannière « hors ligne » (pas de NetInfo) | Ajouter `@react-native-community/netinfo` et une file d'envoi si le partage est très utilisé en magasin |
| `src/features/list/format.ts` | Pas de nom de format propre au pays (« half-pint ») : « 1 carton (8 fl oz) » | Ajouter un champ `label` au conditionnement dans `data/ingredients.json` si les tests utilisateurs le demandent |
| `src/features/list/format.ts` | Jours de la ligne « pourquoi » sans le nom du plat (« lun., mer. ») | Ajouter un titre court par recette si les utilisateurs veulent savoir quel plat finit le paquet |
| `src/features/subscription/copy.ts` | Durée d'essai « 7 jours » écrite en dur ; seule la présence d'une offre d'introduction gratuite vient de RevenueCat | Lire `introPrice.periodNumberOfUnits` si l'essai change dans App Store Connect |
| `src/features/household/account.ts` | Connexion Apple sans nonce (jeton d'identité seul, comme l'exemple Supabase Expo) | Ajouter un nonce haché (`expo-crypto`) si Supabase l'exige |
| `src/features/household/wipe.ts` | Supprime les tables connues à ce jour ; une nouvelle table locale doit y être ajoutée | Lister les tables depuis `schema.ts` si leur nombre grandit |
| `src/lib/importApi.ts` | `readPage` lit la page entière avant de vérifier le plafond de 3 Mo ; le fetch de l'appareil suit les redirections avant la revérification de l'URL finale (la page n'est que parsée localement) | Lecture en flux avec plafond si des pages géantes apparaissent |
| `src/lib/importApi.ts` | Le repli serveur exige une session Supabase ; sans compte il répond « injoignable » | Connexion anonyme Supabase si l'import sans compte devient un besoin |
| `src/features/recipes/copy.ts` | Libellés d'allergènes et d'équipement possiblement en double avec ceux de l'accueil | Fusionner dans une table commune lors du prochain passage sur les textes |
| `src/features/importFlow/review.ts` | Choisir un ingrédient d'unité non convertible le marque « reconnu », le planificateur le liste ensuite « à vérifier » | Demander la quantité dans une unité convertible au moment du choix |
