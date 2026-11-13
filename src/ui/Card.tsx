import { StyleSheet, View, type ViewProps } from 'react-native';

import { radius, useTheme } from './theme';

export function Card({ style, ...props }: ViewProps) {
  const c = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: c.sheet, borderColor: c.rule }, style]}
      {...props}
    />
  );
}

export const Group = Card;

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
});
