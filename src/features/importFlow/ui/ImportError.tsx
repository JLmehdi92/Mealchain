import { ScrollView, StyleSheet, View } from 'react-native';

import { PageScene } from '@/features/recipes/ui/illustrations';
import { Empty, Icon, NavBar, TextButton } from '@/features/recipes/ui/parts';
import type { ImportError as ErrorKind } from '@/lib/importApi';
import { pick } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { space, useTheme } from '@/ui/theme';

import { errorCopy, importCopy } from '../copy';

type Action = { label: string; onPress: () => void };
type Props = { error: ErrorKind; fromLink: boolean; onClose: () => void; onText: () => void; onLink: () => void; onRetry: () => void };

function content({ error, fromLink, onClose, onText, onLink, onRetry }: Props) {
  const s = pick(errorCopy);
  if (error === 'daily_limit') return { title: s.limit, body: s.limitBody, primary: { label: s.ok, onPress: onClose } };
  if (error === 'unreachable') {
    return { title: s.unreachable, body: s.unreachableBody, primary: { label: s.tryAgain, onPress: onRetry }, quiet: { label: s.pasteText, onPress: onText } };
  }
  return fromLink
    ? { title: s.noRecipePage, body: s.noRecipePageBody, primary: { label: s.pasteText, onPress: onText }, quiet: { label: s.otherLink, onPress: onLink } }
    : { title: s.noRecipeText, body: s.noRecipeTextBody, primary: { label: s.editText, onPress: onText } };
}

export function ImportError(props: Props) {
  const c = useTheme();
  const { title, body, primary, quiet }: { title: string; body: string; primary: Action; quiet?: Action } = content(props);
  const art = props.error === 'daily_limit' ? <Icon name="clock" size={44} color={c.ink2} /> : <PageScene />;
  return (
    <View style={styles.fill}>
      <NavBar left={<TextButton label={pick(importCopy).close} onPress={props.onClose} />} />
      <ScrollView contentContainerStyle={styles.content}>
        <Empty art={art} title={title} body={body} />
      </ScrollView>
      <View style={styles.footer}>
        <Button label={primary.label} onPress={primary.onPress} />
        {quiet ? <Button kind="quiet" label={quiet.label} onPress={quiet.onPress} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingTop: space.xxxl },
  footer: { paddingHorizontal: space.xl, paddingBottom: space.xxxl, gap: space.sm },
});
