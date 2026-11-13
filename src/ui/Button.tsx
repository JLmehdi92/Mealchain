import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Body, Secondary } from './Text';
import { touch, useTheme, type Colors } from './theme';

type Kind = 'primary' | 'secondary' | 'quiet' | 'danger';
type Props = Omit<PressableProps, 'children' | 'style'> & { label: string; kind?: Kind };

const SPRING = { damping: 40, stiffness: 500 };

function palette(c: Colors, kind: Kind) {
  switch (kind) {
    case 'primary':
      return { bg: c.action, fg: c.onAction };
    case 'secondary':
      return { bg: c.surface, fg: c.ink };
    case 'danger':
      return { bg: c.chiliBg, fg: c.chili };
    case 'quiet':
      return { bg: 'transparent', fg: c.ink2 };
  }
}

export function Button({ label, kind = 'primary', onPressIn, onPressOut, onPress, disabled, ...props }: Props) {
  const c = useTheme();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const { bg, fg } = palette(c, kind);
  const Label = kind === 'quiet' ? Secondary : Body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPressIn={(e) => {
        scale.set(withSpring(0.97, SPRING));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      {...props}
    >
      <Animated.View
        style={[
          styles.base,
          { backgroundColor: bg, minHeight: kind === 'quiet' ? touch.min : touch.button, opacity: disabled ? 0.5 : 1 },
          animated,
        ]}
      >
        <Label style={{ color: fg, fontWeight: kind === 'quiet' ? '400' : '500' }}>{label}</Label>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 26, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
});
