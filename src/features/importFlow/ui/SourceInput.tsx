import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { TextButton } from '@/features/recipes/ui/parts';
import { isAllowedUrl } from '@/lib/importApi';
import { pick, t } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { NavBar } from '@/ui/NavBar';
import { Caption, Title } from '@/ui/Text';
import { radius, space, type as typography, useTheme } from '@/ui/theme';

import { importCopy } from '../copy';

type Props = { kind: 'link' | 'text'; value: string; onChange: (value: string) => void; onSubmit: () => void; onBack: () => void };

function SourceField({ link, value, onChange, onSubmit }: { link: boolean; value: string; onChange: (value: string) => void; onSubmit: () => void }) {
  const c = useTheme();
  const s = pick(importCopy);
  return (
    <TextInput
      accessibilityLabel={link ? s.link : s.text}
      autoFocus
      value={value}
      onChangeText={onChange}
      placeholder={link ? s.linkPlaceholder : s.textPlaceholder}
      placeholderTextColor={c.ink2}
      multiline={!link}
      autoCapitalize={link ? 'none' : 'sentences'}
      autoCorrect={!link}
      keyboardType={link ? 'url' : 'default'}
      textContentType={link ? 'URL' : 'none'}
      returnKeyType={link ? 'go' : 'default'}
      onSubmitEditing={link ? onSubmit : undefined}
      style={[typography.body, styles.input, !link && styles.multiline, { color: c.ink, backgroundColor: c.sheet, borderColor: c.rule }]}
    />
  );
}

export function SourceInput({ kind, value, onChange, onSubmit, onBack }: Props) {
  const c = useTheme();
  const s = pick(importCopy);
  const [invalid, setInvalid] = useState(false);
  const link = kind === 'link';
  const ready = link ? value.trim().length > 0 : value.trim().length >= 10;
  const submit = () => {
    const bad = link && !isAllowedUrl(value.trim());
    setInvalid(bad);
    if (!bad) onSubmit();
  };
  const paste = async () => onChange(await Clipboard.getStringAsync());

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.fill}>
      <NavBar left={<TextButton label={t('common.cancel')} onPress={onBack} />} right={<TextButton label={s.pasteClipboard} onPress={paste} />} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Title>{link ? s.link : s.text}</Title>
        <SourceField link={link} value={value} onChange={onChange} onSubmit={submit} />
        {invalid ? <Caption style={{ color: c.chili }}>{s.badLink}</Caption> : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button label={s.importAction} disabled={!ready} onPress={submit} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: space.xl, gap: space.md, paddingBottom: space.xl },
  input: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingVertical: space.md, minHeight: 48 },
  multiline: { minHeight: 220, textAlignVertical: 'top', borderRadius: radius.card },
  footer: { paddingHorizontal: space.xl, paddingBottom: space.xxxl, paddingTop: space.sm },
});
