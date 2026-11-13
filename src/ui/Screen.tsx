import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Secondary, Title } from './Text';
import { space, useTheme } from './theme';

type Props = { title: string; subtitle?: string; children?: ReactNode; footer?: ReactNode };

export function Screen({ title, subtitle, children, footer }: Props) {
  const c = useTheme();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.fill, { backgroundColor: c.paper }]}>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <Title>{title}</Title>
        {subtitle ? <Secondary muted>{subtitle}</Secondary> : null}
        {children}
      </ScrollView>
      {footer ? (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          {footer}
        </SafeAreaView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  footer: { paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.sm },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.xxxl * 3, gap: space.md },
});
