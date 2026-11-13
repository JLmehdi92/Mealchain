import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { SceneLayer, StaticLayer } from '@/ui/SceneLayer';
import { useTheme } from '@/ui/theme';

import type { Thumb } from '../meta';

const ILLU = {
  ceramic: '#D5CBC6', ceramicDark: '#C2B6B0', cream: '#F1E6CF', grain: '#E7D3A8', crust: '#D9A85B',
  mushroom: '#9C7B63', leaf: '#3E9A62', leek: '#BFD8A6', can: '#C9C2BE', chili: '#B8462F', bagDark: '#2F7A4C', blockSide: '#D8C9A0',
};

const halfDisc = (cx: number, cy: number, r: number, side: 'l' | 'r') =>
  `M${cx} ${cy - r} A ${r} ${r} 0 0 ${side === 'l' ? 0 : 1} ${cx} ${cy + r} Z`;

function ThumbShapes({ kind, sheet, strand }: { kind: Thumb; sheet: string; strand: string }) {
  switch (kind) {
    case 'carton':
      return <><Path d="M20 22 l5-11 h14 l5 11 v30 h-24z" fill={sheet} /><Path d="M20 22 l5-11 h14 l5 11z" fill={ILLU.ceramicDark} /><Rect x={20} y={30} width={24} height={12} fill={strand} /></>;
    case 'can':
      return <><Rect x={19} y={18} width={26} height={34} rx={4} fill={ILLU.can} /><Rect x={19} y={26} width={26} height={16} fill={ILLU.cream} /><Ellipse cx={32} cy={18} rx={13} ry={3.5} fill={ILLU.ceramicDark} /></>;
    case 'jar':
      return <><Rect x={22} y={12} width={20} height={7} rx={2} fill={ILLU.mushroom} /><Path d="M21 19 h22 q4 4 4 10 v20 a4 4 0 0 1-4 4 h-22 a4 4 0 0 1-4-4 v-20 q0-6 4-10z" fill={ILLU.chili} /><Rect x={21} y={30} width={22} height={12} rx={2} fill={ILLU.cream} /></>;
    case 'eggs':
      return <><Ellipse cx={25} cy={30} rx={7} ry={9} fill={ILLU.cream} /><Ellipse cx={39} cy={30} rx={7} ry={9} fill={ILLU.cream} /><Path d="M12 34 h40 l-4 16 a4 4 0 0 1-4 3 h-24 a4 4 0 0 1-4-3z" fill={ILLU.ceramicDark} /></>;
    case 'bunch':
      return <><Rect x={24} y={24} width={7} height={30} rx={3.5} fill={ILLU.leek} /><Rect x={33} y={22} width={7} height={32} rx={3.5} fill={ILLU.leek} /><Path d="M27 26 q-8-14 0-18 q4 10 0 18z M36 24 q8-14 14-12 q-4 10-14 12z" fill={ILLU.leaf} /></>;
    case 'bag':
      return <><Path d="M16 22 h32 l-3 30 h-26z" fill={ILLU.leaf} /><Path d="M16 22 h32 l-1 6 h-30z" fill={ILLU.bagDark} /><Circle cx={32} cy={38} r={5} fill={ILLU.leek} /></>;
    case 'tray':
      return <><Path d="M12 36 h40 l-4 14 h-32z" fill={ILLU.ceramicDark} /><Path d="M20 36 a6 5 0 0 1 12 0z M30 36 a7 6 0 0 1 14 0z" fill={ILLU.mushroom} /></>;
    case 'block':
      return <><Path d="M14 30 l18-9 l18 9 l-18 9z" fill={ILLU.cream} /><Path d="M14 30 v10 l18 9 v-10z" fill={ILLU.grain} /><Path d="M50 30 v10 l-18 9 v-10z" fill={ILLU.blockSide} /></>;
  }
}

export function PackThumb({ kind, size = 64 }: { kind: Thumb; size?: number }) {
  const c = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessible={false}>
      <ThumbShapes kind={kind} sheet={c.sheet} strand={c.strand} />
    </Svg>
  );
}

function IndexCard({ x, y, rot, band }: { x: number; y: number; rot: number; band?: string }) {
  const c = useTheme();
  return (
    <G transform={`rotate(${rot} ${x + 30} ${y + 40})`}>
      <Rect x={x} y={y} width={60} height={78} rx={9} fill={c.sheet} />
      {band ? (
        <Path d={`M${x} ${y + 9} a9 9 0 0 1 9-9 h42 a9 9 0 0 1 9 9 v13 h-60z`} fill={band} />
      ) : (
        <>
          <Rect x={x + 9} y={y + 12} width={34} height={5} rx={2.5} fill={c.ink} opacity={0.75} />
          <Rect x={x + 9} y={y + 23} width={42} height={4} rx={2} fill={c.ink2} opacity={0.35} />
          <Rect x={x + 9} y={y + 32} width={30} height={4} rx={2} fill={c.ink2} opacity={0.35} />
          <Path d={halfDisc(x + 42, y + 58, 8, 'l')} fill={c.ink} />
          <Path d={halfDisc(x + 47, y + 55, 8, 'r')} fill={c.strand} />
        </>
      )}
    </G>
  );
}

