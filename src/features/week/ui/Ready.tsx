import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { Path } from 'react-native-svg';

import { halfDisc } from '@/features/household/WelcomeScene';
import { enterDown } from '@/ui/motion';
import { SceneLayer, StaticLayer } from '@/ui/SceneLayer';
import { Secondary } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

const VIEW = '0 0 40 40';

export function Ready({ text }: { text: string }) {
  const c = useTheme();
  const reduced = useReducedMotion();
  useEffect(() => AccessibilityInfo.announceForAccessibility(text), [text]);
  return (
    <Animated.View entering={enterDown(reduced, 120)} style={styles.row} accessible>
      <View style={styles.mark}>
        <StaticLayer viewBox={VIEW}>
          <Path d={halfDisc(20, 20, 14, 'l')} fill={c.ink} />
        </StaticLayer>
        <SceneLayer viewBox={VIEW} delay={200} land from={{ x: 10, y: -6, opacity: 1 }}>
          <Path d={halfDisc(20, 20, 14, 'r')} fill={c.strand} />
        </SceneLayer>
      </View>
      <Secondary>{text}</Secondary>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  mark: { width: 20, height: 20 },
});
