import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { raceByName, unitCatalog } from '../data/unitCatalog';
import type { Race } from '../data/types';
import { colors, raceColors, radius, spacing } from '../theme';
import { Card } from './Card';
import { SegmentedControl } from './SegmentedControl';
import { SelectModal, type SelectItem } from './SelectModal';
import { UpgradeStepper } from './UpgradeStepper';

export interface UnitChoice {
  name: string;
  attackUpgrades: number;
  armorUpgrades: number;
  shieldUpgrades: number;
}

type RaceFilter = 'All' | Race;

type Props = {
  title: string;
  value: UnitChoice;
  onChange: (next: UnitChoice) => void;
};

const RACE_FILTERS: { value: RaceFilter; label: string; activeColor?: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Terran', label: 'Terran', activeColor: raceColors.Terran },
  { value: 'Zerg', label: 'Zerg', activeColor: raceColors.Zerg },
  { value: 'Protoss', label: 'Protoss', activeColor: raceColors.Protoss },
];

/** Race filter + unit picker + portrait + upgrade steppers for one side of a matchup. */
export function UnitSelector({ title, value, onChange }: Props) {
  const race = raceByName[value.name];
  const [filter, setFilter] = useState<RaceFilter>('All');
  const [pickerOpen, setPickerOpen] = useState(false);

  const current = unitCatalog.find((u) => u.name === value.name);
  const accent = race ? raceColors[race] : colors.primary;

  const items: SelectItem[] = useMemo(
    () =>
      unitCatalog
        .filter((u) => filter === 'All' || u.race === filter)
        .map((u) => ({
          value: u.name,
          label: u.name,
          image: u.image,
          accentColor: raceColors[u.race],
        })),
    [filter]
  );

  return (
    <Card accentColor={accent}>
      <Text style={styles.title}>{title}</Text>

      <SegmentedControl options={RACE_FILTERS} value={filter} onChange={setFilter} />

      <Pressable style={styles.unitField} onPress={() => setPickerOpen(true)}>
        {current ? <Image source={current.image} style={styles.portrait} /> : null}
        <View style={styles.unitMeta}>
          <Text style={styles.unitName}>{value.name}</Text>
          {race ? <Text style={[styles.unitRace, { color: accent }]}>{race}</Text> : null}
        </View>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <View style={styles.upgrades}>
        <UpgradeStepper
          label="Attack"
          value={value.attackUpgrades}
          accentColor={accent}
          onChange={(v) => onChange({ ...value, attackUpgrades: v })}
        />
        <UpgradeStepper
          label="Armor"
          value={value.armorUpgrades}
          accentColor={accent}
          onChange={(v) => onChange({ ...value, armorUpgrades: v })}
        />
        {race === 'Protoss' ? (
          <UpgradeStepper
            label="Shields"
            value={value.shieldUpgrades}
            accentColor={accent}
            onChange={(v) => onChange({ ...value, shieldUpgrades: v })}
          />
        ) : null}
      </View>

      <SelectModal
        visible={pickerOpen}
        title={title}
        items={items}
        selectedValue={value.name}
        searchable
        onSelect={(name) => onChange({ ...value, name })}
        onClose={() => setPickerOpen(false)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.darkGray,
  },
  unitField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: '#f6f7fb',
  },
  portrait: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.black,
  },
  unitMeta: {
    flex: 1,
  },
  unitName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  unitRace: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: colors.darkGray,
    paddingHorizontal: spacing.xs,
  },
  upgrades: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
