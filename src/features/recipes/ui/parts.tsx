import { StyleSheet, TextInput, View, type DimensionValue } from 'react-native';

import { Icon } from '@/ui/Icon';
import { Press } from '@/ui/Press';
import { Body } from '@/ui/Text';
import { radius, space, touch, type as typography, useTheme } from '@/ui/theme';

type TextButtonProps = { label: string; onPress: () => void; strong?: boolean; testID?: string };

export function TextButton({ label, onPress, strong, testID }: TextButtonProps) {
  return (
    <Press testID={testID} accessibilityRole="button" onPress={onPress} hitSlop={8} style={styles.textButton}>
      <Body style={strong ? styles.strong : undefined}>{label}</Body>
    </Press>
  );
}

export function SearchField({ label, value, onChange }: { label: string; value: string; onChange: (text: string) => void }) {
  const c = useTheme();
  return (
    <View style={[styles.search, { backgroundColor: c.surface }]}>
      <Icon name="magnifyingglass" size={18} muted />
      <TextInput
        accessibilityLabel={label}
        placeholder={label}
        placeholderTextColor={c.ink2}
        value={value}
        onChangeText={onChange}
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={[typography.body, styles.searchInput, { color: c.ink }]}
      />
    </View>
  );
}

export function Skeleton({ width, height = 14 }: { width: DimensionValue; height?: number }) {
  const c = useTheme();
  return <View style={{ width, height, borderRadius: 8, backgroundColor: c.surface }} />;
}

const styles = StyleSheet.create({
  textButton: { minHeight: touch.min, justifyContent: 'center', paddingHorizontal: space.sm },
  strong: { fontWeight: '600' },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: touch.min, paddingHorizontal: space.md, borderRadius: radius.control },
  searchInput: { flex: 1, paddingVertical: space.sm },
});
