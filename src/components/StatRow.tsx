import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type Props = {
  label: string;
  value: string;
  valueColor?: string;
};

/** A simple label / value row used in stat lists. */
export function StatRow({ label, value, valueColor }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
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
    fontSize: 13,
    color: colors.darkGray,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
});
