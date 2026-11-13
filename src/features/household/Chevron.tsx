import { SymbolView } from 'expo-symbols';

import { useTheme } from '@/ui/theme';

export function Chevron() {
  const c = useTheme();
  return <SymbolView name="chevron.right" size={14} weight="semibold" tintColor={c.ink2} />;
}
