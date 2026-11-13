import { useState } from 'react';
import { Alert } from 'react-native';

import { saveEverywhere } from '@/features/household/account';
import { useDraft, setDraft } from '@/features/household/draft';
import { DietsForm } from '@/features/household/forms';
import { COPY } from '@/features/household/labels';
import { pick, t } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';

const ERROR = { en: "Couldn't save your household. Try again.", fr: "Impossible d'enregistrer le foyer. Réessayez." };

export default function DietsStep() {
  const draft = useDraft();
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await saveEverywhere(draft);
    } catch (error) {
      report(error);
      Alert.alert(pick(ERROR));
      setSaving(false);
    }
  };
  return (
    <Screen
      staged
      title={t('diets.title')}
      subtitle={t('diets.subtitle')}
      footer={<Button testID="diets-save" label={pick(COPY).save} disabled={saving} onPress={save} />}
    >
      <DietsForm value={draft} onChange={setDraft} />
    </Screen>
  );
}
