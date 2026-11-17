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
import { deflateSync } from 'node:zlib';

import { allSheets } from '../src/lib/pixel/puppets.ts';
import type { Sprite } from '../src/lib/pixel/raster.ts';
import { enlarge, LOOK_IDS, LOOKS, packSheet, type SheetMeta } from '../src/lib/pixel/sheet.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
/** Images are stored enlarged so phones never have to blur them up. */
const STORE_SCALE = 3;

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of bytes) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, tail]);
}
export function png(sprite: Sprite): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(sprite.w, 0);
  header.writeUInt32BE(sprite.h, 4);
  header.set([8, 6, 0, 0, 0], 8);
  const stride = sprite.w * 4;
  const raw = Buffer.alloc((stride + 1) * sprite.h);
  for (let y = 0; y < sprite.h; y++) {
    // Filter "Up": a row that repeats the one above becomes zeros, so enlarged art stays tiny.
    raw[y * (stride + 1)] = 2;
    for (let x = 0; x < stride; x++) {
      const above = y === 0 ? 0 : sprite.rgba[(y - 1) * stride + x];
      raw[y * (stride + 1) + 1 + x] = (sprite.rgba[y * stride + x] - above) & 255;
    }
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', new Uint8Array())]);
}

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
