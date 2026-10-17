import { StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  label: string;
  /** Background color; text is white. */
  color?: string;
};

/** A small rounded label chip (e.g. race badge). */
export function Badge({ label, color = colors.primary }: Props) {
  return <Text style={[styles.badge, { backgroundColor: color }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});
