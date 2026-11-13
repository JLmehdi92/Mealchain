import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import type { WeekPlan } from '@/features/planner/plan';
import { unsafeSlots } from '@/features/planner/swap';
import type { Household, Recipe } from '@/features/recipes/types';
import { language, pick } from '@/lib/i18n';
import { Caption, H2 } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

import { chainsOf, dateOf, dayLabel, daysOf } from '../chains';
import { weekCopy } from '../copy';
import { strandPath } from '../strands';
import { MealCard, type Frame, type Host } from './MealCard';
import { pillsFor } from './pills';

type Props = { plan: WeekPlan; recipes: Recipe[]; household: Household; weekStart: string; onOpen: (id: string) => void; onSwap: (slot: number) => void };

const same = (a: Frame | undefined, b: Frame) => !!a && a.top === b.top && a.right === b.right && a.pillRight === b.pillRight && a.pillY === b.pillY;

function Strands({ plan, frames }: { plan: WeekPlan; frames: Record<number, Frame> }) {
  const c = useTheme();
  const paths = chainsOf(plan).flatMap((chain, index) => {
    const from = frames[chain.fromSlot];
    const pillRight = from?.pillRight;
    const pillY = from?.pillY;
    if (!from || pillRight === undefined || pillY === undefined) return [];
    return chain.toSlots.flatMap((to) => {
      const target = frames[to];
      return target ? [{ key: `${chain.ingredientId}-${chain.fromSlot}-${to}`, ...strandPath({ pillRight, pillY, cardRight: from.right, targetTop: target.top, index }) }] : [];
    });
  });
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false}>
      {paths.map(({ key, d, start, end }) => (
        <PathGroup key={key} d={d} start={start} end={end} color={c.strand} />
      ))}
    </Svg>
  );
}

function PathGroup({ d, start, end, color }: { d: string; start: { x: number; y: number }; end: { x: number; y: number }; color: string }) {
  return (
    <>
      <Path d={d} stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Circle cx={start.x} cy={start.y} r={3} fill={color} />
      <Circle cx={end.x} cy={end.y} r={3.5} fill={color} />
    </>
  );
}

export function PlanView({ plan, recipes, household, weekStart, onOpen, onSwap }: Props) {
  const s = pick(weekCopy);
  const body = useRef<Host>(null);
  const [frames, setFrames] = useState<Record<number, Frame>>({});
  const unsafe = new Set(unsafeSlots(plan, recipes, household));
  const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const measure = (slot: number) => (frame: Frame) => setFrames((all) => (same(all[slot], frame) ? all : { ...all, [slot]: frame }));

  return (
    <View ref={body} style={styles.body}>
      {daysOf(plan).map(({ day, slots }) => (
        <View key={day} style={styles.day}>
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
                  recipe={entry ? byId.get(entry.recipeId) : undefined}
                  label={entry?.meal === 'lunch' ? s.lunch : undefined}
                  pills={pillsFor(plan, slot, weekStart, household.market)}
                  unsafe={unsafe.has(slot)}
                  body={body}
                  onMeasure={measure(slot)}
                  onOpen={() => entry && onOpen(entry.recipeId)}
                  onSwap={() => onSwap(slot)}
                />
              );
            })}
          </View>
        </View>
      ))}
      <Strands plan={plan} frames={frames} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: space.md },
  day: { flexDirection: 'row', gap: space.md, paddingVertical: space.md },
  dayName: { width: 44, paddingTop: space.xs },
  meals: { flex: 1, gap: space.sm },
});
