import { Easing, FadeIn, FadeInDown, FadeOut, LinearTransition, ReduceMotion, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';

type Spring = { duration: number; dampingRatio: number };

export const SETTLE = { duration: 400, dampingRatio: 1 } as const;
export const LAND = { duration: 700, dampingRatio: 0.75 } as const;
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const REFLOW = LinearTransition.springify(350).dampingRatio(1);

const FADE = { duration: 150, reduceMotion: ReduceMotion.Never };

export const toward = (reduced: boolean, to: number, delay = 0, spring: Spring = SETTLE) =>
  reduced ? withTiming(to, FADE) : withDelay(delay, withSpring(to, spring));

export const pulse = (reduced: boolean) =>
  reduced
    ? withSequence(withTiming(1, FADE), withTiming(0, FADE))
    : withSequence(withTiming(1, { duration: 120, easing: EASE_OUT }), withSpring(0, SETTLE));

export const enterDown = (reduced: boolean, delay = 0) =>
  reduced ? FadeIn.duration(150).reduceMotion(ReduceMotion.Never) : FadeInDown.springify(400).dampingRatio(1).delay(delay);

export const exitFade = (reduced: boolean) => FadeOut.duration(reduced ? 150 : 200).reduceMotion(ReduceMotion.Never);
