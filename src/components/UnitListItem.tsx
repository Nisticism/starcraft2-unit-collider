import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Badge } from './Badge';

type Props = {
  image: ImageSourcePropType;
  name: string;
  raceLabel: string;
  raceColor: string;
  /** Right-aligned secondary text (e.g. HP / cost). */
  trailing?: string;
  onPress: () => void;
};

/** A tappable unit row (portrait + name + race badge + trailing stat). */
export function UnitListItem({ image, name, raceLabel, raceColor, trailing, onPress }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress}>
      <Image source={image} style={styles.portrait} />
      <View style={styles.meta}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Badge label={raceLabel} color={raceColor} />
      </View>
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray,
  },
  pressed: {
    backgroundColor: colors.lightBlue,
  },
  portrait: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.black,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  trailing: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.darkGray,
  },
  chevron: {
    fontSize: 22,
    color: colors.gray,
  },
});
