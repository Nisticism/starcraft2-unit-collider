import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type Props = {
  title: string;
  subtitle?: string;
};

/**
 * Temporary scaffold screen body. Each real screen replaces this during Phase 3.
 */
export function Placeholder({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
  },
});
