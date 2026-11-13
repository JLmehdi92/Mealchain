import type { Allergen, Diet, Market } from '../ingredients/schema';
import type { RecipeUnit } from '../ingredients/units';

export const EQUIPMENT = ['oven', 'stovetop', 'microwave', 'blender', 'food_processor', 'air_fryer', 'slow_cooker', 'grill'] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export type IngredientStatus = 'matched' | 'unmatched' | 'needsReview';
export type RecipeIngredient = {
  raw: string;
  qty: number | null;
  unit: RecipeUnit | null;
  ingredientId: string | null;
  status: IngredientStatus;
};

export type ReviewField = 'title' | 'servings' | 'totalMinutes' | 'ingredients' | 'steps';
export type RecipeSource = 'web' | 'caption' | 'screenshot';

export type Recipe = {
  id: string;
  title: string;
  servings: number | null;
  totalMinutes: number | null;
  equipment: Equipment[];
  ingredients: RecipeIngredient[];
  steps: string[];
  source: RecipeSource;
  sourceUrl: string | null;
  imageUrl: string | null;
  needsReview: ReviewField[];
  createdAt: number;
};

export type Household = {
  people: number;
  allergens: Allergen[];
  diets: Diet[];
  equipment: Equipment[];
  dinners: number;
  lunches: number;
  maxMinutes: number | null;
  market: Market;
};
