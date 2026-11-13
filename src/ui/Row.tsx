import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Press } from './Press';
import { Body, Secondary } from './Text';
import { space, useTheme } from './theme';

type Props = { label: string; detail?: string; trailing?: ReactNode; onPress?: () => void; testID?: string };

export function Row({ label, detail, trailing, onPress, testID }: Props) {
  const c = useTheme();
  return (
    <Press
      testID={testID}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      highlight={c.surface}
      style={[styles.row, { borderTopColor: c.rule }]}
    >
      <View style={styles.grow}>
        <Body>{label}</Body>
        {detail ? <Secondary muted>{detail}</Secondary> : null}
      </View>
      {trailing}
    </Press>
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
