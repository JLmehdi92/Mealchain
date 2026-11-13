import type { SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, IconButton } from '@/features/recipes/ui/parts';
import { remoteAvailable } from '@/lib/importApi';
import { pick } from '@/lib/i18n';
import { Body, Caption, H2 } from '@/ui/Text';
import { radius, space, useTheme } from '@/ui/theme';

import { importCopy } from '../copy';

type Props = { onLink: () => void; onText: () => void; onShot: () => void; onClose: () => void };

function Option({ icon, label, hint, onPress }: { icon: SymbolViewProps['name']; label: string; hint: string; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={hint}
      onPress={onPress}
      style={({ pressed }) => [styles.option, { backgroundColor: pressed ? c.surface : c.paper }]}
    >
      <View style={[styles.optionIcon, { backgroundColor: c.surface }]}>
        <Icon name={icon} />
      </View>
      <View style={styles.grow}>
        <Body>{label}</Body>
        <Caption muted>{hint}</Caption>
      </View>
      <Icon name="chevron.right" size={16} color={c.ink2} />
    </Pressable>
  );
}

export function ChooseSource({ onLink, onText, onShot, onClose }: Props) {
  const s = pick(importCopy);
  return (
    <View style={styles.sheet}>
      <View style={styles.head}>
        <H2>{s.title}</H2>
        <IconButton name="xmark" label={s.close} onPress={onClose} />
      </View>
      <Option icon="link" label={s.link} hint={s.linkHint} onPress={onLink} />
      <Option icon="doc.text" label={s.text} hint={s.textHint} onPress={onText} />
      <Option icon="camera" label={s.shot} hint={s.shotHint} onPress={onShot} />
      {remoteAvailable() ? <Caption muted style={styles.note}>{s.aiNote}</Caption> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { padding: space.xl, gap: space.sm },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.card },
  optionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1 },
  note: { marginTop: space.sm },
});
