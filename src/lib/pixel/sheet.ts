/**
 * Packs a puppet's frames into one standard sprite sheet: a grid of equal
 * cells, left to right, top to bottom, with a list of where each frame sits.
 */
import { Fig, rasterize, type Look, type Sprite } from './raster';
import { PALETTE, type AnimDef, type SheetDef } from './puppets';

export const LOOKS: Record<string, Look> = {
  thinFlat: { outline: 'thin', shading: 'flat' },
  thinShaded: { outline: 'thin', shading: 'shaded' },
  thickFlat: { outline: 'thick', shading: 'flat' },
  thickShaded: { outline: 'thick', shading: 'shaded' },
};
export type LookId = keyof typeof LOOKS;
export const LOOK_IDS = ['thinFlat', 'thinShaded', 'thickFlat', 'thickShaded'] as const;

/** Frames per row. Sheets wider than this wrap to a new row. */
export const COLUMNS = 8;

export type SheetMeta = {
  id: string;
  cw: number;
  ch: number;
  ax: number;
  ay: number;
  cols: number;
  rows: number;
  count: number;
  anims: Record<string, AnimDef>;
};

export function drawFrame(sheet: SheetDef, index: number, look: Look): Sprite {
  const fig = new Fig();
  fig.at(sheet.ax, sheet.ay, 0, () => sheet.frames[index].draw(fig));
  // Backdrops stay quiet: flat color and a thin line, whatever look the characters use.
  const used: Look = sheet.tile ? { outline: 'thin', shading: 'flat' } : look;
  return rasterize(fig.shapes, sheet.cw, sheet.ch, sheet.recolor ? { ...PALETTE, ...sheet.recolor } : PALETTE, used);
}

export function metaFor(sheet: SheetDef): SheetMeta {
  const count = sheet.frames.length;
  const cols = Math.min(COLUMNS, count);
  return { id: sheet.id, cw: sheet.cw, ch: sheet.ch, ax: sheet.ax, ay: sheet.ay, cols, rows: Math.ceil(count / cols), count, anims: sheet.anims };
}

export function packSheet(sheet: SheetDef, look: Look): { meta: SheetMeta; image: Sprite } {
  const meta = metaFor(sheet);
  const w = meta.cols * sheet.cw;
  const h = meta.rows * sheet.ch;
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0; i < meta.count; i++) {
    const frame = drawFrame(sheet, i, look);
    const ox = (i % meta.cols) * sheet.cw;
    const oy = Math.floor(i / meta.cols) * sheet.ch;
    for (let y = 0; y < sheet.ch; y++) {
      rgba.set(frame.rgba.subarray(y * sheet.cw * 4, (y + 1) * sheet.cw * 4), ((oy + y) * w + ox) * 4);
    }
  }
  return { meta, image: { w, h, rgba } };
}

/** Enlarge a sprite by a whole number, keeping hard pixel edges. */
export function enlarge(sprite: Sprite, times: number): Sprite {
  const w = sprite.w * times;
  const h = sprite.h * times;
  const rgba = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const from = (Math.floor(y / times) * sprite.w + Math.floor(x / times)) * 4;
      rgba.set(sprite.rgba.subarray(from, from + 4), (y * w + x) * 4);
    }
  }
  return { w, h, rgba };
}
