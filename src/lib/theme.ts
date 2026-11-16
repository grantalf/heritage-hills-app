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
  border: '#78827B',
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

/**
 * Three style directions to react to, plus the neutral placeholder.
 * The neighborhood has no official style yet. These exist so residents and the
 * board can try each one on real screens before choosing (decision D-022).
 * Every palette is checked for contrast in tests/contrast.test.ts.
 */
export type LookId = 'neutral' | 'warm' | 'civic' | 'wildflower';

export type Look = {
  id: LookId;
  light: Palette;
  dark: Palette;
  /** Multiplies corner roundness. */
  roundness: number;
  /** Headings use a serif typeface when true. */
  serifHeadings: boolean;
};

const shared = {
  light: {
    urgent: '#9B1C1C',
    urgentSoft: '#FBE4E4',
    notice: '#7A4B00',
    noticeSoft: '#FCEFD3',
    sample: '#3B2A6B',
    onSample: '#FFFFFF',
  },
  dark: {
    urgent: '#FFB4AB',
    urgentSoft: '#4A1C1C',
    notice: '#F5CF7A',
    noticeSoft: '#3D2E0C',
    sample: '#CDBDFF',
    onSample: '#1E1440',
  },
} as const;

export const LOOKS: Record<LookId, Look> = {
  neutral: { id: 'neutral', light, dark, roundness: 1, serifHeadings: false },

  /** Warm Community: terracotta and cream, soft corners, serif headings. Feels like a front porch. */
  warm: {
    id: 'warm',
    roundness: 1.4,
    serifHeadings: true,
    light: {
      ...shared.light,
      background: '#FFFBF5',
      surface: '#F6EDE1',
      surfaceStrong: '#EADCC8',
      border: '#8C7B66',
      text: '#2A1E14',
      textSecondary: '#5B4A3A',
      primary: '#9A3B1B',
      onPrimary: '#FFFFFF',
      primarySoft: '#F8E1D4',
      good: '#2F5D3A',
      goodSoft: '#DFEEDD',
    },
    dark: {
      ...shared.dark,
      background: '#1A1410',
      surface: '#261D16',
      surfaceStrong: '#35291F',
      border: '#9A8672',
      text: '#F7EFE6',
      textSecondary: '#D2C2B0',
      primary: '#F2A07B',
      onPrimary: '#3A1505',
      primarySoft: '#4A2414',
      good: '#9FD3A8',
      goodSoft: '#1F3A26',
    },
  },

  /** Clean Civic: navy and cool gray, crisp corners. Feels official and calm. */
  civic: {
    id: 'civic',
    roundness: 0.45,
    serifHeadings: false,
    light: {
      ...shared.light,
      background: '#FFFFFF',
      surface: '#F1F4F9',
      surfaceStrong: '#DFE6F0',
      border: '#7F8A99',
      text: '#111827',
      textSecondary: '#414B5A',
      primary: '#1D4E89',
      onPrimary: '#FFFFFF',
      primarySoft: '#DCE8F6',
      good: '#1E5A45',
      goodSoft: '#DCEBE3',
    },
    dark: {
      ...shared.dark,
      background: '#0E131B',
      surface: '#18202B',
      surfaceStrong: '#243040',
      border: '#7C8898',
      text: '#F1F4F8',
      textSecondary: '#BEC8D6',
      primary: '#9CC3F0',
      onPrimary: '#0A2444',
      primarySoft: '#1A3352',
      good: '#8FD3B4',
      goodSoft: '#1F3A2E',
    },
  },

  /** Texas Wildflower: bluebonnet blue on limestone, with meadow green. Feels rooted in this land. */
  wildflower: {
    id: 'wildflower',
    roundness: 1.15,
    serifHeadings: false,
    light: {
      ...shared.light,
      background: '#FFFFFF',
      surface: '#F4F2EC',
      surfaceStrong: '#E6E2D6',
      border: '#8A8676',
      text: '#1C1B22',
      textSecondary: '#4B4A55',
      primary: '#2F3E9E',
      onPrimary: '#FFFFFF',
      primarySoft: '#E3E6F8',
      good: '#2E6B3E',
      goodSoft: '#E0EFDF',
    },
    dark: {
      ...shared.dark,
      background: '#121218',
      surface: '#1C1C25',
      surfaceStrong: '#2A2A36',
      border: '#86859A',
      text: '#F3F2F8',
      textSecondary: '#C6C5D4',
      primary: '#AEB8FF',
      onPrimary: '#141C5A',
      primarySoft: '#272E66',
      good: '#9FD3A8',
      goodSoft: '#1F3A26',
    },
  },
};

export const LOOK_IDS: LookId[] = ['neutral', 'warm', 'civic', 'wildflower'];
