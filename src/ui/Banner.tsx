import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { Secondary } from './Text';
import { space, useTheme } from './theme';

type Props = { icon: IconName; tone?: 'plain' | 'allergy'; children: ReactNode };

export function Banner({ icon, tone = 'plain', children }: Props) {
  const c = useTheme();
  const color = tone === 'allergy' ? c.chili : c.ink;
  return (
    <View style={[styles.banner, { backgroundColor: tone === 'allergy' ? c.chiliBg : c.surface }]}>
      <Icon name={icon} size={20} color={color} />
      <Secondary style={[styles.grow, { color }]}>{children}</Secondary>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', gap: 10, padding: space.md, borderRadius: 12, alignItems: 'flex-start' },
  grow: { flex: 1 },
});
