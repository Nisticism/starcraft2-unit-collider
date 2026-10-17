import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  accentColor?: string;
};

/** A compact −/+ stepper for upgrade levels (0–3), reusable for attack/armor/shields. */
export function UpgradeStepper({
  label,
  value,
  min = 0,
  max = 3,
  onChange,
  accentColor = colors.primary,
}: Props) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          style={[styles.btn, value <= min && styles.btnDisabled]}
          onPress={dec}
          disabled={value <= min}
          hitSlop={6}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
        <Pressable
          style={[styles.btn, value >= max && styles.btnDisabled]}
          onPress={inc}
          disabled={value >= max}
          hitSlop={6}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '600',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  btn: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: '#eef0f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
    lineHeight: 22,
  },
  value: {
    minWidth: 18,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
  },
});
