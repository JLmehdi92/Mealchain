import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ingredientById } from '@/features/ingredients/catalog';
import { labels } from '@/features/recipes/copy';
import { reviewCount } from '@/features/recipes/meta';
import type { Recipe, RecipeIngredient } from '@/features/recipes/types';
import { Banner, NavBar, Tag, TextButton } from '@/features/recipes/ui/parts';
import { fill, language, pick } from '@/lib/i18n';
import { Body, Caption, Title } from '@/ui/Text';
import { radius, space, useTheme } from '@/ui/theme';

import { importCopy, reviewCopy } from '../copy';
import { confirmIngredient, finalize, recipeAllergens } from '../review';
import { IngredientPicker } from './IngredientPicker';
import { ReviewFields, type Texts } from './ReviewFields';

type Props = { initial: Recipe; onCancel: () => void; onSave: (recipe: Recipe) => Promise<void> };

function IngredientRow({ line, first, onPress }: { line: RecipeIngredient; first: boolean; onPress: () => void }) {
  const c = useTheme();
  const s = pick(reviewCopy);
  const name = line.ingredientId ? ingredientById.get(line.ingredientId)?.name[language()] : undefined;
  const detail = line.status === 'unmatched' || !name ? s.unmatched : line.status === 'needsReview' ? `→ ${name} · ${s.confirm}` : `→ ${name}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${line.raw}. ${detail}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, !first && { borderTopColor: c.rule, borderTopWidth: StyleSheet.hairlineWidth }, pressed && { backgroundColor: c.surface }]}
    >
      <View style={styles.grow}>
        <Body>{line.raw}</Body>
        <Caption muted={line.status === 'matched'}>{detail}</Caption>
      </View>
      {line.status === 'matched' ? null : <Tag kind="review" label={s.check} />}
    </Pressable>
  );
}

const textsOf = (recipe: Recipe): Texts => ({ title: recipe.title, servings: String(recipe.servings ?? ''), minutes: String(recipe.totalMinutes ?? '') });

function ReviewIngredients({ draft, onPick }: { draft: Recipe; onPick: (index: number) => void }) {
  const c = useTheme();
  const s = pick(reviewCopy);
  const allergens = recipeAllergens(draft).map((a) => pick(labels).allergens[a]);
  return (
    <>
      <Caption muted style={styles.section}>{fill(s.ingredients, { count: draft.ingredients.length })}</Caption>
      <View style={[styles.group, { backgroundColor: c.sheet, borderColor: c.rule }]}>
        {draft.ingredients.map((line, i) => (
          <IngredientRow key={i} line={line} first={i === 0} onPress={() => onPick(i)} />
        ))}
      </View>
      <Caption muted>{allergens.length > 0 ? fill(s.allergens, { list: allergens.join(', ') }) : s.noAllergens}</Caption>
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

  const save = () => (draft.title.trim() === '' ? setNameMissing(true) : onSave(finalize(draft)));

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.fill}>
      <NavBar
        left={<TextButton label={pick(importCopy).cancel} onPress={onCancel} />}
        center={<Caption muted>{pick(labels).fromSource[draft.source]}</Caption>}
        right={<TextButton label={pick(importCopy).save} strong onPress={save} />}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Title>{s.title}</Title>
        {count > 0 ? <Banner icon="info.circle">{count === 1 ? s.oneToCheck : fill(s.toCheck, { count })}</Banner> : null}
        <ReviewFields draft={draft} texts={texts} onChange={(next, patch) => { setTexts(next); setDraft({ ...draft, ...patch }); setNameMissing(false); }} />
        {nameMissing ? <Caption style={{ color: c.chili }}>{s.nameRequired}</Caption> : null}
        <ReviewIngredients draft={draft} onPick={setPicking} />
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
  group: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, minHeight: 52, paddingVertical: 10, paddingHorizontal: space.lg },
  grow: { flex: 1, minWidth: 0 },
});
