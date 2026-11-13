import { Alert } from 'react-native';

import { report } from '@/lib/monitoring';

import { appleCancelled } from './account';

export function signInFailed(error: unknown, message: string) {
  if (appleCancelled(error)) return;
  report(error);
  Alert.alert(message);
}
