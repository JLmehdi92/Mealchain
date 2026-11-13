import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { signedIn, signInWithApple } from '@/features/household/account';
import { signInFailed } from '@/features/household/signInError';
import type { Recipe } from '@/features/recipes/types';
import { useIsPro } from '@/features/subscription/useIsPro';
import { pick } from '@/lib/i18n';

import { askConsent, rememberConsent } from './consent';
import { errorCopy, reviewCopy } from './copy';
import { importRecipe, type ImportFailure, type ImportInput, type Outcome } from './importRecipe';
import { saveImported } from './saveImported';
import { pickScreenshot, readScreenshot } from './screenshot';

export type TextSource = 'caption' | 'screenshot';
type Phase =
  | { name: 'choose' }
  | { name: 'link' }
  | { name: 'text'; source: TextSource }
  | { name: 'loading'; input: ImportInput; step: number; count: number }
  | { name: 'error'; input: ImportInput; error: ImportFailure }
  | { name: 'review'; recipe: Recipe };

const loading = (input: ImportInput): Phase => ({ name: 'loading', input, step: 0, count: 0 });

function useRunGuard() {
  const runId = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const begin = () => {
    const id = (runId.current += 1);
    return () => mounted.current && id === runId.current;
  };
  const cancel = () => {
    runId.current += 1;
  };
  return { begin, cancel };
}

async function save(recipe: Recipe, pro: boolean) {
  try {
    if ((await saveImported(recipe, pro)) === 'paywall') router.replace('/paywall');
    else router.back();
  } catch {
    Alert.alert(pick(reviewCopy).saveFailed);
  }
}

export function useImportFlow() {
  const pro = useIsPro();
  const [phase, setPhase] = useState<Phase>({ name: 'choose' });
  const [text, setText] = useState('');
  const { begin, cancel } = useRunGuard();

  const close = () => {
    cancel();
    router.back();
  };

  const run = async (input: ImportInput) => {
    const live = begin();
    setPhase(loading(input));
    const onStep = (step: number, count: number) => live() && setPhase({ name: 'loading', input, step, count });
    const options = { id: Crypto.randomUUID(), now: Date.now(), askConsent, rememberConsent, signedIn, isCancelled: () => !live(), onStep };
    const outcome: Outcome = await importRecipe(input, options).catch(() => ({ error: 'unreachable' as const }));
    if (!live() || 'cancelled' in outcome) return;
    setPhase('error' in outcome ? { name: 'error', input, error: outcome.error } : { name: 'review', recipe: outcome.recipe });
  };

  const fromScreenshot = async () => {
    const uri = await pickScreenshot();
    const live = begin();
    if (!uri || !live()) return;
    setPhase(loading({ kind: 'text', text: '', source: 'screenshot' }));
    const read = await readScreenshot(uri).catch(() => '');
    if (!live()) return;
    setText(read);
    await run({ kind: 'text', text: read, source: 'screenshot' });
  };

  const signInAndRun = (input: ImportInput) =>
    signInWithApple().then(
      () => run(input),
      (error: unknown) => signInFailed(error, pick(errorCopy).signInFailed),
    );

  return { phase, setPhase, text, setText, close, run, fromScreenshot, signInAndRun, save: (recipe: Recipe) => save(recipe, pro) };
}
