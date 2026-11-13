# Raccourcis volontaires

| Fichier | Limite | Quand l'ameliorer |
|---|---|---|

| `data/ingredients.json` | Dinde et canard classés dans la protéine `chicken` | Créer une catégorie `poultry` si une règle « sans poulet » apparaît |
| `src/features/ingredients/schema.ts` | Cohérence unité de base / densité vérifiée par `catalog.test.ts` sur les données livrées, pas au parsing | Ajouter un `superRefine` si le référentiel devient éditable |
| `src/features/import/parseLine.ts` | Une fourchette (« 2-3 », « 2 à 3 ») garde la borne haute, sans signaler l'écart | Stocker min et max si l'utilisateur veut choisir la quantité |
| `src/features/import/parseLine.ts` | Tout chiffre restant dans le nom (« 1 14-oz can », « 2 x 400g ») annule la quantité → `needsReview`, même quand un humain lirait le total | Parser les multiplicateurs « n x taille » si les relectures deviennent trop fréquentes |
| `src/features/planner/simulate.ts` | Durée de conservation (viande et poisson 2 j, crèmerie et fruits et légumes 4 j, boulangerie 3 j) et caractère périssable déduits du rayon ; épicerie, épices, condiments, boissons et surgelés jamais périmés dans la semaine | Ajouter une durée par ingrédient au référentiel si des plans gardent un reste trop longtemps (herbes fraîches, poisson fumé) |
| `src/features/planner/simulate.ts` | Protéine principale = premier ingrédient de la recette qui porte une protéine | Pondérer par quantité si la règle « pas deux fois la même protéine » se trompe sur des recettes mixtes |
