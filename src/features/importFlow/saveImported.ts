import { trackOnce } from '@/lib/analytics';
import { getState, saveRecipe } from '@/lib/store';

import type { Recipe } from '../recipes/types';
import { canAddRecipe } from '../subscription/rules';

export async function saveImported(recipe: Recipe, pro: boolean): Promise<'saved' | 'paywall'> {
  const { recipes } = getState();
  const isNew = !recipes.some((r) => r.id === recipe.id);
  if (isNew && !canAddRecipe(recipes.length, pro)) return 'paywall';
  await saveRecipe(recipe);
  await trackOnce('first_import');
  return 'saved';
}
