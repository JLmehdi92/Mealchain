import { toBase } from '../ingredients/units';
import { EQUIPMENT, type Equipment, type Recipe, type RecipeIngredient, type RecipeSource, type ReviewField } from '../recipes/types';
import type { RawRecipe } from './jsonld';
import { matchIngredient } from './match';
import { isToTaste, parseIngredientLine } from './parseLine';

const EQUIPMENT_RULES: Record<Equipment, RegExp> = {
  oven: /\b(?:oven|preheat\w*|bak(?:e|ed|es|ing)|préchauff\w*|(?:au|le|du) four)\b/i,
  stovetop: /\b(?:skillet|pans?|poêle|casserole|simmer\w*|boil\w*)\b/i,
  microwave: /\b(?:microwave\w*|micro-ondes?)\b/i,
  blender: /\b(?:blender|blend|blended|mixeur)\b/i,
  food_processor: /\b(?:food processor|robot)\b/i,
  air_fryer: /\b(?:air fryer|friteuse à air)\b/i,
  slow_cooker: /\b(?:slow cooker|mijoteuse)\b/i,
  grill: /\b(?:grill|grilled|barbecue)\b/i,
};

export const detectEquipment = (steps: string[]): Equipment[] =>
  EQUIPMENT.filter((equipment) => steps.some((step) => EQUIPMENT_RULES[equipment].test(step)));

function toIngredient(raw: string): RecipeIngredient {
  const { qty, unit, name } = parseIngredientLine(raw);
  const ingredient = matchIngredient(name);
  if (!ingredient) return { raw, qty, unit, ingredientId: null, status: 'unmatched' };
  const usable = qty === null || unit === null ? isToTaste(raw) : toBase(qty, unit, ingredient) !== null;
  return { raw, qty, unit, ingredientId: ingredient.id, status: usable ? 'matched' : 'needsReview' };
}

export function buildRecipe(raw: RawRecipe, source: RecipeSource, id: string, now: number): Recipe {
  const ingredients = raw.ingredients.map(toIngredient);
  const missing: [ReviewField, boolean][] = [
    ['title', !raw.title],
    ['servings', raw.servings === undefined],
    ['totalMinutes', raw.totalMinutes === undefined],
    ['ingredients', ingredients.length === 0 || ingredients.some((i) => i.status !== 'matched')],
    ['steps', raw.steps.length === 0],
  ];
  return {
    id,
    title: raw.title ?? '',
    servings: raw.servings ?? null,
    totalMinutes: raw.totalMinutes ?? null,
    equipment: detectEquipment(raw.steps),
    ingredients,
    steps: raw.steps,
    source,
    sourceUrl: raw.sourceUrl || null,
    imageUrl: raw.imageUrl ?? null,
    needsReview: missing.filter(([, isMissing]) => isMissing).map(([field]) => field),
    createdAt: now,
  };
}
