import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { Secondary } from './Text';
import { touch, useTheme } from './theme';

type Props = { label: string; selected?: boolean; onPress?: () => void };

export function Chip({ label, selected = false, onPress }: Props) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={(touch.min - 36) / 2}
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      style={[
        styles.chip,
        selected ? { backgroundColor: c.ink } : { backgroundColor: c.sheet, borderColor: c.rule, borderWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <Secondary style={{ color: selected ? c.onInk : c.ink }}>{label}</Secondary>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { minHeight: 36, paddingHorizontal: 14, borderRadius: 18, justifyContent: 'center' },
});
