import { getLocales } from 'expo-localization';

import type { Market } from '@/features/ingredients/schema';

import { en } from './strings/en';
import { fr } from './strings/fr';

export type Language = 'en' | 'fr';
export type StringKey = keyof typeof en;

const FR_REGIONS = new Set(['FR', 'BE', 'CH', 'LU', 'MC']);

export function language(): Language {
  return getLocales()[0]?.languageCode === 'fr' ? 'fr' : 'en';
}

export function market(): Market {
  const region = getLocales()[0]?.regionCode;
  return (region && FR_REGIONS.has(region)) || language() === 'fr' ? 'fr' : 'us';
}

export const fill = (text: string, params?: Record<string, string | number>) =>
  params ? text.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match)) : text;

export const pick = <T>(table: { en: T; fr: T }): T => (language() === 'fr' ? table.fr : table.en);

export const t = (key: StringKey, params?: Record<string, string | number>): string => fill(pick({ en, fr })[key], params);
