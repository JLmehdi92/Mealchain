import { Alert, Share } from 'react-native';

import { fill, pick, t } from '@/lib/i18n';

import { accountAvailable, createInvite, signedIn, signInWithApple } from '../household/account';
import { signInFailed } from '../household/signInError';
import { LIST_COPY } from './copy';

const failed = (error: unknown) => signInFailed(error, pick(LIST_COPY).shareError);

export async function shareList() {
  const copy = pick(LIST_COPY);
  if (!accountAvailable) return Alert.alert(copy.needAccount, copy.needAccountBody);
  if (!(await signedIn())) {
    return Alert.alert(copy.needAccount, copy.signInBody, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: copy.signIn, onPress: () => signInWithApple().then(shareList).catch(failed) },
    ]);
  }
  try {
    const code = await createInvite();
    await Share.share({ message: fill(copy.invite, { code }) });
  } catch (error) {
    failed(error);
  }
}
