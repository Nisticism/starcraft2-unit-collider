import { colors } from './colors';

export { colors } from './colors';
export type { AppColors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
} as const;

/** Accent color per race, reused across unit pickers, cards and results. */
export const raceColors = {
  Terran: colors.terran,
  Zerg: colors.zerg,
  Protoss: colors.protoss,
} as const;

export type RaceColorName = keyof typeof raceColors;
