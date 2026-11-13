import * as Haptics from 'expo-haptics';
import { StyleSheet } from 'react-native';

import { Icon, type IconName } from './Icon';
import { Press } from './Press';
import { touch, useTheme } from './theme';

type Props = { name: IconName; label: string; onPress: () => void; testID?: string };

export function IconButton({ name, label, onPress, testID }: Props) {
  const c = useTheme();
  return (
    <Press
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={[styles.button, { backgroundColor: c.sheet, borderColor: c.rule }]}
    >
      <Icon name={name} />
    </Press>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touch.min, height: touch.min, borderRadius: touch.min / 2, alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
