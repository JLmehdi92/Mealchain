import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

import { Icon } from '@/ui/Icon';
import { enterDown, exitFade, REFLOW, toward } from '@/ui/motion';
import { Press } from '@/ui/Press';
import { Body, Caption, Mono } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

import type { ListRow as Row } from './sections';

function StrandGlyph({ color }: { color: string }) {
  return (
    <Svg width={14} height={8} viewBox="0 0 14 8">
      <Path d="M1 4 C 5 0 9 8 13 4" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function Gauge({ ratio }: { ratio: number }) {
  const c = useTheme();
  return (
    <View style={styles.gauge}>
      <View style={{ flex: ratio, backgroundColor: c.strand }} />
      <Svg style={{ flex: 1 - ratio }} height={6}>
        <Defs>
          <Pattern id="rest" width={4} height={4} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <Rect width={4} height={4} fill={c.surface} />
            <Rect width={1} height={4} fill={c.ink2} opacity={0.4} />
          </Pattern>
        </Defs>
        <Rect width="100%" height={6} fill="url(#rest)" />
      </Svg>
    </View>
  );
}

const TICK_MS = 320;

function Check({ checked }: { checked: boolean }) {
  const c = useTheme();
  const reduced = useReducedMotion();
  const fill = useSharedValue(checked ? 1 : 0);
  useEffect(() => {
    fill.set(toward(reduced, checked ? 1 : 0));
  }, [fill, reduced, checked]);
  const style = useAnimatedStyle(() => (reduced ? { opacity: fill.get() } : { opacity: Math.min(1, fill.get() * 2), transform: [{ scale: 0.6 + 0.4 * fill.get() }] }));
  return (
    <View style={[styles.check, { borderColor: c.ink2 }]}>
      <Animated.View style={[styles.fill, { backgroundColor: c.ink }, style]}>
        <Icon name="checkmark" size={13} weight="bold" color={c.onInk} />
      </Animated.View>
    </View>
  );
}

function Strike({ color }: { color: string }) {
  const reduced = useReducedMotion();
  const drawn = useSharedValue(0);
  useEffect(() => {
    drawn.set(toward(reduced, 1, 60));
  }, [drawn, reduced]);
  const style = useAnimatedStyle(() => (reduced ? { opacity: drawn.get() } : { transform: [{ scaleX: drawn.get() }] }));
  return <Animated.View style={[styles.strike, { backgroundColor: color }, style]} />;
}

export function ListRow({ row, onToggle }: { row: Row; onToggle: (id: string) => void }) {
  const c = useTheme();
  const reduced = useReducedMotion();
  const [ticking, setTicking] = useState(false);
  const muted = row.checked || ticking ? { color: c.ink2 } : null;
  const struck = row.checked ? { textDecorationLine: 'line-through' as const } : null;
  const press = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (row.checked) return onToggle(row.id);
    if (ticking) return;
    setTicking(true);
    setTimeout(() => onToggle(row.id), reduced ? 150 : TICK_MS);
  };
  return (
    <Animated.View entering={enterDown(reduced)} exiting={exitFade(reduced)} layout={reduced ? undefined : REFLOW}>
      <Press
        testID={`list-item-${row.id}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: row.checked || ticking }}
        accessibilityLabel={[row.name, row.qty, row.detail].filter(Boolean).join(', ')}
        onPress={press}
        highlight={c.surface}
        style={[styles.row, { borderTopColor: c.rule }]}
      >
        <Check checked={row.checked || ticking} />
        <View style={styles.grow}>
          <View style={styles.name}>
            <Body style={[muted, struck]}>{row.name}</Body>
            {ticking ? <Strike color={c.ink2} /> : null}
          </View>
          {row.detail ? (
            <View style={styles.why}>
              {row.used ? <StrandGlyph color={c.strand} /> : null}
              <Caption muted style={styles.grow}>{row.detail}</Caption>
            </View>
          ) : null}
          {row.ratio !== null ? <Gauge ratio={row.ratio} /> : null}
        </View>
        {row.qty ? <Mono style={[styles.qty, muted, struck]}>{row.qty}</Mono> : null}
      </Press>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    minHeight: 52,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: -StyleSheet.hairlineWidth,
  },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, marginTop: 1 },
  fill: { position: 'absolute', top: -1.5, left: -1.5, right: -1.5, bottom: -1.5, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { alignSelf: 'flex-start' },
  strike: { position: 'absolute', left: 0, right: 0, top: '55%', height: 1.5, transformOrigin: 'left center' },
  grow: { flex: 1, minWidth: 0 },
  why: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: 2 },
  gauge: { flexDirection: 'row', width: 120, height: 6, gap: 2, borderRadius: 3, overflow: 'hidden', marginTop: space.sm },
  qty: { fontSize: 13, lineHeight: 22, letterSpacing: -0.26, textAlign: 'right', maxWidth: '45%' },
});
