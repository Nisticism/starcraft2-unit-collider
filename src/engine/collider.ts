// Unit-vs-Unit combat engine ("collider").
//
// This is a clean, general re-implementation of the model in the original
// Android app's UnitVUnit.java (resultMaker/theModifiers). Rather than copying
// that file's ~1,500 lines of per-unit special-casing and closed-form regen
// approximations, it drives a small event simulation from the extracted
// per-unit combat profiles (see unitProfiles.ts). The well-defined exceptions
// the original hard-coded (spell units ignoring armor, Colossus being hit by
// air weapons, Widow Mine / Disruptor bonus vs shields, HP/shield regen) are
// preserved explicitly and documented below.
//
// Known deferred cases (require the "special modifier" spinner, which is not yet
// part of a Loadout): Stimpack/Charge/Guardian Shield and other activated
// abilities, Cyclone lock-on, Corruptor caustic spray, Queen/Thor fractional
// armor nuances. See MIGRATION_HANDOFF.md (port-engine / engine-refine).

import type {
  Attribute,
  AttackProfile,
  ColliderResult,
  Loadout,
  Scaled,
  SideOutcome,
  UnitProfile,
} from './types';
import { unitProfiles } from './unitProfiles';

/** Units whose attacks are "spell" damage and ignore the target's armor. */
const ARMOR_IGNORING = new Set(['Widow Mine', 'Disruptor', 'Oracle']);

/** Extra shield damage vs Protoss for a couple of special units. */
const SHIELD_BONUS_VS_PROTOSS: Record<string, number> = {
  'Widow Mine': 35,
  Disruptor: 55,
};

/** Resolve an upgrade-scaled value at the given upgrade levels. */
function resolve(s: Scaled, attUps: number, armUps: number): number {
  return s.base + (s.att ?? 0) * attUps + (s.arm ?? 0) * armUps;
}

/** HP regenerated per second (Mutalisks regenerate faster than other zerg). */
export function regenRate(p: UnitProfile): number {
  if (p.name === 'Mutalisk') return 1.4;
  return p.race === 'z' ? 0.38 : 0;
}

/** Look up a unit profile by name, throwing a helpful error if missing. */
export function getProfile(name: string): UnitProfile {
  const p = unitProfiles[name];
  if (!p) throw new Error(`Unknown unit: ${name}`);
  return p;
}

function clampUpgrade(n: number | undefined): number {
  if (!n || n < 0) return 0;
  return Math.min(3, Math.floor(n));
}

/**
 * Compute how `attacker` attacks `defender`, including weapon selection,
 * attribute bonuses, armor/shield reduction, and the documented exceptions.
 */
