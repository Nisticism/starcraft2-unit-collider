import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResultPanel, UnitSelector, type UnitChoice } from '../components';
import { collide } from '../engine';
import { colors, spacing } from '../theme';

const defaultChoice = (name: string): UnitChoice => ({
  name,
  attackUpgrades: 0,
  armorUpgrades: 0,
  shieldUpgrades: 0,
});

export default function CompareScreen() {
  const insets = useSafeAreaInsets();
  const [unit1, setUnit1] = useState<UnitChoice>(() => defaultChoice('Marine'));
  const [unit2, setUnit2] = useState<UnitChoice>(() => defaultChoice('Zealot'));

  const result = useMemo(() => collide(unit1, unit2), [unit1, unit2]);

  const swap = () => {
    setUnit1(unit2);
    setUnit2(unit1);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      keyboardShouldPersistTaps="handled"
    >
      <UnitSelector title="Unit 1" value={unit1} onChange={setUnit1} />

      <View style={styles.vsRow}>
        <View style={styles.vsLine} />
        <Pressable style={styles.vsButton} onPress={swap} hitSlop={8}>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.swapHint}>tap to swap</Text>
        </Pressable>
        <View style={styles.vsLine} />
      </View>

      <UnitSelector title="Unit 2" value={unit2} onChange={setUnit2} />

      <ResultPanel result={result} />
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
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  vsLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray,
  },
  vsButton: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  swapHint: {
    fontSize: 10,
    color: colors.darkGray,
  },
});
