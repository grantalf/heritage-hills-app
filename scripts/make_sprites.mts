/**
 * Draws every puppet in every look and writes the sprite sheets.
 *   npm run sprites
 * Writes:
 *   assets/game/<look>/<sheet>.png and .json   standard sheets for artists and tools
 *   src/lib/arcade/atlas.generated.ts          frame lists (small, used by rules and tests)
 *   src/lib/arcade/sheets.generated.ts         the images, packed into the app
 * Art from an artist or a sprite tool: put <sheet>.png in art/overrides/<look>/ with the
 * same cell size and frame order. It is used in place of the code-drawn sheet.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { allSheets } from '../src/lib/pixel/puppets.ts';
import { png } from './png.mts';
import { enlarge, LOOK_IDS, LOOKS, packSheet, type SheetMeta } from '../src/lib/pixel/sheet.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
/** Images are stored enlarged so phones never have to blur them up. */
const STORE_SCALE = 3;

const sheets = allSheets();
const metas: Record<string, SheetMeta> = {};
const images: Record<string, Record<string, string>> = {};
let bytes = 0;

for (const lookId of LOOK_IDS) {
  images[lookId] = {};
  const dir = join(root, 'assets/game', lookId);
  mkdirSync(dir, { recursive: true });
  for (const sheet of sheets) {
    const { meta, image } = packSheet(sheet, LOOKS[lookId]);
    metas[sheet.id] = meta;
    const override = join(root, 'art/overrides', lookId, `${sheet.id}.png`);
    const file = existsSync(override) ? readFileSync(override) : png(enlarge(image, STORE_SCALE));
    writeFileSync(join(dir, `${sheet.id}.png`), file);
    // The same frame list in the layout most sprite tools read.
    const frames: Record<string, unknown> = {};
    sheet.frames.forEach((frame, i) => {
      frames[frame.name] = { frame: { x: (i % meta.cols) * meta.cw * STORE_SCALE, y: Math.floor(i / meta.cols) * meta.ch * STORE_SCALE, w: meta.cw * STORE_SCALE, h: meta.ch * STORE_SCALE } };
    });
    writeFileSync(join(dir, `${sheet.id}.json`), JSON.stringify({ frames, meta: { image: `${sheet.id}.png`, scale: STORE_SCALE, cell: { w: meta.cw, h: meta.ch }, anchor: { x: meta.ax, y: meta.ay }, animations: meta.anims } }, null, 1));
    images[lookId][sheet.id] = 'data:image/png;base64,' + file.toString('base64');
    bytes += file.length;
  }
}

const banner = '// Made by scripts/make_sprites.mts. Do not edit by hand. Run `npm run sprites`.\n';
mkdirSync(join(root, 'src/lib/arcade'), { recursive: true });
writeFileSync(
  join(root, 'src/lib/arcade/atlas.generated.ts'),
  `${banner}export const STORE_SCALE = ${STORE_SCALE};\nexport const ATLAS = ${JSON.stringify(metas, null, 1)} as const;\nexport type SheetId = keyof typeof ATLAS;\n`,
);
writeFileSync(join(root, 'src/lib/arcade/sheets.generated.ts'), `${banner}export const SHEET_IMAGES: Record<string, Record<string, string>> = ${JSON.stringify(images, null, 1)};\n`);
console.log(`${sheets.length} sheets x ${LOOK_IDS.length} looks, ${(bytes / 1024).toFixed(0)} KB of PNG`);
