import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { EASE_OUT, SETTLE } from './motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESS_IN = { duration: 100, easing: EASE_OUT, reduceMotion: ReduceMotion.Never };
const RELEASE = { ...SETTLE, reduceMotion: ReduceMotion.Never };

type Props = Omit<PressableProps, 'style'> & { style?: StyleProp<AnimatedStyle<ViewStyle>>; highlight?: string };

export function Press({ style, highlight, onPressIn, onPressOut, ...props }: Props) {
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);
  const feedback = useAnimatedStyle(() => {
    const p = pressed.get();
    if (highlight) return { backgroundColor: interpolateColor(p, [0, 1], [`${highlight}00`, highlight]) };
    return reduced ? { opacity: 1 - 0.3 * p } : { transform: [{ scale: 1 - 0.03 * p }] };
  });
  return (
    <AnimatedPressable
      onPressIn={(e) => {
        pressed.set(withTiming(1, PRESS_IN));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.set(withSpring(0, RELEASE));
        onPressOut?.(e);
      }}
      style={[style, feedback]}
      {...props}
    />
  );
}
