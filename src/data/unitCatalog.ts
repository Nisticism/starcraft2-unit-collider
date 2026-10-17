import type { ImageSourcePropType } from 'react-native';
import type { Race } from './types';
import { units } from './units';
import { getUnitImage } from './unitImages';

export interface CatalogEntry {
  name: string;
  race: Race;
  image: ImageSourcePropType;
}

/** All selectable units (name + race + bundled image), sorted alphabetically. */
export const unitCatalog: CatalogEntry[] = units
  .map((u) => ({ name: u.Name, race: u.Race, image: getUnitImage(u) }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** Fast lookup of a unit's race by name. */
export const raceByName: Record<string, Race> = Object.fromEntries(
  unitCatalog.map((u) => [u.name, u.race])
);
