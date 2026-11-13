# Plan 01 — Référentiel d'ingrédients, conversions, arrondi aux paquets

## Fichiers
- `src/features/ingredients/schema.ts` : schéma zod d'un ingrédient (validé au chargement du référentiel).
- `src/features/ingredients/units.ts` : conversion d'une quantité de recette vers l'unité de base de
  l'ingrédient (g, ml ou pièce), avec densité ou poids unitaire quand il faut passer de volume à masse.
- `src/features/ingredients/packs.ts` : arrondi d'un besoin total aux conditionnements réels d'un marché
  (US ou FR) en minimisant le reste, puis le nombre de paquets.
- `data/ingredients.json` : environ 300 ingrédients ; `src/features/ingredients/catalog.ts` le charge et le
  valide.

## Risques
- Une erreur d'allergène dans le référentiel se propage au filtre strict : tests de cohérence (ex. tout
  ingrédient laitier porte `milk`), et liste des entrées à relire par un humain.
- Conversion volume vers masse sans densité connue : renvoyer `null` (jamais deviner), la recette passe en
  `needsReview`.
- Paquets : combinaisons multiples (2 × 200 ml contre 1 × 500 ml) ; recherche bornée, cas limites testés.

## Tests (TDD)
- `units.test.ts` : masse et volume entre eux, impérial vers métrique, volume vers masse avec densité,
  pièce vers masse, unité inconnue, quantité négative ou nulle.
- `packs.test.ts` : besoin exact, besoin entre deux tailles, combinaison moins gaspilleuse, égalité départagée
  par le nombre de paquets, besoin nul, aucun paquet défini.
- `catalog.test.ts` : le référentiel passe le schéma, identifiants uniques, chaque ingrédient a des paquets US
  et FR, règles de cohérence allergènes et régimes.
