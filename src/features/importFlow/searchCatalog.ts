import { catalog } from '../ingredients/catalog';
import type { Ingredient } from '../ingredients/schema';

const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

export function searchCatalog(query: string, lang: 'en' | 'fr'): Ingredient[] {
  const q = fold(query);
  const terms = (i: Ingredient) => [i.name[lang], ...i.synonyms[lang], i.name.en, ...i.synonyms.en];
  return catalog
    .filter((i) => q === '' || terms(i).some((term) => fold(term).includes(q)))
    .sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang));
}
