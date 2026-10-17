import { units } from '../units';
import { everyUnitHasImage, getUnitImage, unitImagesById, unitImagesByName } from '../unitImages';

describe('unit images', () => {
  it('has a bundled image for every unit id', () => {
    expect(everyUnitHasImage).toBe(true);
    for (const unit of units) {
      expect(unitImagesById[unit.unitID]).toBeDefined();
    }
  });

  it('has a bundled image for every unit name', () => {
    for (const unit of units) {
      expect(unitImagesByName[unit.Name]).toBeDefined();
    }
  });

  it('exposes exactly 71 image entries', () => {
    expect(Object.keys(unitImagesById)).toHaveLength(71);
    expect(Object.keys(unitImagesByName)).toHaveLength(71);
  });

  it('getUnitImage resolves by id', () => {
    const adept = units.find((u) => u.Name === 'Adept')!;
    expect(getUnitImage(adept)).toBe(unitImagesById[1]);
  });
});
