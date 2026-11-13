import { Alert } from 'react-native';

import { pick } from '@/lib/i18n';
import { report } from '@/lib/monitoring';

import { PAYWALL_COPY } from './copy';
import { purchasesEnabled, restore } from './purchase';

export async function restoreWithFeedback(): Promise<boolean> {
  const copy = pick(PAYWALL_COPY);
  if (!purchasesEnabled) {
    Alert.alert(copy.unavailable);
    return false;
  }
  try {
    const restored = await restore();
    Alert.alert(restored ? copy.restored : copy.nothingToRestore);
    return restored;
  } catch (error) {
    report(error);
    Alert.alert(copy.restoreError);
    return false;
  }
}
