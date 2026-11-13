import { router, useLocalSearchParams } from 'expo-router';
import { Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { detailCopy } from '@/features/recipes/copy';
import { RecipeBody } from '@/features/recipes/ui/RecipeBody';
import { openSwap } from '@/features/week/ui/SwapSheet';
import { isAllowedUrl } from '@/lib/importApi';
import { pick, t } from '@/lib/i18n';
import { useHousehold, usePlan, useRecipes } from '@/lib/store';
import { Button } from '@/ui/Button';
import { IconButton } from '@/ui/IconButton';
import { NavBar } from '@/ui/NavBar';
import { Secondary } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

export default function RecipeDetail() {
  const c = useTheme();
  const s = pick(detailCopy);
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = useRecipes().find((r) => r.id === id);
  const household = useHousehold();
  const plan = usePlan();
  const slot = plan?.slots.findIndex((entry) => entry.recipeId === id) ?? -1;
  const source = recipe?.sourceUrl ? isAllowedUrl(recipe.sourceUrl) : null;
  const back = <IconButton testID="recipe-back" name="chevron.left" label={t('common.back')} onPress={router.back} />;

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: c.paper }]}>
      <NavBar left={back} right={slot >= 0 ? <IconButton testID="swap-meal" name="arrow.left.arrow.right" label={s.swap} onPress={() => openSwap(slot)} /> : null} />
      {recipe && household ? <RecipeBody recipe={recipe} household={household} plan={plan} slot={slot} /> : <Secondary muted style={styles.missing}>{s.missing}</Secondary>}
      {source ? (
        <View style={styles.footer}>
          <Button kind="secondary" label={s.openOriginal} onPress={() => Linking.openURL(source.toString())} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  missing: { paddingHorizontal: space.xl },
  footer: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.sm },
});
