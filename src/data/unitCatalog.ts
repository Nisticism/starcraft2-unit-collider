import type { ImageSourcePropType } from 'react-native';
import type { Race, Unit } from './types';
import { units } from './units';
import { getUnitImage } from './unitImages';

export interface CatalogEntry {
  id: number;
  name: string;
  race: Race;
  image: ImageSourcePropType;
  hp: number;
  minerals: number;
  vespene: number;
}

/** All selectable units (id + name + race + bundled image + headline stats), A→Z. */
export const unitCatalog: CatalogEntry[] = units
  .map((u) => ({
    id: u.unitID,
    name: u.Name,
    race: u.Race,
    image: getUnitImage(u),
    hp: u.HP,
    minerals: u.Minerals,
    vespene: u.Vespene,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** Fast lookup of a unit's race by name. */
export const raceByName: Record<string, Race> = Object.fromEntries(
  unitCatalog.map((u) => [u.name, u.race])
);

/** Full unit record keyed by `unitID` (for the detail screen). */
export const unitById: Record<number, Unit> = Object.fromEntries(units.map((u) => [u.unitID, u]));
