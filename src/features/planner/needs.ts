import { ingredientById } from '../ingredients/catalog';
import type { Ingredient } from '../ingredients/schema';
import { toBase } from '../ingredients/units';
import type { Recipe, RecipeIngredient } from '../recipes/types';

export function catalogIngredient(line: RecipeIngredient): Ingredient | undefined {
  return line.status !== 'unmatched' && line.ingredientId ? ingredientById.get(line.ingredientId) : undefined;
}

export function recipeNeeds(recipe: Recipe, people: number): { needs: Map<string, number>; unlisted: string[] } {
  const factor = people / (recipe.servings || people);
  const needs = new Map<string, number>();
  const unlisted: string[] = [];
  for (const line of recipe.ingredients) {
    const ingredient = catalogIngredient(line);
    const amount = ingredient && line.qty !== null ? toBase(line.qty * factor, line.unit ?? 'piece', ingredient) : null;
    if (ingredient && amount !== null) needs.set(ingredient.id, (needs.get(ingredient.id) ?? 0) + amount);
    else unlisted.push(line.raw);
  }
  return { needs, unlisted };
}
