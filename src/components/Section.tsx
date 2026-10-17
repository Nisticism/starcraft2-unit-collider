import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';
import { Card } from './Card';

type Props = {
  title: string;
  children: ReactNode;
  accentColor?: string;
};

/** A titled card section, used to group detail content (stats, lore, etc.). */
export function Section({ title, children, accentColor }: Props) {
  return (
    <Card accentColor={accentColor}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </Card>
  );
}

/** A paragraph of body text, trimmed of the original data's leading whitespace. */
export function Paragraph({ children }: { children: string }) {
  return <Text style={styles.body}>{children.trim()}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.darkGray,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.black,
  },
});
