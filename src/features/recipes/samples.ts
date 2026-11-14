import type { Language } from '@/lib/i18n';

import samplesEn from '../../../data/samples-en.json';
import samplesFr from '../../../data/samples-fr.json';
import { buildRecipe } from '../import/buildRecipe';
import type { Recipe } from './types';

type Sample = (typeof samplesEn)[number];

const SAMPLES: Record<Language, Sample[]> = { en: samplesEn, fr: samplesFr };

const sampleId = (sourceUrl: string) => `sample-${sourceUrl.replace(/^https:\/\/(\w+)\.wikibooks\.org\/wiki\//, '$1-')}`;

function toRecipe(sample: Sample): Recipe {
  const built = buildRecipe(
    { ...sample, servings: sample.servings ?? undefined, totalMinutes: sample.totalMinutes ?? undefined },
    'web',
    sampleId(sample.sourceUrl),
    0,
  );
  const confirmed = new Set(sample.confirmed);
  // Confirmed lines were checked by hand when the sample set was curated (scripts/buildSamples.ts), like the import review does.
  const ingredients = built.ingredients.map((line) => (confirmed.has(line.raw) && line.ingredientId ? { ...line, status: 'matched' as const } : line));
  return { ...built, ingredients, needsReview: ingredients.every((line) => line.status === 'matched') ? [] : ['ingredients'] };
}

export const sampleRecipes = (language: Language): Recipe[] => SAMPLES[language].map(toRecipe);
