import { NativeTabs } from 'expo-router/native-tabs';

import { t } from '@/lib/i18n';
import { useTheme } from '@/ui/theme';

export default function TabsLayout() {
  const c = useTheme();
  return (
    <NativeTabs tintColor={c.ink}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="calendar" />
        <NativeTabs.Trigger.Label>{t('tabs.week')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="recipes">
        <NativeTabs.Trigger.Icon sf="book" />
        <NativeTabs.Trigger.Label>{t('tabs.recipes')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="list">
        <NativeTabs.Trigger.Icon sf="checklist" />
        <NativeTabs.Trigger.Label>{t('tabs.list')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
