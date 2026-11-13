import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';

import type { Recipe } from '@/features/recipes/types';
import type { ImportError } from '@/lib/importApi';
import { pick } from '@/lib/i18n';
import { saveRecipe } from '@/lib/store';

import { askConsent } from './consent';
import { reviewCopy } from './copy';
import { importRecipe, type ImportInput, type Outcome } from './importRecipe';
import { pickScreenshot, readScreenshot } from './screenshot';

export type TextSource = 'caption' | 'screenshot';
export type Phase =
  | { name: 'choose' }
  | { name: 'link' }
  | { name: 'text'; source: TextSource }
  | { name: 'loading'; input: ImportInput; step: number; count: number }
  | { name: 'error'; input: ImportInput; error: ImportError }
  | { name: 'review'; recipe: Recipe };

async function save(recipe: Recipe) {
  try {
    await saveRecipe(recipe);
    router.back();
  } catch {
    Alert.alert(pick(reviewCopy).saveFailed);
  }
}

export function useImportFlow() {
  const [phase, setPhase] = useState<Phase>({ name: 'choose' });
  const [text, setText] = useState('');
  const runId = useRef(0);

  const close = () => {
    runId.current += 1;
    router.back();
  };

  const run = async (input: ImportInput) => {
    const id = (runId.current += 1);
    setPhase({ name: 'loading', input, step: 0, count: 0 });
    const onStep = (step: number, count: number) => id === runId.current && setPhase({ name: 'loading', input, step, count });
    const outcome: Outcome = await importRecipe(input, { id: Crypto.randomUUID(), now: Date.now(), askConsent, onStep }).catch(() => ({
      error: 'unreachable' as const,
    }));
    if (id !== runId.current) return;
    setPhase('error' in outcome ? { name: 'error', input, error: outcome.error } : { name: 'review', recipe: outcome.recipe });
  };

  const fromScreenshot = async () => {
    const uri = await pickScreenshot();
    if (!uri) return;
    setPhase({ name: 'loading', input: { kind: 'text', text: '', source: 'screenshot' }, step: 0, count: 0 });
    const read = await readScreenshot(uri).catch(() => '');
    setText(read);
    await run({ kind: 'text', text: read, source: 'screenshot' });
  };

  return { phase, setPhase, text, setText, close, run, fromScreenshot, save };
}
