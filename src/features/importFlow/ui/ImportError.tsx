import { ScrollView, StyleSheet, View } from 'react-native';

import { PageScene } from '@/features/recipes/ui/illustrations';
import { TextButton } from '@/features/recipes/ui/parts';
import { pick, t } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { Empty } from '@/ui/Empty';
import { Icon } from '@/ui/Icon';
import { NavBar } from '@/ui/NavBar';
import { space, useTheme } from '@/ui/theme';

import { errorCopy } from '../copy';
import type { ImportFailure } from '../importRecipe';

type Action = { label: string; onPress: () => void };
type Content = { title: string; body: string; primary: Action; quiet?: Action };
type Props = {
  error: ImportFailure;
  fromLink: boolean;
  onClose: () => void;
  onText: () => void;
  onLink: () => void;
  onRetry: () => void;
  onSignIn: () => void;
};

function content({ error, fromLink, onClose, onText, onLink, onRetry, onSignIn }: Props): Content {
  const s = pick(errorCopy);
  if (error === 'daily_limit') return { title: s.limit, body: s.limitBody, primary: { label: s.ok, onPress: onClose } };
  if (error === 'sign_in') {
    return { title: s.signInTitle, body: s.signInBody, primary: { label: s.signInApple, onPress: onSignIn }, quiet: { label: s.editText, onPress: onText } };
  }
  if (error === 'unreachable') {
    return { title: s.unreachable, body: s.unreachableBody, primary: { label: s.pasteText, onPress: onText }, quiet: { label: s.tryAgain, onPress: onRetry } };
  }
  return fromLink
    ? { title: s.noRecipePage, body: s.noRecipePageBody, primary: { label: s.pasteText, onPress: onText }, quiet: { label: s.otherLink, onPress: onLink } }
    : { title: s.noRecipeText, body: s.noRecipeTextBody, primary: { label: s.editText, onPress: onText } };
}

export function ImportError(props: Props) {
  const c = useTheme();
  const { title, body, primary, quiet } = content(props);
  const art = props.error === 'daily_limit' ? <Icon name="clock" size={44} color={c.ink2} /> : <PageScene />;
  return (
    <View style={styles.fill}>
      <NavBar left={<TextButton label={t('common.close')} onPress={props.onClose} />} />
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
