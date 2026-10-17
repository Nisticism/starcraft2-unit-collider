import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, Paragraph, Section, StatRow } from '../components';
import type { Unit } from '../data/types';
import { unitById } from '../data/unitCatalog';
import { getUnitImage } from '../data/unitImages';
import type { RootStackParamList } from '../navigation/types';
import { colors, raceColors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'UnitDetail'>;

const ATTRIBUTE_NAMES: Record<string, string> = {
  A: 'Armored',
  L: 'Light',
  B: 'Biological',
  M: 'Massive',
  S: 'Structure',
  P: 'Psionic',
  X: 'Mechanical',
};

function decodeAttributes(attributes: string): string {
  return [...attributes]
    .map((c) => ATTRIBUTE_NAMES[c])
    .filter(Boolean)
    .join(' · ');
}

function damage(unit: Unit): string | null {
  const parts = [unit.Dmg1, unit.Dmg2].filter((d): d is number => d != null && d > 0);
  return parts.length ? parts.join(' / ') : null;
}

function range(unit: Unit): string | null {
  const g = unit.RangeVsGround ? `${unit.RangeVsGround} (ground)` : null;
  const a = unit.RangeVsAir ? `${unit.RangeVsAir} (air)` : null;
  return [g, a].filter(Boolean).join(', ') || null;
}

export default function UnitDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const unit = unitById[route.params.unitId];

  useLayoutEffect(() => {
    navigation.setOptions({ title: unit ? unit.Name : 'Unit' });
  }, [navigation, unit]);

  if (!unit) {
    return (
      <View style={styles.missing}>
        <Text>Unit not found.</Text>
      </View>
    );
  }

  const accent = raceColors[unit.Race];
  const attributes = decodeAttributes(unit.Attributes);

  const combatStats: { label: string; value: string | null }[] = [
    { label: 'Hit points', value: String(unit.HP) },
    { label: 'Shields', value: unit.Shields ? String(unit.Shields) : null },
    { label: 'Armor', value: String(unit.Armor) },
    { label: 'Damage', value: damage(unit) },
    {
      label: 'Attack speed',
      value: unit.AttackSpeed1 != null ? `${unit.AttackSpeed1}s` : null,
    },
    { label: 'Range', value: range(unit) },
    { label: 'Bonuses', value: unit.Bonuses },
    { label: 'Line of sight', value: String(unit.LOS) },
    { label: 'Speed', value: unit.Speed != null ? String(unit.Speed) : null },
    { label: 'Attacks', value: unit.AttacksGA },
  ];

  const costStats: { label: string; value: string | null }[] = [
    { label: 'Minerals', value: String(unit.Minerals) },
    { label: 'Vespene', value: unit.Vespene ? String(unit.Vespene) : null },
    { label: 'Supply', value: String(unit.Supply) },
    { label: 'Build time', value: `${unit.BuildTime}s` },
    { label: 'Builds from', value: unit.BuildsFrom },
    { label: 'Tech required', value: unit.TechRequired },
  ];

  const renderStats = (stats: { label: string; value: string | null }[]) =>
    stats
      .filter((s) => s.value != null && s.value !== '')
      .map((s) => <StatRow key={s.label} label={s.label} value={s.value as string} />);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
    >
      <View style={[styles.hero, { borderTopColor: accent }]}>
        <Image source={getUnitImage(unit)} style={styles.portrait} />
        <View style={styles.heroMeta}>
          <Text style={styles.name}>{unit.Name}</Text>
          <Badge label={unit.Race} color={accent} />
          {attributes ? <Text style={styles.attributes}>{attributes}</Text> : null}
          {unit.GroundAir ? <Text style={styles.subtle}>{unit.GroundAir}</Text> : null}
        </View>
      </View>

      <Section title="Combat" accentColor={accent}>
        {renderStats(combatStats)}
      </Section>

      <Section title="Cost & production">{renderStats(costStats)}</Section>

      <Section title="Description">
        <Paragraph>{unit.Description}</Paragraph>
      </Section>

      {unit.SpecialAbilities ? (
        <Section title="Special abilities">
          <Paragraph>{unit.SpecialAbilities}</Paragraph>
        </Section>
      ) : null}

      {unit.Upgrades ? (
        <Section title="Upgrades">
          <Paragraph>{unit.Upgrades}</Paragraph>
        </Section>
      ) : null}

      <Section title="Strong vs">
        <Paragraph>{unit.NaturalPrey}</Paragraph>
      </Section>

      <Section title="Weak vs">
        <Paragraph>{unit.NaturalEnemies}</Paragraph>
      </Section>

      <Section title="Uses">
        <Paragraph>{unit.Uses}</Paragraph>
      </Section>

      <Section title="Lore">
        <Paragraph>{unit.Lore}</Paragraph>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef0f5',
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderTopWidth: 4,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray,
  },
  portrait: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.black,
  },
  heroMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.black,
  },
  attributes: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.darkGray,
  },
  subtle: {
    fontSize: 13,
    color: colors.darkGray,
  },
});
