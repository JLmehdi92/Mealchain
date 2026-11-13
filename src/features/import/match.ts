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

export function matchIngredient(name: string): Ingredient | null {
  const haystack = ` ${normalize(name)} `;
  return phrases.find(({ phrase }) => haystack.includes(phrase))?.ingredient ?? null;
}
