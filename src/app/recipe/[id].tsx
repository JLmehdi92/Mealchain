import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { attributionFor } from '@/features/recipes/attribution';
import { detailCopy } from '@/features/recipes/copy';
import { RecipeBody } from '@/features/recipes/ui/RecipeBody';
import { openSwap } from '@/features/week/ui/SwapSheet';
import { isAllowedUrl } from '@/lib/importApi';
import { fill, pick, t } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { deleteRecipe, useHousehold, usePlan, useRecipes } from '@/lib/store';
import { Button } from '@/ui/Button';
import { IconButton } from '@/ui/IconButton';
import { NavBar } from '@/ui/NavBar';
import { Caption, Secondary } from '@/ui/Text';
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
  const credit = attributionFor(recipe?.sourceUrl ?? null);
  const confirmDelete = () =>
    Alert.alert(s.deleteTitle, s.deleteBody, [
      { text: s.cancel, style: 'cancel' },
      { text: s.delete, style: 'destructive', onPress: () => deleteRecipe(id).then(() => router.back(), report) },
    ]);
  const back = <IconButton testID="recipe-back" name="chevron.left" label={t('common.back')} onPress={router.back} />;

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: c.paper }]}>
      <NavBar left={back} right={slot >= 0 ? <IconButton testID="swap-meal" name="arrow.left.arrow.right" label={s.swap} onPress={() => openSwap(slot)} /> : null} />
      {recipe && household ? <RecipeBody recipe={recipe} household={household} plan={plan} slot={slot} /> : <Secondary muted style={styles.missing}>{s.missing}</Secondary>}
      {recipe ? (
        <View style={styles.footer}>
          {credit ? (
            <Caption testID="recipe-credit" muted accessibilityRole="link" onPress={() => Linking.openURL(credit.licenseUrl)}>
              {fill(s.credit, credit)}
            </Caption>
          ) : null}
          {source ? <Button kind="secondary" label={s.openOriginal} onPress={() => Linking.openURL(source.toString())} /> : null}
          <Button testID="recipe-delete" kind="danger" label={s.delete} onPress={confirmDelete} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  missing: { paddingHorizontal: space.xl },
  footer: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.sm, gap: space.sm },
});
