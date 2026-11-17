import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ATLAS } from '../src/lib/arcade/atlas.generated';
import { allSheets, PALETTE } from '../src/lib/pixel/puppets';
import { colorCount, Fig, INK, rasterize, ramp, type Sprite } from '../src/lib/pixel/raster';
import { drawFrame, LOOK_IDS, LOOKS, metaFor, packSheet } from '../src/lib/pixel/sheet';

const alpha = (s: Sprite, x: number, y: number) => s.rgba[(y * s.w + x) * 4 + 3];
const filled = (s: Sprite) => {
  let n = 0;
  for (let i = 3; i < s.rgba.length; i += 4) if (s.rgba[i]) n += 1;
  return n;
};
const isInk = (s: Sprite, i: number) => s.rgba[i * 4] === INK[0] && s.rgba[i * 4 + 1] === INK[1] && s.rgba[i * 4 + 2] === INK[2] && s.rgba[i * 4 + 3] === 255;

test('a color ramp runs dark to light', () => {
  const lum = (c: number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  for (const [key, hex] of Object.entries(PALETTE)) {
    const [dark, mid, light] = ramp(hex);
    assert.ok(lum(dark) < lum(mid) && lum(mid) < lum(light), key);
  }
});

test('the four looks differ only where they should', () => {
  const fig = new Fig();
  fig.part(() => fig.ell('teal', 12, 12, 7, 7));
  const s = (id: (typeof LOOK_IDS)[number]) => rasterize(fig.shapes, 24, 24, PALETTE, LOOKS[id]);
  // Flat fill is one color plus one line color. Shading adds two more.
  assert.equal(colorCount(s('thinFlat')), 2);
  assert.equal(colorCount(s('thinShaded')), 4);
  assert.equal(colorCount(s('thickFlat')), 2);
  // The thick line is two pixels of ink. The thin line is one pixel of a deep version of the fill.
  const thick = s('thickFlat');
  const thin = s('thinFlat');
  assert.ok(filled(thick) > filled(thin));
  let ink = 0;
  for (let i = 0; i < 24 * 24; i++) if (isInk(thin, i)) ink += 1;
  assert.equal(ink, 0, 'thin look uses no black ink');
});

test('every frame of every character fits inside its cell, in every look', () => {
  for (const sheet of allSheets()) {
    if (sheet.tile) continue;
    for (const lookId of LOOK_IDS) {
      for (let i = 0; i < sheet.frames.length; i++) {
        const s = drawFrame(sheet, i, LOOKS[lookId]);
        assert.ok(filled(s) > 8, `${sheet.id}/${sheet.frames[i].name} is not empty`);
        for (let x = 0; x < s.w; x++) assert.ok(!alpha(s, x, 0) && !alpha(s, x, s.h - 1), `${sheet.id}/${sheet.frames[i].name}/${lookId} touches the top or bottom edge`);
        for (let y = 0; y < s.h; y++) assert.ok(!alpha(s, 0, y) && !alpha(s, s.w - 1, y), `${sheet.id}/${sheet.frames[i].name}/${lookId} touches a side edge`);
      }
    }
  }
});

test('the palette stays small: no character uses more than 40 colors', () => {
  for (const sheet of allSheets()) {
    const { image } = packSheet(sheet, LOOKS.thinShaded);
    assert.ok(colorCount(image) <= 40, `${sheet.id} uses ${colorCount(image)} colors`);
  }
});

test('the frame list packed into the app matches the puppets', () => {
  const atlas = ATLAS as unknown as Record<string, unknown>;
  for (const sheet of allSheets()) assert.deepEqual(atlas[sheet.id], JSON.parse(JSON.stringify(metaFor(sheet))), `${sheet.id}: run "npm run sprites"`);
  assert.equal(Object.keys(atlas).length, allSheets().length);
});

test('backdrop tiles line up at their left and right edges', () => {
  const tiles = allSheets().filter((s) => s.tile);
  assert.ok(tiles.length >= 2, 'the dusk street and the Frontier Lands');
  for (const sheet of tiles) {
    for (let i = 0; i < sheet.frames.length; i++) {
      const s = drawFrame(sheet, i, LOOKS.thinFlat);
      let same = 0;
      for (let y = 0; y < s.h; y++) if (!!alpha(s, 0, y) === !!alpha(s, s.w - 1, y)) same += 1;
      assert.ok(same >= s.h - 3, `${sheet.id}/${sheet.frames[i].name}: left and right edges match on ${same} of ${s.h} rows`);
    }
  }
});