export function computeAttack(
  attacker: UnitProfile,
  attackerAttUps: number,
  defender: UnitProfile,
  defenderArmUps: number,
  defenderShieldUps: number
): AttackProfile {
  const none: AttackProfile = {
    canAttack: false,
    damagePerHit: 0,
    shieldDamagePerHit: 0,
    attackInterval: 0,
    dps: 0,
    usedWeapon: 'none',
  };

  const groundDmg = resolve(attacker.attVsGround, attackerAttUps, 0);
  const airDmg = resolve(attacker.attVsAir, attackerAttUps, 0);
  const defenderIsAir = !defender.isGround;
  const defenderIsColossus = defender.name === 'Colossus';

  let usedWeapon: 'ground' | 'air' | 'none' = 'none';
  if (defenderIsAir) {
    if (airDmg > 0) usedWeapon = 'air';
  } else if (groundDmg > 0) {
    usedWeapon = 'ground';
  } else if (defenderIsColossus && airDmg > 0) {
    // A Colossus is a ground unit that can also be hit by anti-air weapons.
    usedWeapon = 'air';
  }
  if (usedWeapon === 'none') return none;

  const base = usedWeapon === 'ground' ? groundDmg : airDmg;
  const bonusSet = usedWeapon === 'ground' ? attacker.bonusesGround : attacker.bonusesAir;

  // Attack interval: fall back to the ground interval when no separate air one.
  const interval =
    usedWeapon === 'air' ? attacker.attackSpeedVsAir || attacker.attackSpeed : attacker.attackSpeed;

  // Attribute bonuses apply once per projectile, like the original.
  let bonus = 0;
  for (const attr of defender.attributes) {
    const b = bonusSet[attr as Attribute];
    if (b) bonus += resolve(b, attackerAttUps, 0) * attacker.attackCount;
  }

  const defenderArmor = Math.max(0, resolve(defender.armor, 0, defenderArmUps));
  const armorReduction = defenderArmor * attacker.attackCount;

  let damagePerHit = ARMOR_IGNORING.has(attacker.name)
    ? base + bonus
    : base + bonus - armorReduction;
  damagePerHit = Math.max(1, damagePerHit);

  let shieldDamagePerHit = base + bonus - defenderShieldUps;
  if (defender.race === 'p' && SHIELD_BONUS_VS_PROTOSS[attacker.name]) {
    shieldDamagePerHit += SHIELD_BONUS_VS_PROTOSS[attacker.name];
  }
  shieldDamagePerHit = Math.max(1, shieldDamagePerHit);

  return {
    canAttack: true,
    damagePerHit,
    shieldDamagePerHit,
    attackInterval: interval || 0,
    dps: interval > 0 ? damagePerHit / interval : 0,
    usedWeapon,
  };
}

const SIM_TIME_CAP = 100000;

interface SimResult {
  killedAt: number | null;
  attacks: number;
  remainingHp: number;
  remainingShields: number;
}

/**
 * Simulate `atk` striking `defender` over time, with the defender's HP regen,
 * up to `maxTime`. Shields are depleted first (they do not regenerate here),
 * then HP. Returns when/if the defender dies and the state at the stopping point.
 */
function simulateAttack(atk: AttackProfile, defender: UnitProfile, maxTime: number): SimResult {
  let hp = defender.hp;
  let shields = defender.shields;
  if (!atk.canAttack || atk.attackInterval <= 0) {
    return { killedAt: null, attacks: 0, remainingHp: hp, remainingShields: shields };
  }
  const regen = regenRate(defender);
  // Net HP change per attack cycle once shields are down; if non-positive the
  // attacker can never finish the kill, so we stop early to avoid looping.
  const netPerCycle = atk.damagePerHit - regen * atk.attackInterval;

  let t = 0;
  let last = 0;
  let attacks = 0;
  while (t <= maxTime + 1e-9) {
    hp = Math.min(defender.hp, hp + regen * (t - last));
    last = t;
    if (shields > 0) {
      shields -= atk.shieldDamagePerHit;
      if (shields < 0) shields = 0;
    } else {
      hp -= atk.damagePerHit;
    }
    attacks += 1;
    if (hp <= 0) {
      return { killedAt: t, attacks, remainingHp: 0, remainingShields: 0 };
    }
    if (shields <= 0 && netPerCycle <= 1e-9) break; // unkillable (regen >= dps)
    t += atk.attackInterval;
  }
  // Accrue regen for any remaining time up to the cap we were asked to reach.
  if (maxTime > last && maxTime < SIM_TIME_CAP) {
    hp = Math.min(defender.hp, hp + regen * (maxTime - last));
  }
  return {
    killedAt: null,
    attacks,
    remainingHp: Math.max(0, Math.round(hp)),
    remainingShields: Math.max(0, Math.round(shields)),
  };
}

/** Death time = earliest of being killed in combat or expiring via lifespan. */
function deathTime(killedAt: number | null, lifespan: number | null): number {
  const killed = killedAt ?? Infinity;
  const expired = lifespan ?? Infinity;
  return Math.min(killed, expired);
}

