import { StyleSheet, View } from 'react-native';

import { remoteAvailable } from '@/lib/importApi';
import { pick, t } from '@/lib/i18n';
import { Icon, type IconName } from '@/ui/Icon';
import { IconButton } from '@/ui/IconButton';
import { Press } from '@/ui/Press';
import { Body, Caption, H2 } from '@/ui/Text';
import { radius, space, useTheme } from '@/ui/theme';

import { importCopy } from '../copy';

type Props = { onLink: () => void; onText: () => void; onShot: () => void; onClose: () => void };

type OptionProps = { icon: IconName; label: string; hint: string; onPress: () => void; testID: string };

function Option({ icon, label, hint, onPress, testID }: OptionProps) {
  const c = useTheme();
  return (
    <Press testID={testID} accessibilityRole="button" accessibilityHint={hint} onPress={onPress} style={[styles.option, { backgroundColor: c.paper }]}>
      <View style={[styles.optionIcon, { backgroundColor: c.surface }]}>
        <Icon name={icon} />
      </View>
      <View style={styles.grow}>
        <Body>{label}</Body>
        <Caption muted>{hint}</Caption>
      </View>
      <Icon name="chevron.right" size={16} muted />
    </Press>
  );
}

export function ChooseSource({ onLink, onText, onShot, onClose }: Props) {
  const s = pick(importCopy);
  return (
    <View style={styles.sheet}>
      <View style={styles.head}>
        <H2>{s.title}</H2>
        <IconButton testID="import-close" name="xmark" label={t('common.close')} onPress={onClose} />
      </View>
      <Option testID="import-link" icon="link" label={s.link} hint={s.linkHint} onPress={onLink} />
      <Option testID="import-text" icon="doc.text" label={s.text} hint={s.textHint} onPress={onText} />
      <Option testID="import-screenshot" icon="camera" label={s.shot} hint={s.shotHint} onPress={onShot} />
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
