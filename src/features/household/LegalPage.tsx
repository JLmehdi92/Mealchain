import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { pick, t } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { Body, Caption, H2 } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

import { plainHeader } from './header';

export type LegalText = { title: string; updated: string; sections: [string, string][] };
type Bilingual = { en: LegalText; fr: LegalText };
const CONTACT = 'hello@demidemi.app';

function LegalBody({ text, footer }: { text: Bilingual; footer?: ReactNode }) {
  const { title, updated, sections } = pick(text);
  return (
    <Screen title={title} subtitle={updated} footer={footer}>
      {sections.map(([heading, body]) => (
        <View key={heading} style={styles.section}>
          <H2>{heading}</H2>
          <Body>{body}</Body>
        </View>
      ))}
      <Caption muted>{CONTACT}</Caption>
    </Screen>
  );
}

export function LegalPage({ text }: { text: Bilingual }) {
  const c = useTheme();
  return (
    <>
      <Stack.Screen options={plainHeader(c)} />
      <LegalBody text={text} />
    </>
  );
}

export function LegalSheet({ text, onClose }: { text: Bilingual | null; onClose: () => void }) {
  return (
    <Modal visible={!!text} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {text ? <LegalBody text={text} footer={<Button kind="secondary" label={t('common.close')} onPress={onClose} />} /> : null}
    </Modal>
  );
}

const styles = StyleSheet.create({ section: { gap: space.sm, marginTop: space.md } });
