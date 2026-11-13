import { Text as RNText, type TextProps } from 'react-native';

import { type, useTheme } from './theme';

type Variant = keyof typeof type;
type Props = TextProps & { muted?: boolean };

function make(variant: Variant, role?: 'header') {
  return function Variant({ style, muted, ...props }: Props) {
    const c = useTheme();
    return (
      <RNText
        accessibilityRole={role}
        style={[type[variant], { color: muted ? c.ink2 : c.ink }, style]}
        {...props}
      />
    );
  };
}

export const Title = make('title', 'header');
export const H2 = make('h2', 'header');
export const Body = make('body');
export const Secondary = make('secondary');
export const Caption = make('caption');
export const Mono = make('mono');
