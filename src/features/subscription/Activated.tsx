import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import { Path } from 'react-native-svg';

import { halfDisc } from '@/features/household/WelcomeScene';
import { pick } from '@/lib/i18n';
import { SceneLayer, StaticLayer } from '@/ui/SceneLayer';
import { H2 } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

import { PAYWALL_COPY } from './copy';

const VIEW = '0 0 40 40';
const HOLD_MS = 1100;
const BACKDROP = FadeIn.duration(150).reduceMotion(ReduceMotion.Never);

export function Activated({ onDone }: { onDone: () => void }) {
  const c = useTheme();
  const text = pick(PAYWALL_COPY).activated;
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(text);
    const timer = setTimeout(onDone, HOLD_MS);
    return () => clearTimeout(timer);
  }, [onDone, text]);
  return (
    <Animated.View entering={BACKDROP} style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: c.paper }]}>
      <View style={styles.mark}>
        <StaticLayer viewBox={VIEW}>
          <Path d={halfDisc(20, 20, 14, 'l')} fill={c.ink} />
        </StaticLayer>
        <SceneLayer viewBox={VIEW} delay={150} from={{ x: 10, y: -6, opacity: 1 }}>
          <Path d={halfDisc(20, 20, 14, 'r')} fill={c.strand} />
        </SceneLayer>
      </View>
      <H2>{text}</H2>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: space.lg },
  mark: { width: 72, height: 72 },
});
