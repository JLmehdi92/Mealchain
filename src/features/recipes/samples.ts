import type { Language } from '@/lib/i18n';

import samplesEn from '../../../data/samples-en.json';
import samplesFr from '../../../data/samples-fr.json';
import { buildRecipe } from '../import/buildRecipe';
import type { Recipe } from './types';

type Sample = (typeof samplesEn)[number];

const SAMPLES: Record<Language, Sample[]> = { en: samplesEn, fr: samplesFr };

const sampleId = (sourceUrl: string) => `sample-${sourceUrl.replace(/^https:\/\/(\w+)\.wikibooks\.org\/wiki\//, '$1-').replace(/[^A-Za-z0-9-]+/g, '-')}`;

export type SampleSource = Omit<Sample, 'confirmed'>;

export const buildSample = (source: SampleSource): Recipe =>
  buildRecipe({ ...source, servings: source.servings ?? undefined, totalMinutes: source.totalMinutes ?? undefined }, 'web', sampleId(source.sourceUrl), 0);

function toRecipe(sample: Sample): Recipe {
  const built = buildSample(sample);
  const confirmed = new Set(sample.confirmed);
  // Confirmed lines were checked by hand when the sample set was curated (scripts/buildSamples.mjs), like the import review does.
  const ingredients = built.ingredients.map((line) => (confirmed.has(line.raw) && line.ingredientId ? { ...line, status: 'matched' as const } : line));
  return { ...built, ingredients, needsReview: ingredients.every((line) => line.status === 'matched') ? [] : ['ingredients'] };
}

export const sampleRecipes = (language: Language): Recipe[] => SAMPLES[language].map(toRecipe);
