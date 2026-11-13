import { router } from 'expo-router';

import { setDraft, useDraft } from '@/features/household/draft';
import { AllergiesForm } from '@/features/household/forms';
import { t } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';

export default function AllergiesStep() {
  const draft = useDraft();
  return (
    <Screen
      title={t('allergies.title')}
      subtitle={t('allergies.subtitle')}
      footer={<Button testID="allergies-next" label={t('common.next')} onPress={() => router.push('/diets')} />}
    >
      <AllergiesForm value={draft} onChange={setDraft} />
    </Screen>
  );
}
