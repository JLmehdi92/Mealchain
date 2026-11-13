import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { enterDown } from './motion';
import { Secondary, Title } from './Text';
import { space, useTheme } from './theme';

type Props = { title: string; subtitle?: string; children?: ReactNode; footer?: ReactNode; staged?: boolean };

const STAGGER = 70;

function Stage({ step, on, style, children }: { step: number; on?: boolean; style: ViewStyle; children: ReactNode }) {
  const reduced = useReducedMotion();
  if (!on) return children;
  return (
    <Animated.View entering={enterDown(reduced, step * STAGGER)} style={style}>
      {children}
    </Animated.View>
  );
}

export function Screen({ title, subtitle, children, footer, staged }: Props) {
  const c = useTheme();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.fill, { backgroundColor: c.paper }]}>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <Stage step={0} on={staged} style={styles.stack}>
          <Title>{title}</Title>
          {subtitle ? <Secondary muted>{subtitle}</Secondary> : null}
        </Stage>
        <Stage step={1} on={staged} style={styles.stack}>
          {children}
        </Stage>
      </ScrollView>
      {footer ? (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Stage step={2} on={staged} style={styles.footerStack}>
            {footer}
          </Stage>
        </SafeAreaView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  stack: { gap: space.md },
  footerStack: { gap: space.sm },
  footer: { paddingHorizontal: space.xl, paddingTop: space.lg, gap: space.sm },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.xxxl * 3, gap: space.md },
});
