import { StyleSheet } from 'react-native';

import { Caption } from './Text';
import { space } from './theme';

export function SectionLabel({ children }: { children: string }) {
  return (
    <Caption muted accessibilityRole="header" style={styles.section}>
      {children}
    </Caption>
  );
}

const styles = StyleSheet.create({ section: { marginTop: space.xxl, marginBottom: -space.xs } });
