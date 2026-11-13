import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion, useReducedMotion } from 'react-native-reanimated';

import { FREE_RECIPE_LIMIT } from '@/features/subscription/rules';
import { fill, pick } from '@/lib/i18n';
import { useHousehold, usePlan, useRecipes, useWeekStart } from '@/lib/store';
import { REFLOW } from '@/ui/motion';
import { Secondary, Title } from '@/ui/Text';
import { radius, space, useTheme } from '@/ui/theme';

import { boxCopy } from '../copy';
import { SearchField } from './parts';
import { RecipeCard } from './RecipeCard';

const ARRIVE = FadeIn.delay(250).springify(400).dampingRatio(1);
const ARRIVE_REDUCED = FadeIn.duration(150).reduceMotion(ReduceMotion.Never);

const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function RecipeList({ pro }: { pro: boolean }) {
  const c = useTheme();
  const s = pick(boxCopy);
  const recipes = useRecipes();
  const household = useHousehold();
  const plan = usePlan();
  const weekStart = useWeekStart();
  const reduced = useReducedMotion();
  const [query, setQuery] = useState('');
  const [openedAt] = useState(Date.now);
  const shown = recipes.filter((recipe) => fold(recipe.title).includes(fold(query.trim())));
  const header = (
    <View style={styles.header}>
      <Title>{s.title}</Title>
      {pro ? null : <Secondary muted>{fill(s.freeCount, { count: recipes.length, limit: FREE_RECIPE_LIMIT })}</Secondary>}
      <View style={styles.search}>
        <SearchField label={s.search} value={query} onChange={setQuery} />
      </View>
    </View>
  );
  return (
    <Animated.FlatList
      data={household ? shown : []}
      keyExtractor={(recipe) => recipe.id}
      ListHeaderComponent={header}
      ListEmptyComponent={<Secondary muted>{fill(s.noMatch, { query })}</Secondary>}
      keyboardDismissMode="on-drag"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.list}
      itemLayoutAnimation={reduced ? undefined : REFLOW}
      renderItem={({ item, index }) =>
        household ? (
          <Animated.View
            entering={item.createdAt > openedAt ? (reduced ? ARRIVE_REDUCED : ARRIVE) : undefined}
            style={[{ backgroundColor: c.sheet }, index === 0 && styles.top, index === shown.length - 1 && styles.bottom]}
          >
            <RecipeCard recipe={item} household={household} plan={plan} weekStart={weekStart} first={index === 0} />
          </Animated.View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs, paddingBottom: space.xl },
  search: { marginTop: space.lg },
  list: { paddingHorizontal: space.xl, paddingBottom: space.xxxl * 3 },
  top: { borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  bottom: { borderBottomLeftRadius: radius.card, borderBottomRightRadius: radius.card },
});
