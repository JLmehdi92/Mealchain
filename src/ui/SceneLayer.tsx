import { useEffect, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import Svg from 'react-native-svg';

import { LAND, SETTLE, toward } from './motion';

export type From = { x?: number; y?: number; scale?: number; opacity?: number; origin?: string };
type Props = { from: From; delay: number; land?: boolean; viewBox: string; children: ReactNode };

export function SceneLayer({ from, delay, land, viewBox, children }: Props) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(toward(reduced, 1, delay, land ? LAND : SETTLE));
  }, [progress, reduced, delay, land]);
  const { x = 0, y = 0, scale = 1, opacity = 0, origin = 'center' } = from;
  const style = useAnimatedStyle(() => {
    const p = progress.get();
    const rest = 1 - p;
    return {
      opacity: opacity + (1 - opacity) * Math.min(p, 1),
      transform: reduced ? [] : [{ translateX: x * rest }, { translateY: y * rest }, { scale: scale + (1 - scale) * p }],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transformOrigin: origin }, style]}>
      <Svg viewBox={viewBox} width="100%" height="100%" accessible={false}>
        {children}
      </Svg>
    </Animated.View>
  );
}

export function StaticLayer({ viewBox, children }: { viewBox: string; children: ReactNode }) {
  return (
    <Svg viewBox={viewBox} width="100%" height="100%" style={StyleSheet.absoluteFill} accessible={false}>
      {children}
    </Svg>
  );
}
