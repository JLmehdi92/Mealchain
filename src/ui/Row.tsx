import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Body, Secondary } from './Text';
import { space, useTheme } from './theme';

type Props = { label: string; detail?: string; trailing?: ReactNode; onPress?: () => void };

export function Row({ label, detail, trailing, onPress }: Props) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { borderTopColor: c.rule }, pressed && { backgroundColor: c.surface }]}
    >
      <View style={styles.grow}>
        <Body>{label}</Body>
        {detail ? <Secondary muted>{detail}</Secondary> : null}
      </View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: -StyleSheet.hairlineWidth,
  },
  grow: { flex: 1, minWidth: 0 },
});
