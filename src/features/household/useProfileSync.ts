import { useEffect } from 'react';
import { Alert, AppState } from 'react-native';

import { fill, pick } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { getState } from '@/lib/store';

import { ALLERGEN_LABELS, DIET_LABELS, EQUIPMENT_LABELS } from './labels';
import { pullProfile, type Merge } from './profileSync';
import { applyHousehold } from './save';
import { SETTINGS_COPY } from './settingsCopy';

function announce({ profile, added, removed }: Merge) {
  const copy = pick(SETTINGS_COPY);
  const equipmentLabels = pick(EQUIPMENT_LABELS);
  const gained = [...added.allergens.map((a) => pick(ALLERGEN_LABELS)[a]), ...added.diets.map((d) => pick(DIET_LABELS)[d])];
  const remoteEquipment = [...profile.equipment.filter((item) => !removed.equipment.includes(item)), ...added.equipment];
  const equipmentDiffers = added.equipment.length + removed.equipment.length > 0;
  if (gained.length === 0 && !equipmentDiffers) return;
  const lines = [
    ...(gained.length > 0 ? [fill(copy.syncAdded, { list: gained.join(', ') })] : []),
    ...(equipmentDiffers ? [fill(copy.syncEquipment, { list: remoteEquipment.map((item) => equipmentLabels[item]).join(', ') })] : []),
  ];
  const useTheirs = () => {
    const { household } = getState();
    if (household) applyHousehold({ ...household, equipment: remoteEquipment }).catch(report);
  };
  Alert.alert(
    copy.syncTitle,
    lines.join('\n\n'),
    equipmentDiffers ? [{ text: copy.keepMine, style: 'cancel' }, { text: copy.useTheirs, onPress: useTheirs }] : undefined,
  );
}

export function useProfileSync(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const pull = () => pullProfile().then((merge) => merge && announce(merge)).catch(report);
    pull();
    const subscription = AppState.addEventListener('change', (state) => state === 'active' && pull());
    return () => subscription.remove();
  }, [enabled]);
}
