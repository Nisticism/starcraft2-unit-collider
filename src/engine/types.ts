// Engine types for the Unit-vs-Unit "collider".
// See MIGRATION_HANDOFF.md (port-engine) for how these map to the original
// Android app's UnitVUnit.java model.

/** Race tag as used by the original engine: terran, zerg, protoss. */
export type RaceTag = 't' | 'z' | 'p';

/**
 * Unit attribute tags (StarCraft II "armor types" / flags) as single letters:
 * A = Armored, L = Light, B = Biological, M = Massive, S = Structure,
 * P = Psionic, X = Mechanical (the original used "X" for Mechanical).
 */
export type Attribute = 'A' | 'L' | 'B' | 'M' | 'S' | 'P' | 'X';

/**
 * An upgrade-scaled numeric value:
 *   value = base + (att ?? 0) * attackUpgradeLevel + (arm ?? 0) * armorUpgradeLevel
 * `att` scales with weapon/attack upgrades, `arm` with armor upgrades.
 */
export interface Scaled {
  base: number;
  att?: number;
  arm?: number;
}

/** A unit's authoritative combat stats (extracted from UnitVUnit.generalSetter). */
export interface UnitProfile {
  name: string;
  race: RaceTag;
  hp: number;
  /** Protoss shield points (0 for non-shielded units). */
  shields: number;
  /** Armor, scaled by armor upgrades. */
  armor: Scaled;
  /** Damage vs ground targets (total per attack volley), scaled by attack upgrades. */
  attVsGround: Scaled;
  /** Damage vs air targets (total per attack volley), scaled by attack upgrades. */
  attVsAir: Scaled;
  /** Seconds between attacks vs ground (0 means the unit has no ground attack). */
  attackSpeed: number;
  /** Seconds between attacks vs air (0 means "same as attackSpeed" or no air attack). */
  attackSpeedVsAir: number;
  /** Number of projectiles per attack; armor is applied once per projectile. */
  attackCount: number;
  isGround: boolean;
  /** Concatenated {@link Attribute} letters, e.g. "LB" for Light + Biological. */
  attributes: string;
  /** Lifespan in seconds for temporary units (null = permanent). */
  lifespan: number | null;
  /** Bonus damage vs ground targets, per attribute, scaled by attack upgrades. */
  bonusesGround: Partial<Record<Attribute, Scaled>>;
  /** Bonus damage vs air targets, per attribute, scaled by attack upgrades. */
  bonusesAir: Partial<Record<Attribute, Scaled>>;
}

/** A unit selection plus its chosen upgrade levels (0-3 in StarCraft II). */
export interface Loadout {
  name: string;
  attackUpgrades?: number;
  armorUpgrades?: number;
  shieldUpgrades?: number;
}

/** How one unit attacks the other. */
export interface AttackProfile {
  canAttack: boolean;
  /** Damage dealt to the opponent's HP per attack (after armor, min 1). */
  damagePerHit: number;
  /** Damage dealt to the opponent's shields per attack (after shield upgrades, min 1). */
  shieldDamagePerHit: number;
  /** Seconds between attacks against this specific opponent. */
  attackInterval: number;
  /** Damage per second vs the opponent's HP (ignoring shields/regen). */
  dps: number;
  /** Which weapon was used against this opponent. */
  usedWeapon: 'ground' | 'air' | 'none';
}

/** Per-unit outcome of a 1v1. */
export interface SideOutcome {
  name: string;
  /** HP + shields at the start of the fight. */
  totalHp: number;
  /** HP remaining if this unit survived (0 if it died). */
  remainingHp: number;
  /** Shields remaining if this unit survived. */
  remainingShields: number;
  survived: boolean;
  /** Number of attacks this unit landed before the fight ended. */
  attacksDealt: number;
  /** Seconds for this unit to kill the opponent (null if it cannot). */
  timeToKill: number | null;
  attack: AttackProfile;
}

/** Full result of colliding two units. */
export interface ColliderResult {
  unit1: SideOutcome;
  unit2: SideOutcome;
  winner: 'unit1' | 'unit2' | 'tie';
  /** Human-readable one-line summary. */
  summary: string;
}
