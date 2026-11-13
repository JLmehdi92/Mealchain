import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { LayoutAnimationConfig, useReducedMotion } from 'react-native-reanimated';

import { BagScene } from '@/features/list/BagScene';
import { LIST_COPY } from '@/features/list/copy';
import { ListRow } from '@/features/list/ListRow';
import type { ListRow as Row } from '@/features/list/sections';
import { shareList } from '@/features/list/share';
import { useShoppingList } from '@/features/list/useShoppingList';
import { useOfferPaywall } from '@/features/subscription/useOfferPaywall';
import { fill, pick, t } from '@/lib/i18n';
import { Button } from '@/ui/Button';
import { Group } from '@/ui/Card';
import { Empty } from '@/ui/Empty';
import { IconButton } from '@/ui/IconButton';
import { enterDown, exitFade, REFLOW } from '@/ui/motion';
import { Screen } from '@/ui/Screen';
import { SectionLabel } from '@/ui/SectionLabel';
import { Caption, Secondary } from '@/ui/Text';
import { space } from '@/ui/theme';

function Rows({ label, rows, onToggle }: { label: string; rows: Row[]; onToggle: (id: string) => void }) {
  const reduced = useReducedMotion();
  const layout = reduced ? undefined : REFLOW;
  if (rows.length === 0) return null;
  return (
    <Animated.View entering={enterDown(reduced)} exiting={exitFade(reduced)} layout={layout} style={styles.section}>
      <SectionLabel>{label}</SectionLabel>
      <Group layout={layout}>
        {rows.map((row) => (
          <ListRow key={row.id} row={row} onToggle={onToggle} />
        ))}
      </Group>
    </Animated.View>
  );
}

export default function List() {
  const copy = pick(LIST_COPY);
  const { sections, empty, toggle, shared, listSeen } = useShoppingList();
  useOfferPaywall(listSeen);
  const one = sections?.packCount === 1;
  if (empty || !sections) {
    return (
      <Screen title={t('list.title')}>
        <Empty art={<BagScene />} title={copy.emptyTitle} body={copy.emptyBody}>
          <Button kind="secondary" label={copy.planWeek} onPress={() => router.navigate('/')} />
        </Empty>
      </Screen>
    );
  }
  return (
    <Screen title={t('list.title')}>
      <View style={styles.meta}>
        <Secondary muted style={styles.grow}>{fill(shared ? (one ? copy.sharedOne : copy.shared) : one ? copy.packsOne : copy.packs, { n: sections.packCount })}</Secondary>
        <IconButton testID="share-list" name="square.and.arrow.up" label={copy.share} onPress={shareList} />
      </View>
      <LayoutAnimationConfig skipEntering>
        {sections.aisles.map((group) => (
          <Rows key={group.aisle} label={copy.aisles[group.aisle]} rows={group.rows} onToggle={toggle} />
        ))}
        <Rows label={copy.toCheck} rows={sections.toCheck} onToggle={toggle} />
        {sections.toCheck.length > 0 ? <Caption muted>{copy.toCheckHint}</Caption> : null}
        <Rows label={copy.cart} rows={sections.cart} onToggle={toggle} />
      </LayoutAnimationConfig>
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  grow: { flex: 1 },
  section: { gap: space.md },
});
