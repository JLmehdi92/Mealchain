import type { ReactNode } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';

import { pick } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { H2 } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

import { SETTINGS_COPY } from './settingsCopy';

type Props = { title: string; visible: boolean; onCancel: () => void; onSave: () => void; saveLabel?: string; children: ReactNode };

export function EditSheet({ title, visible, onCancel, onSave, saveLabel, children }: Props) {
  const c = useTheme();
  const copy = pick(SETTINGS_COPY);
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCancel}>
      <View style={[styles.fill, { backgroundColor: c.paper }]}>
        <View style={styles.bar}>
          <Button kind="quiet" label={copy.cancel} onPress={onCancel} />
          <H2 style={styles.title} numberOfLines={1}>{title}</H2>
          <Button kind="quiet" label={saveLabel ?? copy.save} onPress={onSave} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.sm, paddingTop: space.sm },
  title: { flex: 1, textAlign: 'center', fontSize: 17 },
  content: { paddingHorizontal: space.xl, paddingBottom: space.xxxl * 2, gap: space.md },
});
