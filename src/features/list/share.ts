import { Alert, Share } from 'react-native';

import { fill, pick } from '@/lib/i18n';
import { report } from '@/lib/monitoring';

import { accountAvailable, appleCancelled, createInvite, signedIn, signInWithApple } from '../household/account';
import { LIST_COPY } from './copy';

function failed(error: unknown) {
  if (appleCancelled(error)) return;
  report(error);
  Alert.alert(pick(LIST_COPY).shareError);
}

export async function shareList() {
  const copy = pick(LIST_COPY);
  if (!accountAvailable) return Alert.alert(copy.needAccount, copy.needAccountBody);
  if (!(await signedIn())) {
    return Alert.alert(copy.needAccount, copy.signInBody, [
      { text: copy.cancel, style: 'cancel' },
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
