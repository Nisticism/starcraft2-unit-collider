/**
 * Color palette carried over from the original Android app
 * (app/src/main/res/values/colors.xml) so the rewrite keeps its visual identity.
 */
export const colors = {
  primary: '#3F51B5',
  primaryDark: '#303F9F',
  accent: '#FF4081',
  orange: '#EEA401',

  // Race / result accents
  terran: '#184b87',
  protoss: '#EEA401',
  zerg: '#4b8772',

  lightGreen: '#90ee90',
  darkGreen: '#0b5e0f',
  darkerGreen: '#0e330e',
  superDarkGreen: '#081e08',

  lightBlue: '#ADD8E6',
  lightBlue2: '#8faef7',
  pearlyBlue: '#213266',
  lighterPearlyBlue: '#184b87',
  deepPurple: '#240371',
  deeperPurple: '#10124c',

  lightRed: '#fa8072',

  black: '#000000',
  white: '#ffffff',
  gray: '#bababa',
  darkGray: '#545454',
} as const;

export type AppColors = typeof colors;
