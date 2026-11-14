import { useRef, type ComponentRef, type RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, type SharedValue } from 'react-native-reanimated';

import type { Recipe } from '@/features/recipes/types';
import { PackThumb } from '@/features/recipes/ui/illustrations';
import { pick, t } from '@/lib/i18n';
import { Icon } from '@/ui/Icon';
import { Press } from '@/ui/Press';
import { Tag } from '@/ui/Tag';
import { Body, Caption } from '@/ui/Text';
import { radius, space, useTheme } from '@/ui/theme';

import { weekCopy } from '../copy';
import type { Frame } from '../strands';
import type { Pill } from './pills';
import { useSwapFlash } from './useSwapFlash';

export type Host = ComponentRef<typeof View>;
type Props = {
  recipe: Recipe | undefined;
  pills: Pill[];
  label?: string;
  swapped: string | null;
  unsafe: boolean;
  body: RefObject<Host | null>;
  testID: string;
  landing: { key: string; value: SharedValue<number> } | null;
  onMeasure: (frame: Frame) => void;
  onOpen: () => void;
  onSwap: () => void;
};
type PillProps = { pill: Pill; pillRef?: RefObject<Host | null>; land?: SharedValue<number> };

function PillView({ pill, pillRef, land }: PillProps) {
  const c = useTheme();
  const reduced = useReducedMotion();
  const color = pill.carry ? c.strandInk : c.ink2;
  const landed = useAnimatedStyle(() => {
    const p = land?.get() ?? 0;
    return reduced ? { opacity: 1 - 0.6 * p } : { transform: [{ scale: 1 + 0.08 * p }] };
  });
  const content = (
    <>
      {pill.thumb ? <PackThumb kind={pill.thumb} size={20} /> : null}
      <Caption style={{ color, fontWeight: pill.carry ? '500' : '400' }}>
        {pill.text}
        {pill.to ? <Caption style={{ color }}> · {pill.to}</Caption> : null}
      </Caption>
    </>
  );
  return (
    <View ref={pillRef} style={styles.pillHost}>
      <Animated.View style={[styles.pill, landed]}>{content}</Animated.View>
    </View>
  );
}

function useFrame(body: RefObject<Host | null>, onMeasure: (frame: Frame) => void) {
  const card = useRef<Host>(null);
  const carry = useRef<Host>(null);
  const measure = () => {
    if (!card.current || !body.current) return;
    card.current.measureLayout(body.current, (x, y, w) => {
      const frame = { top: y, right: x + w };
      if (!carry.current || !body.current) return onMeasure(frame);
      carry.current.measureLayout(body.current, (px, py, pw, ph) => onMeasure({ ...frame, pillRight: px + pw, pillY: py + ph / 2 }));
    });
  };
  return { card, carry, measure };
}

export function MealCard({ recipe, pills, label, swapped, unsafe, body, testID, landing, onMeasure, onOpen, onSwap }: Props) {
  const c = useTheme();
  const s = pick(weekCopy);
  const { card, carry, measure } = useFrame(body, onMeasure);
  const firstCarry = pills.findIndex((pill) => pill.carry);
  const flash = useSwapFlash(swapped !== null, swapped ?? '');
  return (
    <Animated.View ref={card} onLayout={measure} style={flash.lift}>
      <Press
        testID={testID}
        onPress={onOpen}
        onLongPress={onSwap}
        accessibilityRole="button"
        accessibilityActions={[{ name: 'swap', label: s.swapAction }]}
        onAccessibilityAction={(event) => event.nativeEvent.actionName === 'swap' && onSwap()}
        style={[styles.card, { backgroundColor: c.sheet }, flash.border]}
      >
        {label ? <Caption muted>{label}</Caption> : null}
        <Body testID={testID && `${testID}-title`} style={styles.name}>{recipe?.title ?? s.deletedRecipe}</Body>
        {recipe?.totalMinutes ? (
          <View style={styles.meta}>
            <Icon name="clock" size={13} muted />
            <Caption muted>{t('common.minutes', { n: recipe.totalMinutes })}</Caption>
          </View>
        ) : null}
        {unsafe ? <Tag kind="excluded" label={s.unsafe} /> : null}
        {pills.length > 0 ? (
          <View style={styles.uses}>
            {pills.map((pill, i) => (
              <PillView
                key={pill.key}
                pill={pill}
                pillRef={i === firstCarry ? carry : undefined}
                land={landing?.key === pill.key ? landing.value : undefined}
              />
            ))}
          </View>
        ) : null}
      </Press>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, paddingVertical: 14, paddingHorizontal: space.lg, gap: 2 },
  name: { fontWeight: '500' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  uses: { marginTop: 10, gap: 6, alignItems: 'flex-start' },
  pillHost: { alignSelf: 'flex-start' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, transformOrigin: 'left center' },
});
