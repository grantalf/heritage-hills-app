/**
 * Draws every field guide animal and sample pet as a pixel critter (block 3).
 *   npm run critters
 * Writes:
 *   assets/game/critters/critters.png and shadows.png and critters.json   standard sheets
 *   src/lib/quest/critters.generated.ts                                   the images, packed into the app
 * Only look D (thick outline, shaded), the founder's pick (D-074).
 * Art from an artist: put critters.png in art/overrides/critters/ with the same cells and order.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { critterArt, petArt } from '../src/lib/data/game-art.ts';
import { CRITTER_CELL, critterPixels, shadowOf } from '../src/lib/quest/critter-puppet.ts';
import type { Sprite } from '../src/lib/pixel/raster.ts';
import { enlarge, LOOKS } from '../src/lib/pixel/sheet.ts';
import { png } from './png.mts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const STORE_SCALE = 3;
const COLS = 8;
const look = LOOKS.thickShaded;

const specs = { ...critterArt, ...petArt };
const ids = Object.keys(specs);
const rows = Math.ceil(ids.length / COLS);
const w = COLS * CRITTER_CELL;
const h = rows * CRITTER_CELL;

function pack(make: (id: string) => Sprite): Sprite {
  const rgba = new Uint8Array(w * h * 4);
  ids.forEach((id, i) => {
    const s = make(id);
    const ox = (i % COLS) * CRITTER_CELL;
    const oy = Math.floor(i / COLS) * CRITTER_CELL;
    for (let y = 0; y < CRITTER_CELL; y++) rgba.set(s.rgba.subarray(y * CRITTER_CELL * 4, (y + 1) * CRITTER_CELL * 4), ((oy + y) * w + ox) * 4);
  });
  return { w, h, rgba };
}

const drawn = new Map(ids.map((id) => [id, critterPixels(specs[id], look)]));
const dir = join(root, 'assets/game/critters');
mkdirSync(dir, { recursive: true });
const override = join(root, 'art/overrides/critters/critters.png');
const main = existsSync(override) ? readFileSync(override) : png(enlarge(pack((id) => drawn.get(id)!), STORE_SCALE));
const shadow = png(enlarge(pack((id) => shadowOf(drawn.get(id)!)), STORE_SCALE));
writeFileSync(join(dir, 'critters.png'), main);
writeFileSync(join(dir, 'shadows.png'), shadow);
const index = Object.fromEntries(ids.map((id, i) => [id, i]));
writeFileSync(join(dir, 'critters.json'), JSON.stringify({ cell: CRITTER_CELL, scale: STORE_SCALE, columns: COLS, frames: index }, null, 1));

const banner = '// Made by scripts/make_critter_sprites.mts. Do not edit by hand. Run `npm run critters`.\n';
writeFileSync(
  join(root, 'src/lib/quest/critters.generated.ts'),
  `${banner}export const CRITTER_COLS = ${COLS};\nexport const CRITTER_ROWS = ${rows};\nexport const CRITTER_INDEX: Record<string, number> = ${JSON.stringify(index)};\nexport const CRITTER_SHEET = 'data:image/png;base64,${main.toString('base64')}';\nexport const CRITTER_SHADOWS = 'data:image/png;base64,${shadow.toString('base64')}';\n`,
);
console.log(`${ids.length} critters, ${((main.length + shadow.length) / 1024).toFixed(0)} KB of PNG`);
