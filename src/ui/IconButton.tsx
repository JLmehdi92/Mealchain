import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from './Icon';
import { touch, useTheme } from './theme';

export function IconButton({ name, label, onPress }: { name: IconName; label: string; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [styles.button, { backgroundColor: c.sheet, borderColor: c.rule, opacity: pressed ? 0.7 : 1 }]}
    >
      <Icon name={name} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touch.min, height: touch.min, borderRadius: touch.min / 2, alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
