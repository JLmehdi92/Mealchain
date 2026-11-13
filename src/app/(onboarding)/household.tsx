import { router } from 'expo-router';

import { setDraft, useDraft } from '@/features/household/draft';
import { HouseholdForm } from '@/features/household/forms';
import { t } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';

export default function HouseholdStep() {
  const draft = useDraft();
  return (
    <Screen
      title={t('household.title')}
      subtitle={t('household.subtitle')}
      footer={<Button label={t('common.next')} onPress={() => router.push('/allergies')} />}
    >
      <HouseholdForm value={draft} onChange={setDraft} />
    </Screen>
  );
}
