import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  children: ReactNode;
  /** Optional left accent bar color (e.g. race color). */
  accentColor?: string;
  style?: ViewStyle;
};

/** A themed surface container with rounded corners and a subtle shadow. */
export function Card({ children, accentColor, style }: Props) {
  return (
    <View
      style={[
        styles.card,
        accentColor ? { borderLeftColor: accentColor, borderLeftWidth: 4 } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
