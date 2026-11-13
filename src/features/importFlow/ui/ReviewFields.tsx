import { StyleSheet, TextInput, View } from 'react-native';

import type { Recipe } from '@/features/recipes/types';
import { pick } from '@/lib/i18n';
import { Caption } from '@/ui/Text';
import { space, type as typography, useTheme } from '@/ui/theme';

import { reviewCopy } from '../copy';
import { parseCount } from '../review';

type FieldProps = { label: string; note?: string; value: string; placeholder: string; flagged: boolean; numeric?: boolean; onChange: (text: string) => void };

function Field({ label, note, value, placeholder, flagged, numeric, onChange }: FieldProps) {
  const c = useTheme();
  const outline = flagged ? { borderStyle: 'dashed' as const, borderWidth: 1.5, borderColor: c.ink2 } : { borderWidth: StyleSheet.hairlineWidth, borderColor: c.rule };
  return (
    <View style={styles.grow}>
      <View style={styles.label}>
        <Caption muted>{label}</Caption>
        {note ? <Caption muted>{note}</Caption> : null}
      </View>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={note}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.ink2}
        keyboardType={numeric ? 'number-pad' : 'default'}
        style={[typography.body, styles.input, outline, { color: c.ink, backgroundColor: c.sheet }]}
      />
    </View>
  );
}

export type Texts = { title: string; servings: string; minutes: string };
type Props = { draft: Recipe; texts: Texts; onChange: (texts: Texts, patch: Partial<Recipe>) => void };

export function ReviewFields({ draft, texts, onChange }: Props) {
  const s = pick(reviewCopy);
  return (
    <>
      <Field
        label={s.name}
        value={texts.title}
        placeholder={s.namePlaceholder}
        flagged={draft.title.trim() === ''}
        onChange={(title) => onChange({ ...texts, title }, { title })}
      />
      <View style={styles.pair}>
        <Field
          label={s.serves}
          note={draft.servings === null ? s.missing : undefined}
          value={texts.servings}
          placeholder={s.addServes}
          flagged={draft.servings === null}
          numeric
          onChange={(servings) => onChange({ ...texts, servings }, { servings: parseCount(servings, 100) })}
        />
        <Field
          label={`${s.time} (${s.minutes.toLowerCase()})`}
          note={draft.totalMinutes === null ? s.missing : undefined}
          value={texts.minutes}
          placeholder={s.addTime}
          flagged={draft.totalMinutes === null}
          numeric
          onChange={(minutes) => onChange({ ...texts, minutes }, { totalMinutes: parseCount(minutes, 10_080) })}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  grow: { flex: 1 },
  label: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.lg, marginBottom: 6 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: space.md, minHeight: 48 },
  pair: { flexDirection: 'row', gap: space.md },
});
