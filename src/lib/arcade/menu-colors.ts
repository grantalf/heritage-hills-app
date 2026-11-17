/** Wood-and-parchment menu colors (style brief). Text pairs are checked for contrast in tests. */
export const MENU = {
  wood: '#7a4d2a',
  woodDark: '#4f2f18',
  woodLight: '#a8713f',
  parchment: '#f3e2b8',
  parchmentDeep: '#e3cc98',
  ink: '#3b2a1a',
  inkSoft: '#5c4630',
  teal: '#1f7f76',
  gold: '#e6b84f',
} as const;

/** Text color on background color, as used by the menu sample. */
export const MENU_TEXT_PAIRS: [keyof typeof MENU, keyof typeof MENU][] = [
  ['ink', 'parchment'],
  ['ink', 'parchmentDeep'],
  ['inkSoft', 'parchment'],
  ['parchment', 'wood'],
  ['parchment', 'woodDark'],
];
