import * as Notifications from 'expo-notifications';

import { trialReminderAt } from '@/features/subscription/rules';

import { pick } from './i18n';

const COPY = {
  en: { title: 'Your trial ends in 2 days', body: 'Keep planning with Demidemi Pro, or cancel in Settings › Apple Account.' },
  fr: { title: 'Votre essai se termine dans 2 jours', body: 'Continuez avec Demidemi Pro, ou résiliez dans Réglages › Compte Apple.' },
};

export async function scheduleTrialReminder(trialEnd: Date, now = new Date()) {
  const date = trialReminderAt(trialEnd, now);
  if (!date) return;
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: pick(COPY),
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

export const cancelReminders = () => Notifications.cancelAllScheduledNotificationsAsync();
