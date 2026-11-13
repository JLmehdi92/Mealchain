import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { H2, Secondary } from './Text';
import { space } from './theme';

export function Empty({ art, title, body, children }: { art: ReactNode; title: string; body: string; children?: ReactNode }) {
  return (
    <View style={styles.empty}>
      {art}
      <H2 style={styles.center}>{title}</H2>
      <Secondary muted style={styles.center}>{body}</Secondary>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: space.md, paddingTop: 64, paddingHorizontal: space.xxl },
  center: { textAlign: 'center', maxWidth: 300 },
});
