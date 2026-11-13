import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

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

export function ListRow({ row, onToggle }: { row: Row; onToggle: (id: string) => void }) {
  const c = useTheme();
  const done = row.checked ? { color: c.ink2, textDecorationLine: 'line-through' as const } : null;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: row.checked }}
      accessibilityLabel={[row.name, row.qty, row.detail].filter(Boolean).join(', ')}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle(row.id);
      }}
      style={({ pressed }) => [styles.row, { borderTopColor: c.rule }, pressed && { backgroundColor: c.surface }]}
    >
      <View style={[styles.check, row.checked ? { backgroundColor: c.ink } : { borderColor: c.ink2 }]}>
        {row.checked ? <SymbolView name="checkmark" size={13} weight="bold" tintColor={c.onInk} /> : null}
      </View>
      <View style={styles.grow}>
        <Body style={done}>{row.name}</Body>
        {row.detail ? (
          <View style={styles.why}>
            {row.used ? <StrandGlyph color={c.strand} /> : null}
            <Caption muted style={styles.grow}>{row.detail}</Caption>
          </View>
        ) : null}
        {row.ratio !== null ? <Gauge ratio={row.ratio} /> : null}
      </View>
      {row.qty ? <Mono style={[styles.qty, done]}>{row.qty}</Mono> : null}
    </Pressable>
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
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  grow: { flex: 1, minWidth: 0 },
  why: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: 2 },
  gauge: { flexDirection: 'row', width: 120, height: 6, gap: 2, borderRadius: 3, overflow: 'hidden', marginTop: space.sm },
  qty: { fontSize: 13, lineHeight: 22, letterSpacing: -0.26, textAlign: 'right', maxWidth: '45%' },
});
