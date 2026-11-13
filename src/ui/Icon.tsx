import { SymbolView, type SFSymbol, type SymbolViewProps } from 'expo-symbols';

import { useTheme } from './theme';

export type IconName = SFSymbol;
type Props = { name: IconName; size?: number; color?: string; muted?: boolean; weight?: SymbolViewProps['weight'] };

export function Icon({ name, size = 22, color, muted, weight }: Props) {
  const c = useTheme();
  return <SymbolView name={name} size={size} weight={weight} tintColor={color ?? (muted ? c.ink2 : c.ink)} accessible={false} />;
}
