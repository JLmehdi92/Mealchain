import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { setDraft, useDraft } from '@/features/household/draft';
import { HouseholdForm } from '@/features/household/forms';
import { t } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { space } from '@/ui/theme';

export default function HouseholdStep() {
  const draft = useDraft();
  return (
    <Screen
      staged
      title={t('household.title')}
      subtitle={t('household.subtitle')}
      footer={<Button testID="household-next" label={t('common.next')} onPress={() => router.push('/allergies')} />}
    >
      <HouseholdForm value={draft} onChange={setDraft} />
      <View style={styles.footerClearance} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  footerClearance: { height: space.xxxl * 2 },
});
