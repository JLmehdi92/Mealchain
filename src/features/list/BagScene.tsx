import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/ui/theme';

import { halfDisc, ILLU } from '../household/WelcomeScene';

export function BagScene() {
  const c = useTheme();
  return (
    <Svg viewBox="0 0 220 180" width={220} height={180} accessibilityElementsHidden>
      <G>
        <Rect x={132} y={22} width={12} height={70} rx={6} fill={ILLU.leek} rotation={12} origin="138, 60" />
        <Path d="M140 26 q14-22 26-20 q-6 16-20 28z" fill={ILLU.leaf} />
        <Path d="M134 24 q-6-24 4-30 q6 16 2 32z" fill={ILLU.leaf} />
      </G>
      <G>
        <Path d="M66 40 l6-14 h22 l6 14 v50 h-34z" fill={c.sheet} />
        <Path d="M66 40 l6-14 h22 l6 14z" fill={ILLU.ceramicDark} />
        <Rect x={66} y={52} width={34} height={18} fill={c.strand} />
        <Path d={halfDisc(80, 61, 5, 'l')} fill={c.sheet} />
        <Path d={halfDisc(86, 59, 5, 'r')} fill={c.sheet} />
      </G>
      <G>
        <Rect x={102} y={46} width={30} height={44} rx={4} fill={ILLU.can} />
        <Rect x={102} y={56} width={30} height={22} fill={ILLU.cream} />
        <Ellipse cx={117} cy={46} rx={15} ry={4} fill={ILLU.ceramicDark} />
      </G>
      <Path d="M78 78 c0-34 64-34 64 0" fill="none" stroke={ILLU.ceramicDark} strokeWidth={7} strokeLinecap="round" />
      <Path d="M40 80 h140 l-12 84 a10 10 0 0 1-10 8 h-96 a10 10 0 0 1-10-8z" fill={ILLU.ceramic} />
      <Path d="M40 80 h140 l-2 12 h-136z" fill={ILLU.ceramicDark} />
      <Path d={halfDisc(106, 130, 12, 'l')} fill={c.sheet} />
      <Path d={halfDisc(113, 125, 12, 'r')} fill={c.strand} />
    </Svg>
  );
}
