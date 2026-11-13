import * as Haptics from 'expo-haptics';
import { StyleSheet, Switch, View } from 'react-native';

import { fill, pick } from '@/lib/i18n';
import { Icon, type IconName } from '@/ui/Icon';
import { Press } from '@/ui/Press';
import { Row } from '@/ui/Row';
import { Body, Secondary } from '@/ui/Text';
import { radius, space, touch, useTheme } from '@/ui/theme';

import { COPY } from './labels';

type StepperProps = { label: string; value: number; min: number; max: number; onChange: (value: number) => void; testID?: string };

function Stepper({ label, value, min, max, onChange, testID }: StepperProps) {
  const c = useTheme();
  const copy = pick(COPY);
  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next === value) return;
    Haptics.selectionAsync();
    onChange(next);
  };
  const button = (delta: number, icon: IconName, a11y: string) => (
    <Press
      testID={testID && `${testID}-${delta < 0 ? 'minus' : 'plus'}`}
      accessibilityRole="button"
      accessibilityLabel={fill(a11y, { label: label.toLocaleLowerCase() })}
      accessibilityState={{ disabled: delta < 0 ? value <= min : value >= max }}
      hitSlop={6}
      onPress={() => step(delta)}
      style={styles.stepButton}
    >
      <Icon name={icon} size={16} />
    </Press>
  );
  return (
    <View style={[styles.stepper, { backgroundColor: c.surface }]}>
      {button(-1, 'minus', copy.decrease)}
      <Body
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        style={styles.stepValue}
      >
        {value}
      </Body>
      {button(1, 'plus', copy.increase)}
    </View>
  );
}

export function StepperRow(props: StepperProps) {
  return <Row label={props.label} trailing={<Stepper {...props} />} />;
}

type SegmentedProps<T> = { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void };

export function Segmented<T>({ options, value, onChange }: SegmentedProps<T>) {
  const c = useTheme();
  return (
    <View accessibilityRole="radiogroup" style={[styles.seg, { backgroundColor: c.surface }]}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Press
            key={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(option.value);
            }}
            style={[styles.segButton, on && { backgroundColor: c.sheet }]}
          >
            <Secondary style={{ fontWeight: on ? '500' : '400' }}>{option.label}</Secondary>
          </Press>
        );
      })}
    </View>
  );
}

type ToggleProps = { label: string; detail?: string; value: boolean; onChange: (value: boolean) => void; testID?: string };

export function ToggleRow({ label, detail, value, onChange, testID }: ToggleProps) {
  const c = useTheme();
  return (
    <Row
      label={label}
      detail={detail}
      trailing={<Switch testID={testID} accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ true: c.ink, false: c.surface }} />}
    />
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderRadius: radius.control, padding: 2 },
  stepButton: { width: 40, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 28, textAlign: 'center', fontWeight: '500', fontVariant: ['tabular-nums'] },
  seg: { flexDirection: 'row', borderRadius: radius.control, padding: 2 },
  segButton: { flex: 1, minHeight: touch.min - 4, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
