import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';

import { ingredientById } from '@/features/ingredients/catalog';
import { ALLERGEN_LABELS } from '@/features/household/labels';
import { labels } from '@/features/recipes/copy';
import { reviewCount } from '@/features/recipes/meta';
import type { Recipe, RecipeIngredient } from '@/features/recipes/types';
import { TextButton } from '@/features/recipes/ui/parts';
import { fill, language, pick, t } from '@/lib/i18n';
import { useHousehold } from '@/lib/store';
import { Banner } from '@/ui/Banner';
import { Button } from '@/ui/Button';
import { Group } from '@/ui/Card';
import { NavBar } from '@/ui/NavBar';
import { Press } from '@/ui/Press';
import { Tag } from '@/ui/Tag';
import { Body, Caption, Title } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

import { reviewCopy } from '../copy';
import { confirmAll, confirmIngredient, finalize, recipeAllergens, reviewList, uncheckedCount } from '../review';
import { IngredientPicker } from './IngredientPicker';
import { ReviewFields, type Texts } from './ReviewFields';

type Props = { initial: Recipe; onCancel: () => void; onSave: (recipe: Recipe) => Promise<void> };

function IngredientRow({ line, first, onPress }: { line: RecipeIngredient; first: boolean; onPress: () => void }) {
  const c = useTheme();
  const s = pick(reviewCopy);
  const name = line.ingredientId ? ingredientById.get(line.ingredientId)?.name[language()] : undefined;
  const detail = line.status === 'unmatched' || !name ? s.unmatched : line.status === 'needsReview' ? `→ ${name} · ${s.confirm}` : `→ ${name}`;
  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={`${line.raw}. ${detail}`}
      onPress={onPress}
      highlight={c.surface}
      style={[styles.row, !first && { borderTopColor: c.rule, borderTopWidth: StyleSheet.hairlineWidth }]}
    >
      <View style={styles.grow}>
        <Body>{line.raw}</Body>
        <Caption muted={line.status === 'matched'}>{detail}</Caption>
      </View>
      {line.status === 'matched' ? null : <Tag kind="review" label={s.check} />}
    </Press>
  );
}

const textsOf = (recipe: Recipe): Texts => ({ title: recipe.title, servings: String(recipe.servings ?? ''), minutes: String(recipe.totalMinutes ?? '') });

function ReviewIngredients({ draft, onPick, onConfirmAll }: { draft: Recipe; onPick: (index: number) => void; onConfirmAll: () => void }) {
  const s = pick(reviewCopy);
  const allergens = recipeAllergens(draft).map((a) => pick(ALLERGEN_LABELS)[a].toLocaleLowerCase());
  const unchecked = uncheckedCount(draft);
  const notes = [
    ...(allergens.length > 0 ? [fill(s.allergens, { list: allergens.join(', ') })] : unchecked > 0 ? [] : [s.noAllergens]),
    ...(unchecked === 0 ? [] : [unchecked === 1 ? s.oneNotChecked : fill(s.notChecked, { count: unchecked })]),
  ];
  return (
    <>
      <Caption muted style={styles.section}>{fill(s.ingredients, { count: draft.ingredients.length })}</Caption>
      <Group>
        {draft.ingredients.map((line, i) => (
          <IngredientRow key={i} line={line} first={i === 0} onPress={() => onPick(i)} />
        ))}
      </Group>
      {draft.ingredients.some((line) => line.status === 'needsReview' && line.ingredientId) ? (
        <Button testID="review-confirm-all" kind="secondary" label={s.confirmAll} onPress={onConfirmAll} />
      ) : null}
      <Caption muted>{notes.join(' ')}</Caption>
    </>
  );
}

export function Review({ initial, onCancel, onSave }: Props) {
  const c = useTheme();
  const s = pick(reviewCopy);
  const [draft, setDraft] = useState(initial);
  const [texts, setTexts] = useState<Texts>(() => textsOf(initial));
  const [picking, setPicking] = useState<number | null>(null);
  const [nameMissing, setNameMissing] = useState(false);
  const count = reviewCount(finalize(draft));
  const household = useHousehold();
  const clashes = recipeAllergens(draft).filter((a) => household?.allergens.includes(a)).map((a) => pick(ALLERGEN_LABELS)[a].toLocaleLowerCase());

  const save = () => (draft.title.trim() === '' ? setNameMissing(true) : onSave(finalize(draft)));

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.fill}>
      <NavBar
        left={<TextButton label={t('common.cancel')} onPress={onCancel} />}
        center={<Caption muted>{pick(labels).fromSource[draft.source]}</Caption>}
        right={<TextButton testID="review-save" label={t('common.save')} strong onPress={save} />}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Title>{s.title}</Title>
        {clashes.length > 0 ? <Banner icon="exclamationmark.triangle" tone="allergy">{fill(s.householdAllergy, { list: clashes.join(', ') })}</Banner> : null}
        {count > 0 ? (
          <Banner icon="info.circle">
            {fill(count === 1 ? s.oneToCheck : s.toCheck, {
              count,
              list: reviewList(finalize(draft), { title: s.name, servings: s.serves, totalMinutes: s.time, lines: (n) => (n === 1 ? s.oneLine : fill(s.lines, { count: n })) }),
            })}
          </Banner>
        ) : null}
        <ReviewFields draft={draft} texts={texts} onChange={(next, patch) => { setTexts(next); setDraft({ ...draft, ...patch }); setNameMissing(false); }} />
        {nameMissing ? <Caption style={{ color: c.chili }}>{s.nameRequired}</Caption> : null}
        <ReviewIngredients draft={draft} onPick={setPicking} onConfirmAll={() => setDraft(confirmAll(draft))} />
      </ScrollView>
      <IngredientPicker
        line={picking === null ? null : (draft.ingredients[picking] ?? null)}
        onClose={() => setPicking(null)}
        onPick={(id) => {
          if (picking !== null) setDraft(confirmIngredient(draft, picking, id));
          setPicking(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: space.xl, paddingBottom: space.xxxl * 2, gap: space.sm },
  section: { marginTop: space.lg },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, minHeight: 52, paddingVertical: 10, paddingHorizontal: space.lg },
  grow: { flex: 1, minWidth: 0 },
});
