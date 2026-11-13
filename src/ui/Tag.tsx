import { StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { Caption } from './Text';
import { space, useTheme } from './theme';

export function Tag({ label, kind }: { label: string; kind: 'review' | 'excluded' }) {
  const c = useTheme();
  const excluded = kind === 'excluded';
  return (
    <View style={[styles.tag, excluded ? { backgroundColor: c.chiliBg } : { backgroundColor: c.sheet, borderColor: c.ink2, borderWidth: 1 }]}>
      {excluded ? <Icon name="exclamationmark.triangle" size={12} color={c.chili} /> : null}
      <Caption style={{ color: excluded ? c.chili : c.ink, fontWeight: excluded ? '500' : '400' }}>{label}</Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: 6 },
});
