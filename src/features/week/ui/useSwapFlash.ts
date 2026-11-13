import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';
import {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/ui/theme';

import { clearSwapped } from '../swapped';

const SHEET_GONE = 350;

export function useSwapFlash(active: boolean, announcement: string) {
  const c = useTheme();
  const reduced = useReducedMotion();
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    clearSwapped();
    glow.set(withDelay(SHEET_GONE, withSequence(withTiming(1, { duration: 220 }), withDelay(900, withTiming(0, { duration: 600 })))));
    const timer = setTimeout(() => AccessibilityInfo.announceForAccessibility(announcement), SHEET_GONE);
    return () => clearTimeout(timer);
  }, [active, announcement, glow]);

  const lift = useAnimatedStyle(() => (reduced ? {} : { transform: [{ scale: 1 + 0.02 * glow.get() }] }));
  const border = useAnimatedStyle(() => ({ borderColor: interpolateColor(glow.get(), [0, 1], [c.rule, c.strand]) }));
  return { lift, border };
}
