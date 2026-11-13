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
  return (await getSetting('ai_consent')) === 'yes' || confirm();
}

export const rememberConsent = () => setSetting('ai_consent', 'yes');
