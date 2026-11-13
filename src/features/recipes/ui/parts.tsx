import * as Haptics from 'expo-haptics';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type DimensionValue } from 'react-native';

import { Body, Caption, H2, Secondary } from '@/ui/Text';
import { radius, space, touch, type as typography, useTheme } from '@/ui/theme';

type Symbol = SymbolViewProps['name'];

export function Icon({ name, size = 22, color }: { name: Symbol; size?: number; color?: string }) {
  const c = useTheme();
  return <SymbolView name={name} size={size} tintColor={color ?? c.ink} accessible={false} />;
}

export function IconButton({ name, label, onPress }: { name: Symbol; label: string; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [styles.iconButton, { backgroundColor: c.sheet, borderColor: c.rule, opacity: pressed ? 0.7 : 1 }]}
    >
      <Icon name={name} />
    </Pressable>
  );
}

export function TextButton({ label, onPress, strong }: { label: string; onPress: () => void; strong?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={styles.textButton}>
      <Body style={strong ? styles.strong : undefined}>{label}</Body>
    </Pressable>
  );
}

export function NavBar({ left, center, right }: { left?: ReactNode; center?: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.nav}>
      <View style={styles.side}>{left}</View>
      {center}
      <View style={[styles.side, styles.end]}>{right}</View>
    </View>
  );
}

export function Tag({ label, kind }: { label: string; kind: 'review' | 'excluded' }) {
  const c = useTheme();
  const excluded = kind === 'excluded';
  return (
    <View style={[styles.tag, excluded ? { backgroundColor: c.chiliBg } : { backgroundColor: c.sheet, borderColor: c.ink2, borderWidth: 1 }]}>
      {excluded ? <Icon name="exclamationmark.triangle" size={12} color={c.chili} /> : null}
      <Caption style={{ color: excluded ? c.chili : c.ink, fontWeight: excluded ? '500' : '400' }}>{label}</Caption>
    </View>
  );
}

export function Banner({ icon, children }: { icon: Symbol; children: ReactNode }) {
  const c = useTheme();
  return (
    <View style={[styles.banner, { backgroundColor: c.sheet, borderColor: c.rule }]}>
      <Icon name={icon} size={20} />
      <Secondary style={styles.grow}>{children}</Secondary>
    </View>
  );
}

export function SearchField({ label, value, onChange }: { label: string; value: string; onChange: (text: string) => void }) {
  const c = useTheme();
  return (
    <View style={[styles.search, { backgroundColor: c.surface }]}>
      <Icon name="magnifyingglass" size={18} color={c.ink2} />
      <TextInput
        accessibilityLabel={label}
        placeholder={label}
        placeholderTextColor={c.ink2}
        value={value}
        onChangeText={onChange}
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={[typography.body, styles.searchInput, { color: c.ink }]}
      />
    </View>
  );
}

export function Skeleton({ width, height = 14 }: { width: DimensionValue; height?: number }) {
  const c = useTheme();
  return <View style={{ width, height, borderRadius: 8, backgroundColor: c.surface }} />;
}

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
  iconButton: {
    width: touch.min, height: touch.min, borderRadius: touch.min / 2, alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  textButton: { minHeight: touch.min, justifyContent: 'center', paddingHorizontal: space.sm },
  strong: { fontWeight: '600' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: touch.min, paddingHorizontal: space.lg },
  side: { flexDirection: 'row', gap: space.sm, minWidth: touch.min },
  end: { justifyContent: 'flex-end' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: 6 },
  banner: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'flex-start' },
  grow: { flex: 1 },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: touch.min, paddingHorizontal: space.md, borderRadius: radius.control },
  searchInput: { flex: 1, paddingVertical: space.sm },
  empty: { alignItems: 'center', gap: space.md, paddingTop: 64, paddingHorizontal: space.xxl },
  center: { textAlign: 'center', maxWidth: 300 },
});
