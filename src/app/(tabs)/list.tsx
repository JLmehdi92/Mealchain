import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { BagScene } from '@/features/list/BagScene';
import { LIST_COPY } from '@/features/list/copy';
import { ListRow } from '@/features/list/ListRow';
import type { ListRow as Row } from '@/features/list/sections';
import { shareList } from '@/features/list/share';
import { useShoppingList } from '@/features/list/useShoppingList';
import { SectionLabel } from '@/features/household/controls';
import { useOfferPaywall } from '@/features/subscription/useOfferPaywall';
import { fill, pick, t } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { Group } from '@/ui/Card';
import { Screen } from '@/ui/Screen';
import { Caption, H2, Secondary } from '@/ui/Text';
import { space, touch, useTheme } from '@/ui/theme';

function Rows({ label, rows, onToggle }: { label: string; rows: Row[]; onToggle: (id: string) => void }) {
  if (rows.length === 0) return null;
  return (
    <>
      <SectionLabel>{label}</SectionLabel>
      <Group>
        {rows.map((row) => (
          <ListRow key={row.id} row={row} onToggle={onToggle} />
        ))}
      </Group>
    </>
  );
}

function Empty() {
  const copy = pick(LIST_COPY);
  return (
    <View style={styles.empty}>
      <BagScene />
      <H2 style={styles.center}>{copy.emptyTitle}</H2>
      <Secondary muted style={styles.center}>{copy.emptyBody}</Secondary>
      <Button kind="secondary" label={copy.planWeek} onPress={() => router.navigate('/week')} />
    </View>
  );
}

export default function List() {
  const c = useTheme();
  const copy = pick(LIST_COPY);
  const { sections, empty, toggle, shared, listSeen } = useShoppingList();
  useOfferPaywall(listSeen);
  const one = sections?.packCount === 1;
  if (empty || !sections) {
    return (
      <Screen title={t('list.title')}>
        <Empty />
      </Screen>
    );
  }
  return (
    <Screen title={t('list.title')}>
      <View style={styles.meta}>
        <Secondary muted style={styles.grow}>{fill(shared ? (one ? copy.sharedOne : copy.shared) : one ? copy.packsOne : copy.packs, { n: sections.packCount })}</Secondary>
        <Pressable accessibilityRole="button" accessibilityLabel={copy.share} onPress={shareList} style={[styles.share, { backgroundColor: c.surface }]}>
          <SymbolView name="square.and.arrow.up" size={18} tintColor={c.ink} />
        </Pressable>
      </View>
      {sections.aisles.map((group) => (
        <Rows key={group.aisle} label={copy.aisles[group.aisle]} rows={group.rows} onToggle={toggle} />
      ))}
      <Rows label={copy.toCheck} rows={sections.toCheck} onToggle={toggle} />
      {sections.toCheck.length > 0 ? <Caption muted>{copy.toCheckHint}</Caption> : null}
      <Rows label={copy.cart} rows={sections.cart} onToggle={toggle} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  grow: { flex: 1 },
  share: { width: touch.min, height: touch.min, borderRadius: touch.min / 2, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: space.md, paddingTop: space.xxxl * 2, paddingHorizontal: space.xxl },
  center: { textAlign: 'center' },
});
