import { useState } from 'react';
import { FlatList, Modal, StyleSheet, View } from 'react-native';

import { ingredientById } from '@/features/ingredients/catalog';
import { SearchField } from '@/features/recipes/ui/parts';
import type { RecipeIngredient } from '@/features/recipes/types';
import { language, pick, t } from '@/lib/i18n';
import { IconButton } from '@/ui/IconButton';
import { Row } from '@/ui/Row';
import { Caption, H2 } from '@/ui/Text';
import { space, useTheme } from '@/ui/theme';

import { reviewCopy } from '../copy';
import { searchCatalog } from '../searchCatalog';

type Props = { line: RecipeIngredient | null; onPick: (ingredientId: string) => void; onClose: () => void };

export function IngredientPicker({ line, onPick, onClose }: Props) {
  const c = useTheme();
  const s = pick(reviewCopy);
  const lang = language();
  const [query, setQuery] = useState('');
  const suggested = line?.ingredientId ? ingredientById.get(line.ingredientId) : undefined;
  const results = searchCatalog(query, lang);
  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={line !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <View style={[styles.fill, { backgroundColor: c.sheet }]}>
        <View style={styles.head}>
          <View style={styles.grow}>
            <H2>{s.pickerTitle}</H2>
            <Caption muted numberOfLines={2}>{line?.raw}</Caption>
          </View>
          <IconButton name="xmark" label={t('common.close')} onPress={close} />
        </View>
        <View style={styles.searchBox}>
          <SearchField label={s.pickerSearch} value={query} onChange={setQuery} />
        </View>
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={suggested && !query ? <Row label={suggested.name[lang]} detail={s.suggested} onPress={() => onPick(suggested.id)} /> : undefined}
          renderItem={({ item }) => <Row label={item.name[lang]} onPress={() => onPick(item.id)} />}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, paddingTop: space.xl },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingHorizontal: space.xl },
  grow: { flex: 1, gap: space.xs },
  searchBox: { margin: space.xl },
});