const BOX = '0 0 240 180';
const DROP = { y: -14 };
const RISE = { y: 30, opacity: 1 };

export function BoxScene() {
  const c = useTheme();
  return (
    <View style={styles.box}>
      <SceneLayer viewBox={BOX} delay={150} from={DROP}>
        <Rect x={18} y={20} width={58} height={26} rx={13} fill={c.sheet} />
        <Path d="M36 35 l6-6 M33 31 l-3 3 a3.5 3.5 0 0 0 5 5 l3-3 M45 30 l3-3 a3.5 3.5 0 0 0-5-5 l-3 3" stroke={c.ink} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <Rect x={52} y={30} width={16} height={4} rx={2} fill={c.ink2} opacity={0.4} />
      </SceneLayer>
      <SceneLayer viewBox={BOX} delay={270} from={DROP}>
        <Path d="M168 14 h48 a10 10 0 0 1 10 10 v14 a10 10 0 0 1-10 10 h-30 l-8 8 v-8 h-10 a10 10 0 0 1-10-10 v-14 a10 10 0 0 1 10-10z" fill={c.sheet} />
        <Rect x={170} y={24} width={40} height={4} rx={2} fill={c.ink2} opacity={0.45} />
        <Rect x={170} y={33} width={28} height={4} rx={2} fill={c.ink2} opacity={0.45} />
      </SceneLayer>
      <SceneLayer viewBox={BOX} delay={390} from={DROP}>
        <Rect x={104} y={4} width={32} height={54} rx={7} fill={c.ink} />
        <Rect x={107} y={10} width={26} height={42} rx={4} fill={c.sheet} />
        <Rect x={111} y={16} width={18} height={12} rx={2} fill={ILLU.crust} />
        <Rect x={111} y={32} width={18} height={3} rx={1.5} fill={c.ink2} opacity={0.45} />
        <Rect x={111} y={39} width={12} height={3} rx={1.5} fill={c.ink2} opacity={0.45} />
      </SceneLayer>
      <StaticLayer viewBox={BOX}>
        <Rect x={44} y={96} width={152} height={18} rx={6} fill={ILLU.ceramicDark} />
      </StaticLayer>
      <SceneLayer viewBox={BOX} delay={500} from={RISE}>
        <IndexCard x={62} y={64} rot={-9} band={ILLU.crust} />
      </SceneLayer>
      <SceneLayer viewBox={BOX} delay={580} from={RISE}>
        <IndexCard x={122} y={66} rot={10} band={ILLU.leaf} />
      </SceneLayer>
      <SceneLayer viewBox={BOX} delay={660} from={RISE}>
        <IndexCard x={92} y={56} rot={2} />
      </SceneLayer>
      <StaticLayer viewBox={BOX}>
        <Path d="M38 108 h164 l-8 58 a12 12 0 0 1-12 10 h-124 a12 12 0 0 1-12-10z" fill={ILLU.ceramic} />
        <Rect x={102} y={128} width={36} height={12} rx={6} fill={c.sheet} opacity={0.8} />
      </StaticLayer>
    </View>
  );
}

export function PageScene() {
  const c = useTheme();
  return (
    <Svg width={200} height={180} viewBox="0 0 200 180" accessible={false}>
      <Rect x={44} y={18} width={112} height={146} rx={12} fill={c.sheet} />
      <Rect x={58} y={32} width={84} height={40} rx={6} fill={ILLU.ceramic} />
      <Rect x={58} y={82} width={60} height={6} rx={3} fill={c.ink} opacity={0.7} />
      <Rect x={58} y={98} width={84} height={44} rx={6} fill="none" stroke={c.ink2} strokeWidth={1.5} strokeDasharray="4 5" opacity={0.7} />
      <Circle cx={128} cy={124} r={22} fill={c.paper} opacity={0.85} />
      <Circle cx={128} cy={124} r={22} fill="none" stroke={c.ink} strokeWidth={5} />
      <Path d="M144 140 l16 16" stroke={c.ink} strokeWidth={7} strokeLinecap="round" />
      <Rect x={118} y={122} width={20} height={4} rx={2} fill={c.ink2} opacity={0.4} />
    </Svg>
  );
}

const styles = StyleSheet.create({ box: { width: 240, height: 180 } });
