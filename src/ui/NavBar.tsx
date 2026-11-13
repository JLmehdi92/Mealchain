import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { space, touch } from './theme';

export function NavBar({ left, center, right }: { left?: ReactNode; center?: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.nav}>
      <View style={styles.side}>{left}</View>
      {center}
      <View style={[styles.side, styles.end]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: touch.min, paddingHorizontal: space.lg },
  side: { flexDirection: 'row', gap: space.sm, minWidth: touch.min },
  end: { justifyContent: 'flex-end' },
});
