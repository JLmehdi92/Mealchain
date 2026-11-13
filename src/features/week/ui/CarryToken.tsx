import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedReaction, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { Thumb } from '@/features/recipes/meta';
import { PackThumb } from '@/features/recipes/ui/illustrations';
import { LAND, toward } from '@/ui/motion';
import { useTheme } from '@/ui/theme';

import { pointAt, samplePath } from '../pathPoints';

const SIZE = 24;
const TRAVEL = { ...LAND, duration: 900 } as const;

export type Travel = { d: string; thumb: Thumb | null; delay: number; run: number };

export function CarryToken({ travel, onArrive }: { travel: Travel; onArrive: () => void }) {
  const c = useTheme();
  const reduced = useReducedMotion();
  const { xs, ys } = samplePath(travel.d);
  const t = useSharedValue(0);
  const shown = useSharedValue(0);
  const landed = useSharedValue(false);

  useEffect(() => {
    shown.set(toward(reduced, 1, travel.delay));
    t.set(toward(reduced, 1, travel.delay, TRAVEL));
  }, [t, shown, reduced, travel.delay]);

  useAnimatedReaction(
    () => t.get() >= 1,
    (arrived) => {
      if (!arrived || landed.get()) return;
      landed.set(true);
      shown.set(withTiming(0, { duration: 150 }));
      scheduleOnRN(onArrive);
    },
  );

  const style = useAnimatedStyle(() => {
    const { x, y } = pointAt(xs, ys, t.get());
    return {
      opacity: reduced ? 0 : shown.get(),
      transform: [{ translateX: x - SIZE / 2 }, { translateY: y - SIZE / 2 }, { scale: 0.6 + 0.4 * Math.min(shown.get(), 1) }],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.token, { backgroundColor: c.sheet, borderColor: c.strand }, style]}>
      {travel.thumb ? <PackThumb kind={travel.thumb} size={16} /> : <View style={[styles.dot, { backgroundColor: c.strand }]} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  token: {
    position: 'absolute', left: 0, top: 0, width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
