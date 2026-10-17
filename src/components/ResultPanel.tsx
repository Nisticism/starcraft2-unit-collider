import { StyleSheet, Text, View } from 'react-native';
import type { ColliderResult, SideOutcome } from '../engine/types';
import { raceByName } from '../data/unitCatalog';
import { colors, raceColors, radius, spacing } from '../theme';
import { Card } from './Card';
import { StatRow } from './StatRow';

type Props = {
  result: ColliderResult;
};

function accentFor(name: string): string {
  const race = raceByName[name];
  return race ? raceColors[race] : colors.primary;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function SideColumn({ side, isWinner }: { side: SideOutcome; isWinner: boolean }) {
  const accent = accentFor(side.name);
  const atk = side.attack;
  return (
    <View style={styles.column}>
      <Text style={[styles.sideName, { color: accent }]} numberOfLines={1}>
        {side.name}
      </Text>
      <Text style={[styles.badge, isWinner ? styles.badgeWin : styles.badgeLose]}>
        {isWinner ? 'Survives' : 'Defeated'}
      </Text>

      {atk.canAttack ? (
        <>
          <StatRow label="Damage / hit" value={fmt(atk.damagePerHit)} />
          {side.attack.shieldDamagePerHit !== atk.damagePerHit ? (
            <StatRow label="Vs shields" value={fmt(atk.shieldDamagePerHit)} />
          ) : null}
          <StatRow label="DPS" value={fmt(atk.dps)} />
          <StatRow
            label="Time to kill"
            value={side.timeToKill != null ? `${fmt(side.timeToKill)}s` : '—'}
          />
          <StatRow label="Attacks landed" value={String(side.attacksDealt)} />
        </>
      ) : (
        <Text style={styles.cannot}>Cannot attack this target</Text>
      )}

      {isWinner ? (
        <StatRow
          label="HP left"
          value={`${side.remainingHp}${side.remainingShields ? ` (+${side.remainingShields})` : ''}`}
          valueColor={colors.darkGreen}
        />
      ) : null}
    </View>
  );
}

/** Renders the outcome of a 1v1 collision: winner banner + per-unit stat columns. */
export function ResultPanel({ result }: Props) {
  const { unit1, unit2, winner, summary } = result;
  const bannerColor =
    winner === 'tie' ? colors.darkGray : accentFor(winner === 'unit1' ? unit1.name : unit2.name);

  return (
    <Card style={styles.card}>
      <View style={[styles.banner, { backgroundColor: bannerColor }]}>
        <Text style={styles.bannerText}>{summary}</Text>
      </View>
      <View style={styles.columns}>
        <SideColumn side={unit1} isWinner={winner !== 'unit2'} />
        <View style={styles.divider} />
        <SideColumn side={unit2} isWinner={winner !== 'unit1'} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    gap: 0,
  },
  banner: {
    padding: spacing.md,
  },
  bannerText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  columns: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  column: {
    flex: 1,
    gap: spacing.xs,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray,
  },
  sideName: {
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  badgeWin: {
    backgroundColor: colors.lightGreen,
    color: colors.darkerGreen,
  },
  badgeLose: {
    backgroundColor: colors.lightRed,
    color: colors.white,
  },
  cannot: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.darkGray,
  },
});
