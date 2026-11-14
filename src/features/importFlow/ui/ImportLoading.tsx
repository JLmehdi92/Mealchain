import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue } from 'react-native-reanimated';

import { Skeleton, TextButton } from '@/features/recipes/ui/parts';
import { isAllowedUrl } from '@/lib/importApi';
import { fill, pick, t } from '@/lib/i18n';
import { Icon } from '@/ui/Icon';
import { toward } from '@/ui/motion';
import { NavBar } from '@/ui/NavBar';
import { Body, Caption, Title } from '@/ui/Text';
import { radius, space, useTheme } from '@/ui/theme';

import { importCopy } from '../copy';
import type { ImportInput } from '../importRecipe';

type Props = { input: ImportInput; step: number; count: number; onCancel: () => void };

function sourceLine(input: ImportInput, s: (typeof importCopy)['en']): { icon: 'link' | 'doc.text' | 'camera'; text: string } {
  if (input.kind === 'url') return { icon: 'link', text: fill(s.fromLink, { host: isAllowedUrl(input.url)?.hostname ?? input.url }) };
  return input.source === 'screenshot' ? { icon: 'camera', text: s.fromShot } : { icon: 'doc.text', text: s.fromText };
}

function StepRow({ label, state }: { label: string; state: 'done' | 'now' | 'todo' }) {
  const c = useTheme();
  const reduced = useReducedMotion();
  const done = useSharedValue(state === 'done' ? 1 : 0);
  useEffect(() => {
    done.set(toward(reduced, state === 'done' ? 1 : 0));
  }, [done, reduced, state]);
  const fill = useAnimatedStyle(() => (reduced ? { opacity: done.get() } : { opacity: Math.min(1, done.get() * 2), transform: [{ scale: 0.6 + 0.4 * done.get() }] }));
  const ring = state === 'now' ? { borderColor: c.strand, borderWidth: 2 } : { borderColor: c.rule, borderWidth: 1.5 };
  return (
    <View style={styles.step} accessible accessibilityLabel={label} accessibilityState={{ checked: state === 'done', busy: state === 'now' }}>
      <View style={[styles.check, ring]}>
        <Animated.View style={[styles.checkFill, { backgroundColor: c.ink }, fill]}>
          <Icon name="checkmark" size={12} color={c.onInk} />
        </Animated.View>
      </View>
      <Body muted={state === 'todo'}>{label}</Body>
    </View>
  );
}

export function ImportLoading({ input, step, count, onCancel }: Props) {
  const s = pick(importCopy);
  const c = useTheme();
  const source = sourceLine(input, s);
  const title = input.kind === 'url' ? s.readingPage : input.source === 'screenshot' ? s.readingShot : s.readingText;
  const steps = [input.kind === 'url' ? s.foundPage : s.foundText, count > 0 ? fill(s.count, { count }) : s.readingIngredients, s.matching, s.checking];
  return (
    <View style={styles.fill}>
      <NavBar left={<TextButton label={t('common.cancel')} onPress={onCancel} />} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.source}>
          <Icon name={source.icon} size={14} color={c.ink2} />
          <Caption muted>{source.text}</Caption>
        </View>
        <Title>{title}</Title>
        <View style={styles.steps}>
          {steps.map((label, i) => (
            <StepRow key={i} label={label} state={i < step ? 'done' : i === step ? 'now' : 'todo'} />
          ))}
        </View>
        <View style={[styles.preview, { backgroundColor: c.sheet, borderColor: c.rule }]}>
          <Skeleton width="70%" height={20} />
          <Skeleton width="40%" />
          <View style={styles.gap} />
          {[86, 64, 72, 58, 80].map((w) => (
            <Skeleton key={w} width={`${w}%`} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: space.xl, paddingBottom: space.xxxl },
  source: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: space.sm },
  steps: { marginTop: 28, gap: 14 },
  step: { flexDirection: 'row', gap: space.md, alignItems: 'center', minHeight: 24 },
  check: { width: 24, height: 24, borderRadius: 12 },
  checkFill: { position: 'absolute', top: -1.5, left: -1.5, right: -1.5, bottom: -1.5, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  preview: { marginTop: space.xxxl, padding: space.lg, gap: 10, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth },
  gap: { height: space.sm },
});
