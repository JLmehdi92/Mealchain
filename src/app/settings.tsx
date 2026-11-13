import Constants from 'expo-constants';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { deleteAccount } from '@/features/household/account';
import { ToggleRow } from '@/features/household/controls';
import { plainHeader } from '@/features/household/header';
import { HouseholdSection } from '@/features/household/HouseholdSection';
import { SETTINGS_COPY } from '@/features/household/settingsCopy';
import { SharingSection } from '@/features/household/SharingSection';
import { loadSamples } from '@/features/recipes/loadSamples';
import { SubscriptionSection } from '@/features/subscription/SubscriptionSection';
import { useIsPro } from '@/features/subscription/useIsPro';
import { getSetting, setSetting } from '@/lib/db/repo';
import { fill, language, pick, t } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { Button } from '@/ui/Button';
import { Group } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Row } from '@/ui/Row';
import { Screen } from '@/ui/Screen';
import { SectionLabel } from '@/ui/SectionLabel';
import { Caption } from '@/ui/Text';
import { useTheme } from '@/ui/theme';

function SamplesSection() {
  const copy = pick(SETTINGS_COPY);
  const pro = useIsPro();
  const load = async () => {
    try {
      const result = await loadSamples(language(), Date.now(), pro);
      if (result === 'paywall') return router.push('/paywall');
      Alert.alert(result.added > 0 ? fill(copy.samplesAdded, { count: result.added }) : copy.samplesPresent);
    } catch (error) {
      report(error);
      Alert.alert(copy.error);
    }
  };
  return (
    <>
      <SectionLabel>{copy.recipes}</SectionLabel>
      <Group>
        <Row testID="load-samples" label={copy.loadSamples} detail={copy.loadSamplesDetail} onPress={load} />
      </Group>
    </>
  );
}

function PrivacySection() {
  const copy = pick(SETTINGS_COPY);
  const [ask, setAsk] = useState(true);
  useEffect(() => {
    getSetting('ai_consent')
      .then((value) => setAsk(value !== 'yes'))
      .catch(report);
  }, []);
  const chevron = <Icon name="chevron.right" size={14} muted />;
  const change = (value: boolean) => {
    setAsk(value);
    setSetting('ai_consent', value ? 'ask' : 'yes').catch(report);
  };
  return (
    <>
      <SectionLabel>{copy.privacy}</SectionLabel>
      <Group>
        <ToggleRow label={copy.askAi} detail={copy.askAiDetail} value={ask} onChange={change} />
        <Row label={copy.terms} trailing={chevron} onPress={() => router.push('/legal/terms')} />
        <Row testID="privacy-policy" label={copy.privacyPolicy} trailing={chevron} onPress={() => router.push('/legal/privacy')} />
        <Row testID="allergy-notice" label={copy.allergyNotice} trailing={chevron} onPress={() => router.push('/legal/allergies')} />
      </Group>
    </>
  );
}

function confirmDelete() {
  const copy = pick(SETTINGS_COPY);
  const erase = async () => {
    try {
      await deleteAccount();
    } catch (error) {
      report(error);
      Alert.alert(copy.deleteError);
    }
  };
  Alert.alert(copy.deleteTitle, copy.deleteBody, [
    { text: t('common.cancel'), style: 'cancel' },
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
        <SamplesSection />
        <SubscriptionSection />
        <PrivacySection />
        <Button kind="danger" label={copy.delete} onPress={confirmDelete} />
        <Caption muted>{copy.deleteNote}</Caption>
        <Caption muted>{fill(copy.version, { version: Constants.expoConfig?.version ?? '' })}</Caption>
      </Screen>
    </>
  );
}
