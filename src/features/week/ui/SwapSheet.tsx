import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { alternativesFor, replaceSlot, type Alternative } from '@/features/planner/swap';
import { fill, language, pick, t } from '@/lib/i18n';
import { useHousehold, usePlan, useRecipes, useWeekStart } from '@/lib/store';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { IconButton } from '@/ui/IconButton';
import { Press } from '@/ui/Press';
import { Body, Caption, H2, Secondary } from '@/ui/Text';
import { radius, space, useTheme } from '@/ui/theme';

import { swapSlot } from '../actions';
import { dayLabel, usesOf } from '../chains';
import { weekCopy } from '../copy';
import { finishLabel } from './pills';

export const openSwap = (slot: number) => router.push({ pathname: '/swap', params: { slot: String(slot) } });

type OptionProps = { title: string; detail: string; best: boolean; onPress: () => void; testID: string };

function Option({ title, detail, best, onPress, testID }: OptionProps) {
  const c = useTheme();
  return (
    <Press testID={testID} accessibilityRole="button" onPress={onPress} style={[styles.option, { backgroundColor: c.paper }]}>
      <View style={styles.grow}>
        <Body>{title}</Body>
        <Caption style={{ color: best ? c.strandInk : c.ink2 }}>{detail}</Caption>
      </View>
      <Icon name="chevron.right" size={16} muted />
    </Press>
  );
}

function useDetail(slot: number) {
  const s = pick(weekCopy);
  const plan = usePlan();
  const recipes = useRecipes();
  const household = useHousehold();
  return (option: Alternative) => {
    if (!plan || !household) return '';
    const preview = replaceSlot(plan, slot, option.recipeId, recipes, household);
    const reuse = usesOf(preview, slot).incoming.map(({ chain, finishes }) => finishLabel(chain, finishes));
    const extra = option.extraPacks <= 0 ? s.nothingExtra : option.extraPacks === 1 ? s.extraOne : fill(s.extra, { count: option.extraPacks });
    return [...reuse, extra].join(' · ');
  };
}

export function SwapList({ slot, onClose }: { slot: number; onClose: () => void }) {
  const s = pick(weekCopy);
  const plan = usePlan();
  const recipes = useRecipes();
  const household = useHousehold();
  const detail = useDetail(slot);
  const weekStart = useWeekStart();
  const [all, setAll] = useState(false);
  const options = plan && household ? alternativesFor(plan, slot, recipes, household) : [];
  const titles = new Map(recipes.map((recipe) => [recipe.id, recipe.title]));
  const choose = (recipeId: string) =>
    swapSlot(slot, recipeId)
      .then(onClose)
      .catch(() => Alert.alert(s.failed));
  const day = dayLabel(weekStart, plan?.slots[slot]?.day ?? 0, language(), 'long');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.head}>
        <H2 style={styles.grow}>{fill(s.swapTitle, { day })}</H2>
        <IconButton testID="swap-close" name="xmark" label={t('common.close')} onPress={onClose} />
      </View>
      <Secondary muted>{s.swapBody}</Secondary>
      {options.length === 0 ? <Secondary muted>{s.noAlternative}</Secondary> : null}
      {(all ? options : options.slice(0, 3)).map((option, i) => (
        <Option
          key={option.recipeId}
          testID={`swap-option-${option.recipeId}`}
          title={titles.get(option.recipeId) ?? ''}
          detail={detail(option)}
          best={i === 0 && option.extraPacks <= 0}
          onPress={() => choose(option.recipeId)}
        />
      ))}
      {!all && options.length > 3 ? <Button kind="quiet" label={s.all} onPress={() => setAll(true)} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl, gap: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  grow: { flex: 1 },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.card, minHeight: 64 },
});
