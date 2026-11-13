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

export function t(key: StringKey, params?: Record<string, string | number>): string {
  const text = (language() === 'fr' ? fr : en)[key];
  return params ? text.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match)) : text;
}
