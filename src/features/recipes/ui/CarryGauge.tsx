import { StyleSheet, View } from 'react-native';

import type { Market } from '@/features/ingredients/schema';
import type { Gauge } from '@/features/week/gauge';
import { dayLabel } from '@/features/week/chains';
import { amountOf, chainThumb, ingredientName } from '@/features/week/ui/pills';
import { fill, language, pick } from '@/lib/i18n';
import { Body } from '@/ui/Text';
import { fonts, radius, space, useTheme } from '@/ui/theme';

import { detailCopy } from '../copy';
import { PackThumb } from './illustrations';

type Props = { gauge: Gauge; slot: number; slotDays: number[]; weekStart: string; market: Market };

export function CarryGauge({ gauge, slot, slotDays, weekStart, market }: Props) {
  const c = useTheme();
  const s = pick(detailCopy);
  const day = (index: number, style: 'short' | 'long') => dayLabel(weekStart, slotDays[index] ?? 0, language(), style);
  const thumb = chainThumb(gauge.ingredientId, market);
  const title = fill(s.usesRest, { day: day(gauge.fromSlot, 'long'), name: ingredientName(gauge.ingredientId).toLocaleLowerCase() });
  return (
    <View style={[styles.box, { backgroundColor: c.sheet, borderColor: c.rule }]} accessible accessibilityLabel={title}>
      <View style={styles.head}>
        {thumb ? <PackThumb kind={thumb} size={22} /> : null}
        <Body style={{ color: c.strandInk, fontWeight: '500', flex: 1 }}>{title}</Body>
      </View>
      <View style={styles.bar}>
        {gauge.segments.map((segment, i) => (
          <View key={i} style={{ flex: Math.max(segment.amount, 1), backgroundColor: c.strand, opacity: i === 0 ? 1 : 0.55 }} />
        ))}
      </View>
      <View style={styles.legend}>
        {gauge.segments.map((segment, i) => (
          <Body key={i} style={[styles.mono, { color: c.ink2 }]}>
            {`${day(segment.slot, 'short')} · ${segment.slot === slot ? `${s.here} ` : ''}${amountOf(gauge.ingredientId, segment.amount, market)}`}
          </Body>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginTop: space.xl, paddingVertical: 14, paddingHorizontal: space.lg, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  bar: { flexDirection: 'row', height: 8, gap: 2, borderRadius: 4, overflow: 'hidden', marginTop: space.sm },
  legend: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 6 },
  mono: { fontFamily: fonts.mono, fontSize: 13, lineHeight: 18 },
});
