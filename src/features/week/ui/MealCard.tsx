import { useRef, type ComponentRef, type RefObject } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Recipe } from '@/features/recipes/types';
import { PackThumb } from '@/features/recipes/ui/illustrations';
import { Icon, Tag } from '@/features/recipes/ui/parts';
import { fill, pick } from '@/lib/i18n';
import { Body, Caption } from '@/ui/Text';
import { radius, space, useTheme } from '@/ui/theme';

import { weekCopy } from '../copy';
import type { Pill } from './pills';

export type Host = ComponentRef<typeof View>;
export type Frame = { top: number; right: number; pillRight?: number; pillY?: number };
type Props = {
  recipe: Recipe | undefined;
  pills: Pill[];
  label?: string;
  unsafe: boolean;
  body: RefObject<Host | null>;
  onMeasure: (frame: Frame) => void;
  onOpen: () => void;
  onSwap: () => void;
};

function PillView({ pill, pillRef }: { pill: Pill; pillRef?: RefObject<Host | null> }) {
  const c = useTheme();
  const color = pill.carry ? c.strandInk : c.ink2;
  return (
    <View ref={pillRef} style={styles.pill}>
      {pill.thumb ? <PackThumb kind={pill.thumb} size={20} /> : null}
      <Caption style={{ color, fontWeight: pill.carry ? '500' : '400' }}>
        {pill.text}
        {pill.to ? <Caption style={{ color }}> · {pill.to}</Caption> : null}
      </Caption>
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

export function MealCard({ recipe, pills, label, unsafe, body, onMeasure, onOpen, onSwap }: Props) {
  const c = useTheme();
  const s = pick(weekCopy);
  const { card, carry, measure } = useFrame(body, onMeasure);
  const firstCarry = pills.findIndex((pill) => pill.carry);
  return (
    <Pressable
      ref={card}
      onLayout={measure}
      onPress={onOpen}
      onLongPress={onSwap}
      accessibilityRole="button"
      accessibilityActions={[{ name: 'swap', label: s.swapAction }]}
      onAccessibilityAction={(event) => event.nativeEvent.actionName === 'swap' && onSwap()}
      style={({ pressed }) => [styles.card, { backgroundColor: c.sheet, borderColor: c.rule, opacity: pressed ? 0.85 : 1 }]}
    >
      {label ? <Caption muted>{label}</Caption> : null}
      <Body style={styles.name}>{recipe?.title ?? ''}</Body>
      {recipe?.totalMinutes ? (
        <View style={styles.meta}>
          <Icon name="clock" size={13} color={c.ink2} />
          <Caption muted>{fill(s.minutes, { minutes: recipe.totalMinutes })}</Caption>
        </View>
      ) : null}
      {unsafe ? <Tag kind="excluded" label={s.unsafe} /> : null}
      {pills.length > 0 ? (
        <View style={styles.uses}>
          {pills.map((pill, i) => (
            <PillView key={pill.key} pill={pill} pillRef={i === firstCarry ? carry : undefined} />
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, paddingVertical: 14, paddingHorizontal: space.lg, gap: 2 },
  name: { fontWeight: '500' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  uses: { marginTop: 10, gap: 6, alignItems: 'flex-start' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
