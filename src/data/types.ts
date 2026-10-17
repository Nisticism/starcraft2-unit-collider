// AUTO-GENERATED from the original Android app's DatabaseHelper.java
// (Starcraft2UnitCollider, origin/master @ a900c91). Do not edit by hand;
// see MIGRATION_HANDOFF.md (extract-unit-data / define-types).

/** Playable races represented in the unit database. */
export type Race = 'Protoss' | 'Terran' | 'Zerg';

/**
 * A single StarCraft II unit, mirroring the 50 columns of the original
 * `units_table`. Numeric columns use `number`; descriptive columns use `string`.
 * Columns that are absent for some units are typed as nullable.
 */
export interface Unit {
  /** Primary key (1-71), matches the original units_table row id. */
  unitID: number;
  /** Display name of the unit. */
  Name: string;
  /**
   * True if this unit has been removed from the live game. Removed units are kept
   * (never deleted) and flagged here; set during `update-unit-data` from the audit.
   */
  legacy?: boolean;
  /** Short note on legacy status (e.g. the patch/version that removed the unit). */
  legacyNote?: string;
  /** Image id placeholder from the original DB (always null here; images are mapped separately). */
  Pic1: number | null;
  /** Hit points. */
  HP: number;
  /** Primary weapon damage per hit. */
  Dmg1: number | null;
  /** Secondary weapon damage per hit. */
  Dmg2: number | null;
  /** Base armor value. */
  Armor: number;
  /** Cargo/transport space the unit occupies. */
  Cargo: number | null;
  /** Supply cost. */
  Supply: number;
  /** Mineral cost. */
  Minerals: number;
  /** Vespene gas cost. */
  Vespene: number;
  /** Build time in seconds. */
  BuildTime: number;
  /** Movement speed. */
  Speed: number | null;
  /** Primary weapon attack period (seconds between attacks). */
  AttackSpeed1: number | null;
  /** Secondary weapon attack period (seconds between attacks). */
  AttackSpeed2: number | null;
  /** Bonus damage text (e.g. '+12 vs Light'). */
  Bonuses: string | null;
  /** Attack range vs ground targets (text; may include upgrade notes). */
  RangeVsGround: string | null;
  /** Attack range vs air targets (text; may include upgrade notes). */
  RangeVsAir: string | null;
  /** Line of sight / vision radius. */
  LOS: number;
  /** Secondary line of sight text (e.g. with an ability active). */
  LOS2: string | null;
  /** Unit footprint/size (text; e.g. '1.0', '2x2'). */
  unitSize: string;
  /** Available upgrades text. */
  Upgrades: string | null;
  /** Special abilities text. */
  SpecialAbilities: string;
  /** Max energy text. */
  Energy: string | null;
  /** Tech/building required to produce the unit. */
  TechRequired: string;
  /** Protoss shield points. */
  Shields: number | null;
  /** Warpgate cooldown in seconds (Protoss). */
  WarpgateCooldown: number | null;
  /** Secondary movement speed text (e.g. with an ability active). */
  Speed2: string | null;
  /** Units this unit is weak against (comma-separated text). */
  NaturalEnemies: string;
  /** Units this unit is strong against (comma-separated text). */
  NaturalPrey: string;
  /** Owning race. */
  Race: Race;
  /** Short description shown in the database screen. */
  Description: string;
  /** Strategic uses write-up. */
  Uses: string;
  /** Lore / background text. */
  Lore: string;
  /** Whether the unit is Ground, Air, etc. */
  GroundAir: string;
  /** Structure(s) the unit is built/warped from. */
  BuildsFrom: string;
  /** What the unit can attack (Ground/Air). */
  AttacksGA: string | null;
  /** Lifespan text (e.g. 'Until destroyed'). */
  Lifespan: string;
  /** Attribute tags text (e.g. 'BL' for Biological/Light). */
  Attributes: string;
  /** Energy cost of the unit's primary ability. */
  EnergyCost: number | null;
  /** Special/derived primary damage text. */
  SpecialDmg1: string | null;
  /** Special/derived secondary damage text. */
  SpecialDmg2: string | null;
  /** Special/derived primary DPS text. */
  SpecialDPS1: string | null;
  /** Special/derived secondary DPS text. */
  SpecialDPS2: string | null;
  /** Secondary HP text (alternate mode). */
  HP2: string | null;
  /** Secondary armor text (alternate mode). */
  Armor2: string | null;
  /** Attack speed description text. */
  ASString: string | null;
  /** Splash damage radius. */
  SplashRadius: number | null;
  /** Number of attacks per primary attack (text). */
  AttackCount: string | null;
  /** Number of attacks per secondary attack (text). */
  AttackCount2: string | null;
}
