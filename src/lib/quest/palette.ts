/**
 * Colors of the Critter Club game zone: wood and parchment, like a cozy pixel
 * farming game's menus (style brief). The zone keeps these colors in light and
 * dark mode, like a game screen. Every text pair is checked in tests.
 */
import type { Palette } from '../theme';

export const ZONE: Palette = {
  background: '#F3E2B8',
  surface: '#EAD39F',
  surfaceStrong: '#DCC089',
  border: '#7A5434',
  text: '#33241A',
  textSecondary: '#55402B',
  primary: '#6E4122',
  onPrimary: '#FFF6DC',
  primarySoft: '#F8EBC9',
  urgent: '#8E1E1E',
  urgentSoft: '#F6D9C2',
  notice: '#6A3F00',
  noticeSoft: '#F7E2A8',
  good: '#2C5A22',
  goodSoft: '#DCE6B5',
  sample: '#3B2A6B',
  onSample: '#FFFFFF',
};

/** Squarer corners than the rest of the app, for the pixel feel. */
export const ZONE_ROUNDNESS = 0.4;

/** Extra colors used only in the zone's own pieces (map, dialog box, experience bar). */
export const ZONE_EXTRA = {
  wood: '#7A4D2A',
  woodDark: '#4F2F18',
  gold: '#E6B84F',
  xp: '#3E8E5A',
  xpTrack: '#4F2F18',
  dialog: '#FFF6DC',
  spooky: '#4B2F5E',
  onSpooky: '#FFF6DC',
} as const;
