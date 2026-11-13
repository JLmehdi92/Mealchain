import { StyleSheet, Text, View } from 'react-native';

import { ALLERGEN_LABELS } from '@/features/household/labels';
import type { Allergen } from '@/features/ingredients/schema';
import { fill, language, pick } from '@/lib/i18n';
import { Body, Caption } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

import { detailCopy } from '../copy';
import { formatQty } from '../format';
import { lineAllergens } from '../meta';
import type { RecipeIngredient } from '../types';
import { ingredientLabel } from './ingredientLabel';

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

function allergenText(line: RecipeIngredient) {
  const s = pick(detailCopy);
  const names = (list: Allergen[]) => list.map((a) => pick(ALLERGEN_LABELS)[a].toLocaleLowerCase()).join(', ');
  const { contains, mayContain } = lineAllergens(line);
  const parts = [...(contains.length > 0 ? [names(contains)] : []), ...(mayContain.length > 0 ? [`${s.mayContain} ${names(mayContain)}`] : [])];
  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
}

type Props = { lines: RecipeIngredient[]; servings: number | null; people: number };

export function IngredientList({ lines, servings, people }: Props) {
  const c = useTheme();
  const s = pick(detailCopy);
  const scaledFrom = servings && servings !== people ? servings : null;
  const scaled = (line: RecipeIngredient) => (scaledFrom && line.qty !== null ? formatQty((line.qty * people) / scaledFrom, line.unit, language()) : null);
  return (
    <View>
      {scaledFrom ? (
        <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Caption muted style={styles.grow}>{fill(s.asWritten, { servings: scaledFrom })}</Caption>
          <Caption muted>{fill(s.forYou, { people })}</Caption>
        </View>
      ) : null}
      {lines.map((line, i) => {
        const qty = scaled(line);
        return (
          <View key={i} accessible accessibilityLabel={scaledFrom ? ingredientLabel(line.raw + allergenText(line), qty, s, scaledFrom, people) : undefined} style={[styles.row, styles.rule, { borderTopColor: c.rule }]}>
            <Body style={styles.grow}>
              {line.raw}
              <Allergens line={line} />
            </Body>
            {qty !== null ? <Body muted>{qty}</Body> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md, paddingVertical: 10 },
  rule: { borderTopWidth: StyleSheet.hairlineWidth },
  grow: { flex: 1 },
  bold: { fontWeight: '600' },
});
