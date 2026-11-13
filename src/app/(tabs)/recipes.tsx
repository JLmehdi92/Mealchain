import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { boxCopy } from '@/features/recipes/copy';
import { BoxScene } from '@/features/recipes/ui/illustrations';
import { RecipeList } from '@/features/recipes/ui/RecipeList';
import { canAddRecipe } from '@/features/subscription/rules';
import { useIsPro } from '@/features/subscription/useIsPro';
import { pick } from '@/lib/i18n';
import { useRecipes } from '@/lib/store';
import { Button } from '@/ui/Button';
import { Empty } from '@/ui/Empty';
import { IconButton } from '@/ui/IconButton';
import { NavBar } from '@/ui/NavBar';
import { Title } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

export default function Recipes() {
  const c = useTheme();
  const s = pick(boxCopy);
  const count = useRecipes().length;
  const pro = useIsPro();
  const add = () => router.push(canAddRecipe(count, pro) ? '/import' : '/paywall');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.fill, { backgroundColor: c.paper }]}>
      <NavBar
        right={
          <>
            <IconButton testID="open-settings" name="gearshape" label={s.settings} onPress={() => router.push('/settings')} />
            {count > 0 ? <IconButton testID="add-recipe" name="plus" label={s.add} onPress={add} /> : null}
          </>
        }
      />
      {count === 0 ? (
        <View style={styles.pad}>
          <Title>{s.title}</Title>
          <Empty art={<BoxScene />} title={s.emptyTitle} body={s.emptyBody}>
            <Button testID="add-recipe" label={s.add} onPress={add} />
          </Empty>
        </View>
      ) : (
        <RecipeList pro={pro} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pad: { paddingHorizontal: space.xl },
});
