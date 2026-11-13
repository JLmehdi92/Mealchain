import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Circle, Ellipse, G, Path, Rect, Text } from 'react-native-svg';


import { pick } from '@/lib/i18n';
import { SceneLayer, StaticLayer } from '@/ui/SceneLayer';
import { fonts, useTheme, type Colors } from '@/ui/theme';

export const ILLU = {
  ceramic: '#D5CBC6', ceramicDark: '#C2B6B0', cream: '#F1E6CF', grain: '#E7D3A8', crust: '#D9A85B',
  crustDark: '#B98238', mushroom: '#9C7B63', leaf: '#3E9A62', leek: '#BFD8A6', can: '#C9C2BE',
};

const COPY = {
  en: { size: '4 oz', mon: 'Monday · orzo', wed: 'Wednesday · gratin' },
  fr: { size: '10 cl', mon: 'lundi · orzo', wed: 'mercredi · gratin' },
};

export const halfDisc = (cx: number, cy: number, r: number, side: 'l' | 'r') =>
  `M${cx} ${cy - r} A ${r} ${r} 0 0 ${side === 'l' ? 0 : 1} ${cx} ${cy + r} Z`;

function CartonHalf({ side, label, c }: { side: 'l' | 'r'; label: string; c: Colors }) {
  const left = side === 'l';
  return (
    <G>
      <Path d={left ? 'M2 30 L31 30 L31 108 L8 108 Q2 108 2 102 Z' : 'M31 30 L60 30 L60 102 Q60 108 54 108 L31 108 Z'} fill={c.sheet} />
      <Path d={left ? 'M2 30 L14 6 L31 6 L31 30 Z' : 'M31 6 L48 6 L60 30 L31 30 Z'} fill={left ? ILLU.ceramic : ILLU.ceramicDark} />
      {left ? null : <Rect x={38} y={0} width={6} height={7} rx={1.5} fill={ILLU.ceramicDark} />}
      <Rect x={left ? 2 : 31} y={52} width={29} height={30} fill={c.strand} />
      <Path d={halfDisc(left ? 24 : 38, 67, 8, side)} fill={c.sheet} />
      <Text x={left ? 16 : 46} y={98} fontSize={9} textAnchor="middle" fill={c.ink2} fontFamily={fonts.mono}>
        {label}
      </Text>
    </G>
  );
}

const GRAINS = [[-18, -6, 20], [-8, -14, -30], [4, -10, 40], [14, -2, -10], [-14, 6, 60], [-2, 2, 10], [10, 10, -50], [-6, 14, 30], [18, 12, 80], [0, -20, 0], [22, -12, 30], [-22, 14, -40]] as const;
const MUSHROOMS = [[-10, -2], [12, -14], [6, 16]] as const;
const HERBS = [[-24, -16], [20, 4], [-4, 24], [26, -22], [-28, 4]] as const;

function OrzoPlate({ cx, cy, c }: { cx: number; cy: number; c: Colors }) {
  return (
    <G>
      <Circle cx={cx} cy={cy + 4} r={54} fill={ILLU.ceramicDark} opacity={0.5} />
      <Circle cx={cx} cy={cy} r={54} fill={c.sheet} />
      <Circle cx={cx} cy={cy} r={42} fill={ILLU.cream} />
      {GRAINS.map(([x, y, r]) => (
        <Ellipse key={`${x},${y}`} cx={cx + x} cy={cy + y} rx={4.6} ry={2.2} rotation={r} origin={`${cx + x}, ${cy + y}`} fill={ILLU.grain} />
      ))}
      {MUSHROOMS.map(([x, y]) => (
        <G key={`${x},${y}`}>
          <Path d={`M${cx + x - 7} ${cy + y} a7 6 0 0 1 14 0 Z`} fill={ILLU.mushroom} />
          <Rect x={cx + x - 2} y={cy + y} width={4} height={5} rx={1.5} fill={ILLU.mushroom} />
        </G>
      ))}
      {HERBS.map(([x, y]) => (
        <Circle key={`${x},${y}`} cx={cx + x} cy={cy + y} r={2.2} fill={ILLU.leaf} />
      ))}
    </G>
  );
}

