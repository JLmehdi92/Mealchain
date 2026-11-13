import { Alert } from 'react-native';

import { getSetting, setSetting } from '@/lib/db/repo';
import { pick } from '@/lib/i18n';

import { importCopy } from './copy';

function confirm(): Promise<boolean> {
  const s = pick(importCopy);
  return new Promise((resolve) =>
    Alert.alert(s.consentTitle, s.consentBody, [
      { text: s.consentNo, style: 'cancel', onPress: () => resolve(false) },
      { text: s.consentYes, onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) }),
  );
}

export async function askConsent(): Promise<boolean> {
  if ((await getSetting('ai_consent')) === 'yes') return true;
  const granted = await confirm();
  if (granted) await setSetting('ai_consent', 'yes');
  return granted;
}
