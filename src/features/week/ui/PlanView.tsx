import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion, useSharedValue } from 'react-native-reanimated';

import type { WeekPlan } from '@/features/planner/plan';
import { unsafeSlots } from '@/features/planner/swap';
import type { Household, Recipe } from '@/features/recipes/types';
import { fill, language, pick } from '@/lib/i18n';
import { enterDown, pulse } from '@/ui/motion';
import { Caption, H2 } from '@/ui/Text';
import { space } from '@/ui/theme';

import { chainsOf, dateOf, dayLabel, daysOf } from '../chains';
import { weekCopy } from '../copy';
import { strandsOf, type Frame } from '../strands';
import { useSwappedSlot } from '../swapped';
import { CarryToken, type Travel } from './CarryToken';
import { MealCard, type Host } from './MealCard';
import { chainThumb, pillsFor } from './pills';
import { STRAND_START, STRAND_STAGGER, Strands } from './Strands';

type Props = {
  plan: WeekPlan;
  recipes: Recipe[];
  household: Household;
  weekStart: string;
  animate: boolean;
  onOpen: (id: string) => void;
  onSwap: (slot: number) => void;
};

const same = (a: Frame | undefined, b: Frame) => !!a && a.top === b.top && a.right === b.right && a.pillRight === b.pillRight && a.pillY === b.pillY;

function useCarry(plan: WeekPlan, frames: Record<number, Frame>, household: Household) {
  const reduced = useReducedMotion();
  const land = useSharedValue(0);
  const [travel, setTravel] = useState<(Travel & { landSlot: number; landPill: string }) | null>(null);
  const strands = strandsOf(plan, frames);
  const play = (chain: number, delay: number) => {
    const finishing = strands.filter((strand) => strand.chain === chain).at(-1);
    const ingredientId = chainsOf(plan)[chain]?.ingredientId;
    if (!finishing || !ingredientId) return;
    setTravel((prev) => ({
      d: finishing.d,
      thumb: chainThumb(ingredientId, household.market),
      delay,
      run: (prev?.run ?? 0) + 1,
      landSlot: finishing.toSlot,
      landPill: `in-${ingredientId}`,
    }));
  };
  const arrive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    land.set(pulse(reduced));
  };
  return { strands, travel, land, play, arrive };
}

export function PlanView({ plan, recipes, household, weekStart, animate, onOpen, onSwap }: Props) {
  const s = pick(weekCopy);
  const reduced = useReducedMotion();
  const swapped = useSwappedSlot();
  const body = useRef<Host>(null);
  const played = useRef(false);
  const [frames, setFrames] = useState<Record<number, Frame>>({});
  const { strands, travel, land, play, arrive } = useCarry(plan, frames, household);
  const unsafe = new Set(unsafeSlots(plan, recipes, household));
  const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const measure = (slot: number) => (frame: Frame) => setFrames((all) => (same(all[slot], frame) ? all : { ...all, [slot]: frame }));
  const ready = strands.length > 0;
  const announce = (day: number, recipeId = '') =>
    fill(s.swapped, { day: dayLabel(weekStart, day, language(), 'long'), title: byId.get(recipeId)?.title ?? '' });

  useEffect(() => {
    if (!animate || !ready || played.current) return;
    played.current = true;
    play(0, STRAND_START + strands.length * STRAND_STAGGER);
  });

  return (
    <View ref={body} style={styles.body}>
      {daysOf(plan).map(({ day, slots }, i) => (
        <Animated.View key={day} entering={animate ? enterDown(reduced, i * 90) : undefined} style={styles.day}>
          <View style={styles.dayName}>
            <Caption muted>{dayLabel(weekStart, day, language(), 'short')}</Caption>
            <H2>{dateOf(weekStart, day).getDate()}</H2>
          </View>
          <View style={styles.meals}>
            {slots.map((slot) => {
              const entry = plan.slots[slot];
              return (
                <MealCard
                  key={slot}
                  testID={`meal-${slot}`}
                  recipe={entry ? byId.get(entry.recipeId) : undefined}
                  label={entry?.meal === 'lunch' ? s.lunch : undefined}
                  swapped={swapped === slot ? announce(day, entry?.recipeId) : null}
                  pills={pillsFor(plan, slot, weekStart, household.market)}
                  unsafe={unsafe.has(slot)}
                  body={body}
                  landing={travel?.landSlot === slot ? { key: travel.landPill, value: land } : null}
                  onMeasure={measure(slot)}
                  onOpen={() => entry && onOpen(entry.recipeId)}
                  onSwap={() => onSwap(slot)}
                />
              );
            })}
          </View>
        </Animated.View>
      ))}
      <Strands strands={strands} animate={animate} />
      {travel ? <CarryToken key={travel.run} travel={travel} onArrive={arrive} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: space.md },
  day: { flexDirection: 'row', gap: space.md, paddingVertical: space.md },
  dayName: { width: 44, paddingTop: space.xs },
  meals: { flex: 1, gap: space.sm },
});
