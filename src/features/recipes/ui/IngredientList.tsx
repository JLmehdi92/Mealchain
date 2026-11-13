import { StyleSheet, Text, View } from 'react-native';

import { ALLERGEN_LABELS } from '@/features/household/labels';
import type { Allergen } from '@/features/ingredients/schema';
import { language, pick } from '@/lib/i18n';
import { Body } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

import { detailCopy } from '../copy';
import { formatQty } from '../format';
import { lineAllergens } from '../meta';
import type { RecipeIngredient } from '../types';

function Allergens({ line }: { line: RecipeIngredient }) {
  const s = pick(detailCopy);
  const label = (allergen: Allergen) => pick(ALLERGEN_LABELS)[allergen].toLocaleLowerCase();
  const { contains, mayContain } = lineAllergens(line);
  if (contains.length === 0 && mayContain.length === 0) return null;
  const parts = [
    ...contains.map((a) => <Text key={a} style={styles.bold}>{label(a)}</Text>),
    ...(mayContain.length > 0 ? [<Text key="may">{`${s.mayContain} `}<Text style={styles.bold}>{mayContain.map(label).join(', ')}</Text></Text>] : []),
  ];
  return (
    <Text>
      {' ('}
      {parts.flatMap((part, i) => (i === 0 ? [part] : [<Text key={`sep${i}`}>, </Text>, part]))}
      {')'}
    </Text>
  );
}

export function IngredientList({ lines, factor }: { lines: RecipeIngredient[]; factor: number }) {
  const c = useTheme();
  return (
    <View>
      {lines.map((line, i) => (
        <View key={i} style={[styles.row, { borderTopColor: c.rule }]}>
          <Body style={styles.grow}>
            {line.raw}
            <Allergens line={line} />
          </Body>
          {factor !== 1 && line.qty !== null ? <Body muted>{formatQty(line.qty * factor, line.unit, language())}</Body> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  grow: { flex: 1 },
  bold: { fontWeight: '600' },
});