const CRUST = [[24, 22, 7], [52, 18, 5], [84, 26, 8], [36, 50, 6], [70, 48, 7], [96, 54, 5]] as const;
const LEEKS = [[44, 34], [62, 30], [80, 40], [30, 38]] as const;

function GratinDish({ x, y, c }: { x: number; y: number; c: Colors }) {
  return (
    <G>
      <Rect x={x} y={y + 6} width={122} height={80} rx={22} fill={ILLU.ceramicDark} opacity={0.5} />
      <Rect x={x} y={y} width={122} height={80} rx={22} fill={c.sheet} />
      <Rect x={x - 8} y={y + 30} width={12} height={20} rx={6} fill={c.sheet} />
      <Rect x={x + 118} y={y + 30} width={12} height={20} rx={6} fill={c.sheet} />
      <Rect x={x + 10} y={y + 10} width={102} height={60} rx={14} fill={ILLU.crust} />
      {CRUST.map(([dx, dy, r]) => (
        <Circle key={`${dx},${dy}`} cx={x + dx} cy={y + dy} r={r} fill={ILLU.crustDark} opacity={0.55} />
      ))}
      {LEEKS.map(([dx, dy]) => (
        <Circle key={`${dx},${dy}`} cx={x + dx} cy={y + dy} r={5.5} fill="none" stroke={ILLU.leek} strokeWidth={3} />
      ))}
    </G>
  );
}

const VIEW = '0 0 337 290';
const CARTON = 'translate(128 0) scale(1.3)';
const HALF_SHIFT = { x: 13, y: -7.8 };

export function WelcomeScene() {
  const c = useTheme();
  const copy = pick(COPY);
  const [unit, setUnit] = useState(0);
  return (
    <View style={styles.scene} onLayout={(e) => setUnit(e.nativeEvent.layout.width / 337)} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {unit > 0 ? <Layers unit={unit} c={c} copy={copy} /> : null}
    </View>
  );
}

function Layers({ unit, c, copy }: { unit: number; c: Colors; copy: (typeof COPY)['en'] }) {
  const trail = { fill: 'none', stroke: c.strand, strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeDasharray: '1 7' };
  return (
    <>
      <SceneLayer viewBox={VIEW} delay={650} from={{}}>
        <Path d="M138 150 C 118 162 100 160 88 150" {...trail} />
      </SceneLayer>
      <SceneLayer viewBox={VIEW} delay={800} from={{}}>
        <Path d="M212 142 C 236 150 250 162 256 182" {...trail} />
      </SceneLayer>
      <SceneLayer viewBox={VIEW} delay={100} from={{ scale: 0.86, origin: '22.5% 73.8%' }}>
        <OrzoPlate cx={76} cy={214} c={c} />
      </SceneLayer>
      <SceneLayer viewBox={VIEW} delay={180} from={{ scale: 0.86, origin: '76.9% 79.3%' }}>
        <GratinDish x={198} y={190} c={c} />
      </SceneLayer>
      <StaticLayer viewBox={VIEW}>
        <G transform={CARTON}>
          <CartonHalf side="l" label={copy.size} c={c} />
        </G>
      </StaticLayer>
      <SceneLayer viewBox={VIEW} delay={350} land from={{ x: -HALF_SHIFT.x * unit, y: -HALF_SHIFT.y * unit, opacity: 1 }}>
        <G transform={CARTON}>
          <G transform="translate(10 -6)">
            <CartonHalf side="r" label={copy.size} c={c} />
          </G>
        </G>
      </SceneLayer>
      <SceneLayer viewBox={VIEW} delay={900} from={{}}>
        <Text x={76} y={284} textAnchor="middle" fontSize={13} fill={c.ink2}>
          {copy.mon}
        </Text>
        <Text x={259} y={284} textAnchor="middle" fontSize={13} fill={c.ink2}>
          {copy.wed}
        </Text>
      </SceneLayer>
    </>
  );
}

const styles = StyleSheet.create({ scene: { width: '100%', aspectRatio: 337 / 290 } });
