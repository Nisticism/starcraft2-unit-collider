import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SearchBar, SegmentedControl, UnitListItem } from '../components';
import type { Race } from '../data/types';
import { unitCatalog } from '../data/unitCatalog';
import type { RootStackParamList } from '../navigation/types';
import { colors, raceColors, spacing } from '../theme';

type RaceFilter = 'All' | Race;

const RACE_FILTERS: { value: RaceFilter; label: string; activeColor?: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Terran', label: 'Terran', activeColor: raceColors.Terran },
  { value: 'Zerg', label: 'Zerg', activeColor: raceColors.Zerg },
  { value: 'Protoss', label: 'Protoss', activeColor: raceColors.Protoss },
];

export default function DatabaseScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<RaceFilter>('All');
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return unitCatalog.filter(
      (u) =>
        (filter === 'All' || u.race === filter) && (q === '' || u.name.toLowerCase().includes(q))
    );
  }, [filter, query]);

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={data}
      keyExtractor={(u) => String(u.id)}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListHeaderComponent={
        <View style={styles.header}>
          <SegmentedControl options={RACE_FILTERS} value={filter} onChange={setFilter} />
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search units…" />
          <Text style={styles.count}>
            {data.length} unit{data.length === 1 ? '' : 's'}
          </Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No units match your search.</Text>}
      renderItem={({ item }) => (
        <UnitListItem
          image={item.image}
          name={item.name}
          raceLabel={item.race}
          raceColor={raceColors[item.race]}
          trailing={`${item.hp} HP`}
          onPress={() => navigation.navigate('UnitDetail', { unitId: item.id })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef0f5',
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  count: {
    fontSize: 12,
    color: colors.darkGray,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: colors.darkGray,
    marginTop: spacing.xl,
  },
});
