import { useState } from 'react';
import { Alert } from 'react-native';

import { fill, pick } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { useHousehold } from '@/lib/store';
import { Group } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Row } from '@/ui/Row';
import { SectionLabel } from '@/ui/SectionLabel';

import type { Household } from '../recipes/types';
import { saveEverywhere } from './account';
import { EditSheet } from './EditSheet';
import { AllergiesForm, DietsForm, HouseholdForm } from './forms';
import { ALLERGEN_LABELS, DIET_LABELS, EQUIPMENT_LABELS } from './labels';
import { SETTINGS_COPY } from './settingsCopy';

type Editing = 'people' | 'allergies' | 'diets' | null;

function HouseholdRows({ household, onEdit }: { household: Household; onEdit: (which: Editing) => void }) {
  const copy = pick(SETTINGS_COPY);
  const join = (items: string[]) => (items.length ? items.join(', ') : copy.none);
  const allergenLabels = pick(ALLERGEN_LABELS);
  const dietLabels = pick(DIET_LABELS);
  const chevron = <Icon name="chevron.right" size={14} muted />;
  return (
    <Group>
      <Row
        label={copy.peopleMeals}
        detail={fill(copy.peopleDetail, { people: household.people, dinners: household.dinners })}
        trailing={chevron}
        onPress={() => onEdit('people')}
      />
      <Row label={copy.allergies} detail={join(household.allergens.map((a) => allergenLabels[a]))} trailing={chevron} onPress={() => onEdit('allergies')} />
      <Row label={copy.dietsEquipment} detail={join([...household.diets.map((d) => dietLabels[d]), ...household.equipment.map((e) => pick(EQUIPMENT_LABELS)[e])])} trailing={chevron} onPress={() => onEdit('diets')} />
    </Group>
  );
}

export function HouseholdSection() {
  const household = useHousehold();
  const copy = pick(SETTINGS_COPY);
  const [editing, setEditing] = useState<Editing>(null);
  const [draft, setDraft] = useState<Household | null>(null);
  if (!household) return null;

  const open = (which: Editing) => {
    setDraft(household);
    setEditing(which);
  };
  const save = async () => {
    if (!draft) return;
    try {
      await saveEverywhere(draft);
      setEditing(null);
    } catch (error) {
      report(error);
      Alert.alert(copy.error);
    }
  };
  const change = (patch: Partial<Household>) => setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  const titles = { people: copy.peopleMeals, allergies: copy.allergies, diets: copy.dietsEquipment };

  return (
    <>
      <SectionLabel>{copy.household}</SectionLabel>
      <HouseholdRows household={household} onEdit={open} />
      <EditSheet title={editing ? titles[editing] : ''} visible={!!editing && !!draft} onCancel={() => setEditing(null)} onSave={save}>
        {draft && editing === 'people' ? <HouseholdForm value={draft} onChange={change} /> : null}
        {draft && editing === 'allergies' ? <AllergiesForm value={draft} onChange={change} /> : null}
        {draft && editing === 'diets' ? <DietsForm value={draft} onChange={change} /> : null}
      </EditSheet>
    </>
  );
}
