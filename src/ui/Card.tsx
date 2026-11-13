import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { radius, useTheme } from './theme';

export function Card({ style, ...props }: ComponentProps<typeof Animated.View>) {
  const c = useTheme();
  return <Animated.View style={[styles.card, { backgroundColor: c.sheet, borderColor: c.rule }, style]} {...props} />;
}

export const Group = Card;

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
});
