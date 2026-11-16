import assert from 'node:assert/strict';
import { test } from 'node:test';

import { LOOK_IDS, LOOKS, type Palette } from '../src/lib/theme';

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Every pair of text color and background the components actually use. */
const TEXT_PAIRS: [keyof Palette, keyof Palette][] = [
  ['text', 'background'],
  ['text', 'surface'],
  ['text', 'surfaceStrong'],
  ['text', 'primarySoft'],
  ['text', 'urgentSoft'],
  ['text', 'noticeSoft'],
  ['text', 'goodSoft'],
  ['textSecondary', 'background'],
  ['textSecondary', 'surface'],
  ['textSecondary', 'primarySoft'],
  ['textSecondary', 'urgentSoft'],
  ['textSecondary', 'noticeSoft'],
  ['textSecondary', 'goodSoft'],
  ['primary', 'background'],
  ['primary', 'surface'],
  ['primary', 'primarySoft'],
  ['onPrimary', 'primary'],
  ['urgent', 'background'],
  ['urgent', 'urgentSoft'],
  ['notice', 'noticeSoft'],
  ['good', 'goodSoft'],
  ['good', 'surface'],
  ['onSample', 'sample'],
];

/** Outlines of controls need 3:1 against what is around them (WCAG 1.4.11). */
const UI_PAIRS: [keyof Palette, keyof Palette][] = [
  ['border', 'background'],
  ['border', 'surface'],
];

for (const id of LOOK_IDS) {
  for (const mode of ['light', 'dark'] as const) {
    test(`${id} ${mode}: text contrast is at least 4.5 to 1`, () => {
      const p = LOOKS[id][mode];
      for (const [fg, bg] of TEXT_PAIRS) {
        const ratio = contrast(p[fg], p[bg]);
        assert.ok(ratio >= 4.5, `${id} ${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}`);
      }
    });
    test(`${id} ${mode}: control outlines are at least 3 to 1`, () => {
      const p = LOOKS[id][mode];
      for (const [fg, bg] of UI_PAIRS) {
        const ratio = contrast(p[fg], p[bg]);
        assert.ok(ratio >= 3, `${id} ${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}`);
      }
    });
  }
}
