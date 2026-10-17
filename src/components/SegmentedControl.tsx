import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  /** Color used when this segment is active. */
  activeColor?: string;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** A reusable horizontal segmented control (used for the race filter). */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const active = opt.value === value;
        const activeColor = opt.activeColor ?? colors.primary;
        return (
          <Pressable
            key={opt.value}
            style={[styles.segment, active && { backgroundColor: activeColor }]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#eef0f5',
    borderRadius: radius.sm,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm - 2,
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.darkGray,
  },
  labelActive: {
    color: colors.white,
  },
});
