import { collide, computeAttack, getProfile, regenRate, unitProfiles } from '../index';
import { units } from '../../data/units';

describe('unit profiles coverage', () => {
  it('has a combat profile for every unit in the dataset', () => {
    for (const u of units) {
      expect(unitProfiles[u.Name]).toBeDefined();
    }
    expect(Object.keys(unitProfiles)).toHaveLength(71);
  });

  it('matches known StarCraft II base stats', () => {
    expect(getProfile('Marine').hp).toBe(45);
    expect(getProfile('Zealot').shields).toBe(50);
    expect(getProfile('Stalker').hp).toBe(80);
    expect(getProfile('Stalker').shields).toBe(80);
    expect(getProfile('Immortal').hp).toBe(200);
  });
});

describe('computeAttack', () => {
  const marine = getProfile('Marine');
  const marauder = getProfile('Marauder');
  const stalker = getProfile('Stalker');
  const immortal = getProfile('Immortal');

  it('computes basic damage after armor', () => {
    // Marine (0 att) vs Zealot: 6 to HP minus 1 armor = 5; 6 to shields.
    const a = computeAttack(marine, 0, getProfile('Zealot'), 0, 0);
    expect(a.damagePerHit).toBe(5);
    expect(a.shieldDamagePerHit).toBe(6);
    expect(a.attackInterval).toBeCloseTo(0.61, 3);
  });

  it('applies attribute bonuses per projectile', () => {
    // Marauder vs Stalker (Armored): base 10 + (5 x 2 shots) - (1 armor x 2) = 18.
    const a = computeAttack(marauder, 0, stalker, 0, 0);
    expect(a.damagePerHit).toBe(18);
    expect(a.shieldDamagePerHit).toBe(20);
  });

  it('applies large bonuses vs armored (Immortal)', () => {
    // Immortal vs Stalker: base 20 + 30 vs Armored - 1 armor = 49; shields 50.
    const a = computeAttack(immortal, 0, stalker, 0, 0);
    expect(a.damagePerHit).toBe(49);
    expect(a.shieldDamagePerHit).toBe(50);
  });

  it('scales with weapon upgrades', () => {
    // Zergling has 0 armor, so Marine deals its full 6 (then 9 at +3).
    const a0 = computeAttack(marine, 0, getProfile('Zergling'), 0, 0);
    const a3 = computeAttack(marine, 3, getProfile('Zergling'), 0, 0);
    expect(a0.damagePerHit).toBe(6);
    expect(a3.damagePerHit).toBe(9);
  });

  it('cannot attack a target it has no weapon for', () => {
    // Marauder has no anti-air weapon; Mutalisk is an air unit.
    const a = computeAttack(marauder, 0, getProfile('Mutalisk'), 0, 0);
    expect(a.canAttack).toBe(false);
  });

  it('lets anti-air weapons hit a Colossus (ground unit)', () => {
    const a = computeAttack(getProfile('Corruptor'), 0, getProfile('Colossus'), 0, 0);
    expect(a.canAttack).toBe(true);
    expect(a.usedWeapon).toBe('air');
  });
});

describe('regen', () => {
  it('models zerg and mutalisk regeneration', () => {
    expect(regenRate(getProfile('Zergling'))).toBeCloseTo(0.38);
    expect(regenRate(getProfile('Mutalisk'))).toBeCloseTo(1.4);
    expect(regenRate(getProfile('Marine'))).toBe(0);
  });
});

describe('collide', () => {
  it('mirror match is a tie', () => {
    const r = collide({ name: 'Marine' }, { name: 'Marine' });
    expect(r.winner).toBe('tie');
    expect(r.unit1.attack.damagePerHit).toBe(6);
    expect(r.unit1.timeToKill).toBeCloseTo(4.27, 2);
  });

  it('Marauder beats Marine and keeps most of its HP', () => {
    const r = collide({ name: 'Marauder' }, { name: 'Marine' });
    expect(r.winner).toBe('unit1');
    expect(r.unit1.survived).toBe(true);
    expect(r.unit2.survived).toBe(false);
    expect(r.unit1.remainingHp).toBe(85);
    expect(r.unit1.attacksDealt).toBe(5);
  });

  it('Zealot beats Marine', () => {
    const r = collide({ name: 'Marine' }, { name: 'Zealot' });
    expect(r.winner).toBe('unit2');
    expect(r.unit2.name).toBe('Zealot');
  });

  it('Immortal crushes Marauder (armored bonus)', () => {
    const r = collide({ name: 'Immortal' }, { name: 'Marauder' });
    expect(r.winner).toBe('unit1');
  });

  it('a unit that cannot be attacked back wins without losing HP', () => {
    // Medivac has no weapon; Marine can shoot it down.
    const r = collide({ name: 'Marine' }, { name: 'Medivac' });
    expect(r.winner).toBe('unit1');
    expect(r.unit1.remainingHp).toBe(getProfile('Marine').hp);
    expect(r.unit2.attack.canAttack).toBe(false);
  });

  it('two unarmed units cannot harm each other', () => {
    const r = collide({ name: 'Medivac' }, { name: 'Overlord' });
    expect(r.winner).toBe('tie');
    expect(r.summary).toMatch(/cannot harm each other/);
  });

  it('weapon upgrades change the outcome margin', () => {
    const base = collide({ name: 'Marine' }, { name: 'Roach' });
    const upgraded = collide({ name: 'Marine', attackUpgrades: 3 }, { name: 'Roach' });
    expect(upgraded.unit1.timeToKill!).toBeLessThan(base.unit1.timeToKill!);
  });
});
