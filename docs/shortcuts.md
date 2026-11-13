# Raccourcis volontaires

| Fichier | Limite | Quand l'ameliorer |
|---|---|---|

| `data/ingredients.json` | Dinde et canard classés dans la protéine `chicken` | Créer une catégorie `poultry` si une règle « sans poulet » apparaît |
| `src/features/ingredients/schema.ts` | Cohérence unité de base / densité vérifiée par `catalog.test.ts` sur les données livrées, pas au parsing | Ajouter un `superRefine` si le référentiel devient éditable |
