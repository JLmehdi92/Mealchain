import type { Language } from '@/lib/i18n';
import { getState, saveRecipe } from '@/lib/store';

import { FREE_RECIPE_LIMIT } from '../subscription/rules';
import { sampleRecipes } from './samples';

export async function loadSamples(language: Language, now: number, pro: boolean): Promise<{ added: number } | 'paywall'> {
  const { recipes } = getState();
  const missing = sampleRecipes(language).filter((sample) => !recipes.some((r) => r.id === sample.id));
  const room = pro ? missing.length : Math.max(0, FREE_RECIPE_LIMIT - recipes.length);
  if (missing.length > 0 && room === 0) return 'paywall';
  const added = missing.slice(0, room);
  for (const sample of added) await saveRecipe({ ...sample, createdAt: now });
  return { added: added.length };
}
