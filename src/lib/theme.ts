/**
 * Neutral, high-contrast placeholder style.
 * The real neighborhood style will replace these values (see NORTH_STAR.md, "Visual style").
 * Every text/background pair below meets WCAG 2.2 AA (4.5:1) or better.
 */
export type Palette = {
  background: string;
  surface: string;
  surfaceStrong: string;
  border: string;
  text: string;
  textSecondary: string;
  primary: string;
  onPrimary: string;
  primarySoft: string;
  urgent: string;
  urgentSoft: string;
  notice: string;
  noticeSoft: string;
  good: string;
  goodSoft: string;
  sample: string;
  onSample: string;
};

export const light: Palette = {
  background: '#FFFFFF',
  surface: '#F3F5F2',
  surfaceStrong: '#E4E8E3',
  border: '#8A938D',
  text: '#17201B',
  textSecondary: '#46504A',
  primary: '#1E5A45',
  onPrimary: '#FFFFFF',
  primarySoft: '#DCEBE3',
  urgent: '#9B1C1C',
  urgentSoft: '#FBE4E4',
  notice: '#7A4B00',
  noticeSoft: '#FCEFD3',
  good: '#1E5A45',
  goodSoft: '#DCEBE3',
  sample: '#3B2A6B',
  onSample: '#FFFFFF',
};

export const dark: Palette = {
  background: '#101512',
  surface: '#1B231E',
  surfaceStrong: '#28332C',
  border: '#7C8880',
  text: '#F2F5F3',
  textSecondary: '#C3CCC6',
  primary: '#8FD3B4',
  onPrimary: '#0C241A',
  primarySoft: '#1F3A2E',
  urgent: '#FFB4AB',
  urgentSoft: '#4A1C1C',
  notice: '#F5CF7A',
  noticeSoft: '#3D2E0C',
  good: '#8FD3B4',
  goodSoft: '#1F3A2E',
  sample: '#CDBDFF',
  onSample: '#1E1440',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;

/** Minimum touch target on every interactive element. */
export const MIN_TOUCH = 48;

/** Base font sizes before the user's text-size setting is applied. */
export const fontSize = { small: 15, body: 17, lead: 19, title: 22, display: 28 } as const;

export const MAX_CONTENT_WIDTH = 640;
