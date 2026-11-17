/**
 * Pixel critters for the game zone (block 3).
 *
 * Every field guide animal and every pet already has a list of traits
 * (lib/data/game-art.ts) that draws its cartoon character. This file draws the
 * same traits as a puppet for block 1's pixel pipeline (lib/pixel/raster.ts),
 * so the zone's critters match the rescue game's look (D-069, D-074) and stay
 * the same animal as the cartoon.
 *
 * Drawn on a 120 x 120 sheet, like the cartoon, then scaled into a small cell.
 * scripts/make_critter_sprites.mts turns them into one sprite sheet.
 */
import type { ArtSpec } from '@/components/critter-art';

import { Fig, rasterize, type Look, type Sprite } from '../pixel/raster';

/** Cell size in pixels, with room for the thick outline. */
export const CRITTER_CELL = 36;
const DRAW = 32;
const S = DRAW / 120;
const OFF = (CRITTER_CELL - DRAW) / 2;

type P = readonly [number, number];
type Opts = { line?: boolean; lit?: boolean };

/** A small drawing helper in the cartoon's 120-unit space, with mirroring. */
class Pen {
  private flip = false;
  constructor(private f: Fig) {}

  private x(v: number) {
    return OFF + (this.flip ? 120 - v : v) * S;
  }
  private y(v: number) {
    return OFF + v * S;
  }
  private o(o?: Opts) {
    return { line: o?.line ?? true, shade: o?.lit ? ('lit' as const) : ('auto' as const) };
  }

  /** Draw a part, then its mirror image. */
  both(draw: () => void) {
    draw();
    this.flip = true;
    draw();
    this.flip = false;
  }
  part(draw: () => void) {
    this.f.part(draw);
  }
  ell(c: string, cx: number, cy: number, rx: number, ry: number, rotDeg = 0, o?: Opts) {
    const rot = ((this.flip ? -rotDeg : rotDeg) * Math.PI) / 180;
    this.f.ell(c, this.x(cx), this.y(cy), rx * S, ry * S, { ...this.o(o), rot });
  }
  circle(c: string, cx: number, cy: number, r: number, o?: Opts) {
    this.ell(c, cx, cy, r, r, 0, o);
  }
  poly(c: string, pts: P[], o?: Opts) {
    this.f.poly(c, pts.flatMap(([px, py]) => [this.x(px), this.y(py)]), this.o(o));
  }
  line(c: string, pts: P[], width: number, o?: Opts) {
    for (let i = 0; i < pts.length - 1; i++) this.f.cap(c, this.x(pts[i][0]), this.y(pts[i][1]), this.x(pts[i + 1][0]), this.y(pts[i + 1][1]), (width / 2) * S, this.o(o));
  }
  /** One exact pixel, for pupils. */
  dot(c: string, cx: number, cy: number) {
    this.f.px(c, this.x(cx) - 0.5, this.y(cy) - 0.5, 1, 1, 0);
  }
}

const curve = (a: P, c: P, b: P, steps = 6): P[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]] as const;
  });

const WHITE = '#fff8ea';
const INK = '#2a2033';
const NOSE = '#3a2a30';

function eye(p: Pen, x: number, y: number, r: number, color = WHITE) {
  p.circle(color, x, y, r, { line: false, lit: true });
  p.dot(INK, x + 1, y + 1);
}

function serpent(p: Pen, spec: ArtSpec) {
  const bands = spec.bands?.length ? spec.bands : [spec.base];
  const coils = [
    { cy: 98, rx: 42, ry: 13 },
    { cy: 84, rx: 32, ry: 12 },
    { cy: 71, rx: 22, ry: 10 },
  ];
  coils.forEach((coil, i) =>
    p.part(() => {
      p.ell(bands[i % bands.length], 60, coil.cy, coil.rx, coil.ry);
      if (bands.length > 1) [-0.55, 0, 0.55].forEach((f, j) => p.ell(bands[(i + j + 1) % bands.length], 60 + f * coil.rx, coil.cy, coil.rx * 0.13, coil.ry * 0.85, 0, { line: false }));
    }),
  );
  p.part(() => {
    p.ell(bands[bands.length > 1 ? 2 % bands.length : 0], 60, 44, 22, 19);
    if (spec.belly) p.ell(spec.belly, 60, 52, 12, 7, 0, { line: false });
    eye(p, 50, 40, 7, spec.eyeColor);
    eye(p, 70, 40, 7, spec.eyeColor);
  });
}

