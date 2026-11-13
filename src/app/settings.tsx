import Constants from 'expo-constants';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { deleteRemoteAccount } from '@/features/household/account';
import { Chevron } from '@/features/household/Chevron';
import { SectionLabel, ToggleRow } from '@/features/household/controls';
import { plainHeader } from '@/features/household/header';
import { HouseholdSection } from '@/features/household/HouseholdSection';
import { SETTINGS_COPY } from '@/features/household/settingsCopy';
import { SharingSection } from '@/features/household/SharingSection';
import { wipeAll } from '@/features/household/wipe';
import { SubscriptionSection } from '@/features/subscription/SubscriptionSection';
import { getSetting, setSetting } from '@/lib/db/repo';
import { fill, pick, t } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { Button } from '@/ui/Button';
import { Group } from '@/ui/Card';
import { Row } from '@/ui/Row';
import { Screen } from '@/ui/Screen';
import { Caption } from '@/ui/Text';
import { useTheme } from '@/ui/theme';

function PrivacySection() {
  const copy = pick(SETTINGS_COPY);
  const [ask, setAsk] = useState(true);
  useEffect(() => {
    getSetting('ai_consent')
      .then((value) => setAsk(value !== 'yes'))
      .catch(report);
  }, []);
  const change = (value: boolean) => {
    setAsk(value);
    setSetting('ai_consent', value ? 'ask' : 'yes').catch(report);
  };
  return (
    <>
      <SectionLabel>{copy.privacy}</SectionLabel>
      <Group>
        <ToggleRow label={copy.askAi} detail={copy.askAiDetail} value={ask} onChange={change} />
        <Row label={copy.terms} trailing={<Chevron />} onPress={() => router.push('/legal/terms')} />
        <Row label={copy.privacyPolicy} trailing={<Chevron />} onPress={() => router.push('/legal/privacy')} />
        <Row label={copy.allergyNotice} trailing={<Chevron />} onPress={() => router.push('/legal/allergies')} />
      </Group>
    </>
  );
}

function confirmDelete() {
  const copy = pick(SETTINGS_COPY);
  const erase = async () => {
    try {
      await deleteRemoteAccount();
      wipeAll();
    } catch (error) {
      report(error);
      Alert.alert(copy.deleteError);
    }
  };
  Alert.alert(copy.deleteTitle, copy.deleteBody, [
    { text: copy.cancel, style: 'cancel' },
    { text: copy.delete, style: 'destructive', onPress: erase },
  ]);
}

export default function Settings() {
  const c = useTheme();
  const copy = pick(SETTINGS_COPY);
  return (
    <>
      <Stack.Screen options={plainHeader(c)} />
      <Screen title={t('settings.title')}>
        <HouseholdSection />
        <SharingSection />
        <SubscriptionSection />
        <PrivacySection />
        <Button kind="danger" label={copy.delete} onPress={confirmDelete} />
        <Caption muted>{copy.deleteNote}</Caption>
        <Caption muted>{fill(copy.version, { version: Constants.expoConfig?.version ?? '' })}</Caption>
      </Screen>
    </>
  );
}
