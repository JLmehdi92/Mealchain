import { useLocalSearchParams } from 'expo-router';

import { t } from '@/lib/i18n';
import { useRecipes } from '@/lib/store';
import { Screen } from '@/ui/Screen';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = useRecipes().find((r) => r.id === id);
  return <Screen title={recipe?.title ?? t('recipes.title')} />;
}
