import { catalog } from '../ingredients/catalog';
import type { Ingredient } from '../ingredients/schema';

const singular = (word: string) => (word.length > 2 ? word.replace(/oes$/, 'o').replace(/[sx]$/, '') : word);

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .map(singular)
    .join(' ');

const phrases = catalog
  .flatMap((ingredient) =>
    [ingredient.name.en, ingredient.name.fr, ...ingredient.synonyms.en, ...ingredient.synonyms.fr]
      .map((name) => normalize(name.replace(/\([^)]*\)/g, ' ')))
      .filter(Boolean)
      .map((phrase) => ({ phrase: ` ${phrase} `, ingredient })),
  )
  .sort((a, b) => b.phrase.length - a.phrase.length || (a.ingredient.id < b.ingredient.id ? -1 : a.ingredient.id > b.ingredient.id ? 1 : 0));

const NOISE = new Set(
  normalize(
    'large medium small fresh chopped minced diced sliced grated shredded crushed finely roughly ripe whole boneless skinless organic extra virgin packed softened melted room temperature ' +
      'gros grosse petit petite frais fraiche haché hachée émincé émincée râpé râpée coupé coupée mûr mûre entier entière bio',
  ).split(' '),
);

export type IngredientMatch = { ingredient: Ingredient; whole: boolean };

export function matchIngredient(name: string): IngredientMatch | null {
  const haystack = ` ${normalize(name)} `;
  const found = phrases.find(({ phrase }) => haystack.includes(phrase));
  if (!found) return null;
  const leftover = haystack.replace(found.phrase, ' ').split(' ').filter((word) => word && !NOISE.has(word));
  return { ingredient: found.ingredient, whole: leftover.length === 0 };
}
