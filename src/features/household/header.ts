import type { Colors } from '@/ui/theme';

export const plainHeader = (c: Colors) => ({
  headerShown: true,
  title: '',
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal' as const,
  headerTintColor: c.ink,
  headerStyle: { backgroundColor: c.paper },
});
