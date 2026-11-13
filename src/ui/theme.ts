import { useColorScheme } from 'react-native';

const light = {
  paper: '#EBE5E3',
  surface: '#E1DAD7',
  sheet: '#FAF7F6',
  ink: '#2B2622',
  ink2: '#655C58',
  rule: 'rgba(43, 38, 34, 0.1)',
  strand: '#0F7D45',
  strandInk: '#0B6B3A',
  chili: '#B3261E',
  chiliBg: '#F5DEDA',
  action: '#0F7D45',
  onAction: '#FFFFFF',
  onInk: '#EBE5E3',
  scrim: 'rgba(43, 38, 34, 0.28)',
};

export type Colors = typeof light;

const dark: Colors = {
  paper: '#1D1A17',
  surface: '#2B2622',
  sheet: '#36312D',
  ink: '#EBE5E3',
  ink2: '#A29C99',
  rule: 'rgba(235, 229, 227, 0.12)',
  strand: '#3DBB7A',
  strandInk: '#3DBB7A',
  chili: '#FF6B5E',
  chiliBg: '#3A1D19',
  action: '#EBE5E3',
  onAction: '#2B2622',
  onInk: '#1D1A17',
  scrim: 'rgba(0, 0, 0, 0.5)',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radius = { control: 10, card: 16, sheet: 24 } as const;
export const touch = { min: 44, button: 52 } as const;

export const fonts = {
  display: 'Urbanist-Medium',
  displayStrong: 'Urbanist-SemiBold',
  mono: 'DMMono-Regular',
} as const;

export const type = {
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 37, letterSpacing: -0.68 },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 25, letterSpacing: -0.22 },
  body: { fontSize: 17, lineHeight: 23 },
  secondary: { fontSize: 15, lineHeight: 21 },
  caption: { fontSize: 13, lineHeight: 18 },
  mono: { fontFamily: fonts.mono, fontSize: 15, lineHeight: 21 },
} as const;

export function useTheme(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