/** Collide two units (each with their own upgrades) and resolve the 1v1. */
export function collide(a: Loadout, b: Loadout): ColliderResult {
  const pa = getProfile(a.name);
  const pb = getProfile(b.name);
  const aAtt = clampUpgrade(a.attackUpgrades);
  const aArm = clampUpgrade(a.armorUpgrades);
  const aShd = clampUpgrade(a.shieldUpgrades);
  const bAtt = clampUpgrade(b.attackUpgrades);
  const bArm = clampUpgrade(b.armorUpgrades);
  const bShd = clampUpgrade(b.shieldUpgrades);

  const aAttack = computeAttack(pa, aAtt, pb, bArm, bShd);
  const bAttack = computeAttack(pb, bAtt, pa, aArm, aShd);

  // How long each unit needs to kill the other (ignoring the return fire).
  const aKills = simulateAttack(aAttack, pb, SIM_TIME_CAP);
  const bKills = simulateAttack(bAttack, pa, SIM_TIME_CAP);

  const aDeath = deathTime(bKills.killedAt, pa.lifespan);
  const bDeath = deathTime(aKills.killedAt, pb.lifespan);

  let winner: 'unit1' | 'unit2' | 'tie';
  if (aDeath === bDeath) {
    winner = 'tie';
  } else if (aDeath > bDeath) {
    winner = 'unit1';
  } else {
    winner = 'unit2';
  }

  // Survivor state: simulate the loser's fire against the winner up to the
  // moment the loser dies, to read the winner's remaining HP/shields.
  let aOutHp = pa.hp;
  let aOutShields = pa.shields;
  let bOutHp = pb.hp;
  let bOutShields = pb.shields;
  let aAttacksDealt = aKills.attacks;
  let bAttacksDealt = bKills.attacks;

  if (winner === 'unit1' && Number.isFinite(bDeath)) {
    const survivor = simulateAttack(bAttack, pa, bDeath);
    aOutHp = survivor.remainingHp;
    aOutShields = survivor.remainingShields;
    bAttacksDealt = survivor.attacks;
    aAttacksDealt = aKills.killedAt != null ? aKills.attacks : survivor.attacks;
    bOutHp = 0;
    bOutShields = 0;
  } else if (winner === 'unit2' && Number.isFinite(aDeath)) {
    const survivor = simulateAttack(aAttack, pb, aDeath);
    bOutHp = survivor.remainingHp;
    bOutShields = survivor.remainingShields;
    aAttacksDealt = survivor.attacks;
    bAttacksDealt = bKills.killedAt != null ? bKills.attacks : survivor.attacks;
    aOutHp = 0;
    aOutShields = 0;
  }

  const unit1: SideOutcome = {
    name: pa.name,
    totalHp: pa.hp + pa.shields,
    remainingHp: winner === 'unit2' ? 0 : aOutHp,
    remainingShields: winner === 'unit2' ? 0 : aOutShields,
    survived: winner !== 'unit2',
    attacksDealt: aAttacksDealt,
    timeToKill: aKills.killedAt,
    attack: aAttack,
  };
  const unit2: SideOutcome = {
    name: pb.name,
    totalHp: pb.hp + pb.shields,
    remainingHp: winner === 'unit1' ? 0 : bOutHp,
    remainingShields: winner === 'unit1' ? 0 : bOutShields,
    survived: winner !== 'unit1',
    attacksDealt: bAttacksDealt,
    timeToKill: bKills.killedAt,
    attack: bAttack,
  };

  return { unit1, unit2, winner, summary: buildSummary(unit1, unit2, winner) };
}

function buildSummary(
  unit1: SideOutcome,
  unit2: SideOutcome,
  winner: 'unit1' | 'unit2' | 'tie'
): string {
  if (winner === 'tie') {
    if (!unit1.attack.canAttack && !unit2.attack.canAttack) {
      return `${unit1.name} and ${unit2.name} cannot harm each other.`;
    }
    return `${unit1.name} and ${unit2.name} destroy each other.`;
  }
  const win = winner === 'unit1' ? unit1 : unit2;
  const lose = winner === 'unit1' ? unit2 : unit1;
  const hp = win.remainingHp + win.remainingShields;
  return `${win.name} defeats ${lose.name} with ${hp} HP remaining.`;
}