function chibi(p: Pen, spec: ArtSpec) {
  const legs = spec.legs ?? 4;
  const eyes = spec.eyes ?? 'front';
  const tailColor = spec.tailColor ?? spec.base;
  const wingColor = spec.wingColor ?? spec.base;

  // Behind the body.
  if (spec.wings === 'butterfly')
    p.part(() =>
      p.both(() => {
        p.ell(wingColor, 27, 50, 25, 27);
        p.ell(wingColor, 32, 90, 19, 18);
        if (spec.wingSpots) {
          p.circle(spec.wingSpots, 18, 44, 6, { line: false });
          p.circle(spec.wingSpots, 30, 94, 5, { line: false });
        }
      }),
    );
  if (spec.wings === 'bat') p.part(() => p.both(() => p.poly(wingColor, [[36, 62], [4, 40], [8, 66], [15, 60], [18, 80], [26, 72], [32, 90]])));
  if (spec.wings === 'insect' || spec.wings === 'double')
    p.part(() =>
      p.both(() => {
        p.ell('#e6f3f6', 24, 52, 22, 10, -24);
        if (spec.wings === 'double') p.ell('#e6f3f6', 24, 74, 20, 8, 14);
      }),
    );
  if (spec.shell === 'dome') p.part(() => p.ell(spec.shellColor ?? spec.base, 60, 86, 46, 28));
  if (spec.shell === 'banded')
    p.part(() => {
      p.ell(spec.shellColor ?? spec.base, 60, 88, 50, 27);
      p.both(() => p.line(INK, curve([30, 68], [24, 90], [31, 110]), 3, { line: false }));
    });
  if (spec.shell === 'spiral')
    p.part(() => {
      p.circle(spec.shellColor ?? spec.base, 86, 82, 26);
      p.circle(INK, 86, 82, 13, { line: false });
      p.circle(spec.shellColor ?? spec.base, 86, 82, 9, { line: false });
    });
  if (spec.tail === 'bushy' || spec.tail === 'ringed')
    p.part(() => {
      p.ell(tailColor, 96, 88, 13, 22, 24);
      if (spec.tail === 'ringed') {
        p.line(INK, curve([88, 76], [98, 72], [106, 80]), 6, { line: false });
        p.line(INK, curve([86, 92], [98, 88], [108, 96]), 6, { line: false });
      }
    });
  if (spec.tail === 'thin') p.part(() => p.line(tailColor, curve([78, 102], [104, 108], [104, 82]), 7));
  if (spec.tail === 'long') p.part(() => p.line(tailColor, curve([76, 100], [114, 112], [108, 70]), 10));
  if (spec.tail === 'puff') p.part(() => p.circle(WHITE, 90, 102, 9));
  if (spec.tail === 'scorpion')
    p.part(() => {
      p.line(tailColor, [...curve([82, 98], [112, 96], [106, 62]), ...curve([106, 62], [102, 44], [86, 50])], 9);
      p.poly(INK, [[86, 42], [76, 52], [90, 58]], { line: false });
    });
  if (legs === 6 || legs === 8)
    p.part(() =>
      p.both(() => {
        for (let i = 0; i < legs / 2; i++) p.line(INK, [[42, 88 + i * 5], [18, 76 + i * 12]], 5, { line: false });
      }),
    );
  if (spec.pincers)
    p.part(() =>
      p.both(() => {
        p.line(INK, [[38, 82], [20, 70]], 5, { line: false });
        p.circle(spec.base, 14, 60, 11);
      }),
    );
  if (spec.wings === 'bird') p.part(() => p.both(() => p.ell(wingColor, 30, 88, 11, 19, 18)));

  // Body.
  p.part(() => {
    if (legs === 4) p.both(() => p.ell(spec.base, 47, 111, 9, 5));
    p.ell(spec.base, 60, 95, 24, 17);
    if (spec.stripes) {
      p.line(spec.stripes, curve([42, 90], [60, 96], [78, 90]), 6, { line: false });
      p.line(spec.stripes, curve([44, 101], [60, 107], [76, 101]), 6, { line: false });
    }
    if (spec.glow) p.circle('#ffe94d', 60, 104, 11, { line: false, lit: true });
  });

  // Ears and the top of the head.
  if (spec.ears === 'round')
    p.part(() =>
      p.both(() => {
        p.circle(spec.base, 33, 30, 12);
        p.circle(spec.earInner ?? '#f4b6b6', 33, 30, 6, { line: false });
      }),
    );
  if (spec.ears === 'pointy')
    p.part(() =>
      p.both(() => {
        p.poly(spec.base, [[28, 40], [33, 6], [54, 26]]);
        p.poly(spec.earInner ?? '#f4b6b6', [[35, 31], [37, 17], [46, 27]], { line: false });
      }),
    );
  if (spec.ears === 'long')
    p.part(() =>
      p.both(() => {
        p.ell(spec.base, 44, 15, 8, 22, -10);
        p.ell(spec.earInner ?? '#f4b6b6', 44, 17, 3.5, 14, -10, { line: false });
      }),
    );
  if (spec.ears === 'tuft') p.part(() => p.both(() => p.poly(spec.base, [[34, 34], [30, 10], [50, 24]])));
  if (spec.crest) p.part(() => p.poly(spec.crest as string, [[50, 28], [58, 2], [72, 26]]));
  if (spec.antennae)
    p.part(() =>
      p.both(() => {
        p.line(INK, curve([52, 28], [46, 12], [38, 8]), 4, { line: false });
        p.circle(INK, 38, 8, 4.5, { line: false });
      }),
    );
  if (eyes === 'top') p.part(() => p.both(() => p.circle(spec.base, 42, 30, 13)));

  // Head and face.
  p.part(() => {
    p.circle(spec.base, 60, 56, 34);
    if (spec.stripe) p.ell(spec.stripe, 60, 36, 7, 15, 0, { line: false });
    if (spec.spots) {
      p.circle(spec.spots, 44, 34, 5, { line: false });
      p.circle(spec.spots, 78, 36, 5, { line: false });
      p.circle(spec.spots, 62, 27, 4, { line: false });
    }
    if (spec.mask) p.both(() => p.ell(spec.mask as string, 46, 56, 15, 11, 0, { line: false }));
    if (spec.belly) p.ell(spec.belly, 60, 74, 17, 11, 0, { line: false });
    if (spec.cheeks) p.both(() => p.ell(spec.cheeks as string, 32, 68, 6, 4.5, 0, { line: false }));
    if (eyes === 'front' || eyes === 'many') {
      eye(p, 46, 57, 9, spec.eyeColor);
      eye(p, 74, 57, 9, spec.eyeColor);
    }
    if (eyes === 'many') for (const x of [36, 84]) p.circle(INK, x, 40, 4, { line: false });
    if (eyes === 'top') {
      eye(p, 42, 30, 9, spec.eyeColor);
      eye(p, 78, 30, 9, spec.eyeColor);
      if (!spec.beak) p.line(INK, curve([44, 70], [60, 80], [76, 70]), 4, { line: false });
    }
    const beak = spec.beakColor ?? '#f2a33a';
    if (spec.beak === 'short') p.poly(beak, [[50, 65], [70, 65], [60, 81]], { line: false });
    if (spec.beak === 'hook') p.poly(beak, [[50, 64], [70, 64], [66, 78], [57, 83], [60, 72]], { line: false });
    if (spec.beak === 'long') p.poly(beak, [[53, 65], [67, 65], [60, 106]], { line: false });
    if (spec.snout) {
      p.poly(spec.belly ?? spec.base, [[49, 62], [71, 62], [67, 84], [60, 90], [53, 84]], { line: false });
      p.ell(NOSE, 60, 86, 5, 4, 0, { line: false });
    }
    if (!spec.beak && !spec.snout && eyes !== 'top' && (legs === 4 || legs === 0)) p.ell(NOSE, 60, 69, 5, 4, 0, { line: false });
  });
}

/** Draws one critter's puppet. */
export function critterFig(spec: ArtSpec): Fig {
  const fig = new Fig();
  const pen = new Pen(fig);
  if (spec.plan === 'serpent') serpent(pen, spec);
  else chibi(pen, spec);
  return fig;
}

/** The critter as a pixel sprite in a look. */
export function critterPixels(spec: ArtSpec, look: Look): Sprite {
  const fig = critterFig(spec);
  const palette: Record<string, string> = {};
  for (const s of fig.shapes) palette[s.c] = s.c;
  return rasterize(fig.shapes, CRITTER_CELL, CRITTER_CELL, palette, look);
}

/** An unknown slot in the field guide: the same shape in plain tan, outline kept. */
export function shadowOf(sprite: Sprite): Sprite {
  const rgba = new Uint8Array(sprite.rgba);
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue;
    const isInk = rgba[i] === 34 && rgba[i + 1] === 24 && rgba[i + 2] === 44;
    const [r, g, b] = isInk ? [92, 70, 48] : [203, 184, 138];
    rgba[i] = r;
    rgba[i + 1] = g;
    rgba[i + 2] = b;
  }
  return { w: sprite.w, h: sprite.h, rgba };
}
