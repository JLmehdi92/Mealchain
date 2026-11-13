import * as Haptics from 'expo-haptics';
import { StyleSheet, type PressableProps } from 'react-native';

import { Press } from './Press';
import { Body, Secondary } from './Text';
import { touch, useTheme, type Colors } from './theme';

type Kind = 'primary' | 'secondary' | 'quiet' | 'danger';
type Props = Omit<PressableProps, 'children' | 'style'> & { label: string; kind?: Kind };

function palette(c: Colors, kind: Kind) {
  switch (kind) {
    case 'primary':
      return { bg: c.action, fg: c.onAction };
    case 'secondary':
      return { bg: c.surface, fg: c.ink };
    case 'danger':
      return { bg: c.chiliBg, fg: c.chili };
    case 'quiet':
      return { bg: 'transparent', fg: c.ink2 };
  }
}

export function Button({ label, kind = 'primary', onPress, disabled, ...props }: Props) {
  const c = useTheme();
  const { bg, fg } = palette(c, kind);
  const Label = kind === 'quiet' ? Secondary : Body;

  return (
    <Press
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      style={[styles.base, { backgroundColor: bg, minHeight: kind === 'quiet' ? touch.min : touch.button, opacity: disabled ? 0.5 : 1 }]}
      {...props}
    >
      <Label style={{ color: fg, fontWeight: kind === 'quiet' ? '400' : '500' }}>{label}</Label>
    </Press>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 26, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
});
