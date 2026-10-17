import { units } from '../units';
import type { Race, Unit } from '../types';

const RACES: Race[] = ['Protoss', 'Terran', 'Zerg'];

// Columns that must be present (non-null) for every unit, based on the
// original units_table data. Keeps the extraction honest if data is regenerated.
const REQUIRED_KEYS: (keyof Unit)[] = [
  'unitID',
  'Name',
  'HP',
  'Armor',
  'Supply',
  'Minerals',
  'Vespene',
  'BuildTime',
  'LOS',
  'unitSize',
  'SpecialAbilities',
  'TechRequired',
  'NaturalEnemies',
  'NaturalPrey',
  'Race',
  'Description',
  'Uses',
  'Lore',
  'GroundAir',
  'BuildsFrom',
  'Lifespan',
  'Attributes',
];

describe('units data', () => {
  it('contains all 71 units from the original database', () => {
    expect(units).toHaveLength(71);
  });

  it('has unique, contiguous ids from 1 to 71', () => {
    const ids = units.map((u) => u.unitID).sort((a, b) => a - b);
    expect(new Set(ids).size).toBe(units.length);
    expect(ids[0]).toBe(1);
    expect(ids[ids.length - 1]).toBe(71);
  });

  it('exposes exactly the 50 original columns per unit', () => {
    for (const unit of units) {
      expect(Object.keys(unit)).toHaveLength(50);
    }
  });

  it('only uses the three StarCraft II races', () => {
    for (const unit of units) {
      expect(RACES).toContain(unit.Race);
    }
  });

  it('has non-null required fields for every unit', () => {
    for (const unit of units) {
      for (const key of REQUIRED_KEYS) {
        expect(unit[key]).not.toBeNull();
        expect(unit[key]).not.toBeUndefined();
      }
    }
  });

  it('keeps a few known reference values intact', () => {
    const adept = units.find((u) => u.Name === 'Adept');
    expect(adept).toBeDefined();
    expect(adept?.unitID).toBe(1);
    expect(adept?.HP).toBe(70);
    expect(adept?.Shields).toBe(70);
    expect(adept?.Race).toBe('Protoss');
    expect(adept?.Bonuses).toBe('+12 vs Light');

    const zergling = units.find((u) => u.Name === 'Zergling');
    expect(zergling?.unitID).toBe(71);
    expect(zergling?.Race).toBe('Zerg');
  });
});
