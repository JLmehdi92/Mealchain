import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedProps, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { toward } from '@/ui/motion';
import { useTheme } from '@/ui/theme';

import { samplePath } from '../pathPoints';
import type { Strand } from '../strands';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const DRAW = { duration: 450, dampingRatio: 1 } as const;

export const STRAND_START = 600;
export const STRAND_STAGGER = 250;

type LineProps = { strand: Strand; delay: number | null; color: string };

function StrandLine({ strand, delay, color }: LineProps) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(delay === null ? 1 : 0);
  const { length } = samplePath(strand.d);
  useEffect(() => {
    if (delay !== null) progress.set(toward(reduced, 1, delay, DRAW));
  }, [progress, reduced, delay]);
  const line = useAnimatedProps(() =>
    reduced ? { opacity: progress.get(), strokeDashoffset: 0 } : { opacity: 1, strokeDashoffset: length * (1 - progress.get()) },
  );
  const startKnot = useAnimatedProps(() => (reduced ? { opacity: progress.get(), r: 3 } : { opacity: 1, r: 3 * Math.min(1, progress.get() * 4) }));
  const endKnot = useAnimatedProps(() =>
    reduced ? { opacity: progress.get(), r: 3.5 } : { opacity: 1, r: 3.5 * Math.min(1, Math.max(0, (progress.get() - 0.8) * 5)) },
  );
  return (
    <>
      <AnimatedPath d={strand.d} stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" strokeDasharray={[length, length]} animatedProps={line} />
      <AnimatedCircle cx={strand.start.x} cy={strand.start.y} fill={color} animatedProps={startKnot} />
      <AnimatedCircle cx={strand.end.x} cy={strand.end.y} fill={color} animatedProps={endKnot} />
    </>
  );
}

export function Strands({ strands, animate }: { strands: Strand[]; animate: boolean }) {
  const c = useTheme();
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false}>
      {strands.map((strand, i) => (
        <StrandLine key={strand.key} strand={strand} color={c.strand} delay={animate ? STRAND_START + i * STRAND_STAGGER : null} />
      ))}
    </Svg>
  );
}
