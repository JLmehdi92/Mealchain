import { StyleSheet, Text, View } from 'react-native';

import { fill, pick, t } from '@/lib/i18n';
import { Group } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Caption } from '@/ui/Text';
import { space } from '@/ui/theme';

import { DIETS, type Market } from '../ingredients/schema';
import { EQUIPMENT, type Household } from '../recipes/types';
import { Banner, Segmented, SectionLabel, StepperRow, ToggleRow } from './controls';
import { ALLERGEN_LABELS, ALLERGEN_ORDER, COPY, DIET_LABELS, EQUIPMENT_LABELS } from './labels';

type FormProps = { value: Household; onChange: (patch: Partial<Household>) => void };
const PREP: (number | null)[] = [20, 30, 45, null];

const toggle = <T,>(list: readonly T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

export function HouseholdForm({ value, onChange }: FormProps) {
  return (
    <>
      <SectionLabel>{t('household.section')}</SectionLabel>
      <Group>
        <StepperRow label={t('household.people')} value={value.people} min={1} max={12} onChange={(people) => onChange({ people })} />
      </Group>
      <SectionLabel>{t('household.meals')}</SectionLabel>
      <Group>
        <StepperRow label={t('household.dinners')} value={value.dinners} min={0} max={7} onChange={(dinners) => onChange({ dinners })} />
        <StepperRow label={t('household.lunches')} value={value.lunches} min={0} max={7} onChange={(lunches) => onChange({ lunches })} />
      </Group>
      <SectionLabel>{t('household.maxPrep')}</SectionLabel>
      <Segmented
        options={PREP.map((m) => ({ value: m, label: fill(pick(COPY).minutes, { n: m ?? '60+' }) }))}
        value={PREP.includes(value.maxMinutes) ? value.maxMinutes : null}
        onChange={(maxMinutes) => onChange({ maxMinutes })}
      />
      <SectionLabel>{t('household.units')}</SectionLabel>
      <Segmented<Market>
        options={[{ value: 'fr', label: t('household.metric') }, { value: 'us', label: t('household.us') }]}
        value={value.market}
        onChange={(market) => onChange({ market })}
      />
    </>
  );
}

export function AllergiesForm({ value, onChange }: FormProps) {
  const labels = pick(ALLERGEN_LABELS);
  const copy = pick(COPY);
  return (
    <>
      <View style={styles.chips}>
        {ALLERGEN_ORDER.map((allergen) => (
          <Chip
            key={allergen}
            label={labels[allergen]}
            selected={value.allergens.includes(allergen)}
            onPress={() => onChange({ allergens: toggle(value.allergens, allergen) })}
          />
        ))}
      </View>
      <Banner icon="exclamationmark.triangle" tone="allergy">
        <Text style={styles.strong}>{copy.nuts}</Text> {copy.nutsBody}
      </Banner>
      <Caption muted>{t('allergies.disclaimer')}</Caption>
    </>
  );
}

export function DietsForm({ value, onChange }: FormProps) {
  const diets = pick(DIET_LABELS);
  const equipment = pick(EQUIPMENT_LABELS);
  return (
    <>
      <SectionLabel>{t('diets.section')}</SectionLabel>
      <View style={styles.chips}>
        {DIETS.map((diet) => (
          <Chip key={diet} label={diets[diet]} selected={value.diets.includes(diet)} onPress={() => onChange({ diets: toggle(value.diets, diet) })} />
        ))}
      </View>
      <SectionLabel>{t('diets.equipment')}</SectionLabel>
      <Group>
        {EQUIPMENT.map((item) => (
          <ToggleRow
            key={item}
            label={equipment[item]}
            value={value.equipment.includes(item)}
            onChange={() => onChange({ equipment: toggle(value.equipment, item) })}
          />
        ))}
      </Group>
    </>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  strong: { fontWeight: '600' },
});
