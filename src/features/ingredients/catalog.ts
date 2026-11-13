import { z } from 'zod';

import raw from '../../../data/ingredients.json';
import type { Pack } from './packs';
import { ingredientSchema, type Ingredient, type Market } from './schema';
import { toBase } from './units';

export const catalog: Ingredient[] = z.array(ingredientSchema).parse(raw);

export function packsFor(ingredient: Ingredient, market: Market): Pack[] {
  return ingredient.packs[market].flatMap((p) => {
    const amount = toBase(p.size, p.unit, ingredient);
    return amount === null ? [] : [{ amount, container: p.container }];
  });
}
