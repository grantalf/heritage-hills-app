/**
 * Art drawn in code, then shrunk to pixel sprites (decisions D-058, D-069).
 *
 * A character is a jointed puppet made of simple shapes. This file turns the
 * shapes into a small pixel grid with a limited palette, optional soft shading
 * and an outline pass. Nothing here knows about React or the phone, so it runs
 * in tests and in the sprite export script.
 *
 * The same puppet can be drawn in several looks (outline weight, shading) by
 * changing only the Look passed to rasterize().
 */

export type Outline = 'thin' | 'thick';
export type Shading = 'flat' | 'shaded';
export type Look = { outline: Outline; shading: Shading };

/** Shade level of a pixel: 0 dark, 1 middle, 2 light. */
type Level = 0 | 1 | 2;

type Common = {
  /** Palette key. */
  c: string;
  /** Group for inside lines. Shapes in the same group never get a line between them. */
  g: number;
  /** false: a detail (eye, rivet, patch). It gets no line of its own. */
  line: boolean;
  /** Fixed shade, 'auto' to shade by position inside the shape, or 'lit' for a highlight and no shadow (faces). */
  shade: Level | 'auto' | 'lit';
  /** Bounding box, used for shading. */
  bx0: number;
  by0: number;
  bx1: number;
  by1: number;
};

type Ellipse = Common & { k: 'e'; cx: number; cy: number; rx: number; ry: number; cos: number; sin: number };
type Capsule = Common & { k: 'c'; x1: number; y1: number; x2: number; y2: number; r1: number; r2: number };
type Poly = Common & { k: 'p'; pts: number[] };
type Rect = Common & { k: 'r'; x: number; y: number; w: number; h: number };
export type Shape = Ellipse | Capsule | Poly | Rect;

export type ShapeOptions = { line?: boolean; shade?: Level | 'auto' | 'lit' };

type Matrix = [number, number, number, number, number, number];
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

function multiply(m: Matrix, n: Matrix): Matrix {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

/**
 * Collects the shapes of one drawing. Later shapes sit on top of earlier ones.
 * Coordinates are in pixels. x grows to the right, y grows downward.
 */
export class Fig {
  shapes: Shape[] = [];
  private m: Matrix = IDENTITY;
  private group = 0;
  private groups = 0;

  /** Draw inside a moved and turned frame: a joint. Angle in radians, clockwise. */
  at(x: number, y: number, angle: number, draw: () => void): this {
    const saved = this.m;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    this.m = multiply(saved, [cos, sin, -sin, cos, x, y]);
    draw();
    this.m = saved;
    return this;
  }

  /** Everything drawn inside is one body part. Other parts get a line where they overlap it. */
  part(draw: () => void): this {
    const saved = this.group;
    this.groups += 1;
    this.group = this.groups;
    draw();
    this.group = saved;
    return this;
  }

  private point(x: number, y: number): [number, number] {
    const m = this.m;
    return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  }

  private common(c: string, o: ShapeOptions | undefined, box: [number, number, number, number]): Common {
    return { c, g: this.group, line: o?.line ?? true, shade: o?.shade ?? 'auto', bx0: box[0], by0: box[1], bx1: box[2], by1: box[3] };
  }

  ell(c: string, cx: number, cy: number, rx: number, ry: number, o?: ShapeOptions & { rot?: number }): this {
    const [x, y] = this.point(cx, cy);
    const angle = Math.atan2(this.m[1], this.m[0]) + (o?.rot ?? 0);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const ex = Math.hypot(rx * cos, ry * sin);
    const ey = Math.hypot(rx * sin, ry * cos);
    this.shapes.push({ k: 'e', cx: x, cy: y, rx, ry, cos, sin, ...this.common(c, o, [x - ex, y - ey, x + ex, y + ey]) });
    return this;
  }

  /** A limb: a line with round ends. r2 lets it taper. */
  cap(c: string, x1: number, y1: number, x2: number, y2: number, r: number, o?: ShapeOptions & { r2?: number }): this {
    const [ax, ay] = this.point(x1, y1);
    const [bx, by] = this.point(x2, y2);
    const r2 = o?.r2 ?? r;
    const box: [number, number, number, number] = [Math.min(ax - r, bx - r2), Math.min(ay - r, by - r2), Math.max(ax + r, bx + r2), Math.max(ay + r, by + r2)];
    this.shapes.push({ k: 'c', x1: ax, y1: ay, x2: bx, y2: by, r1: r, r2, ...this.common(c, o, box) });
    return this;
  }

  poly(c: string, points: number[], o?: ShapeOptions): this {
    const pts: number[] = [];
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (let i = 0; i < points.length; i += 2) {
      const [x, y] = this.point(points[i], points[i + 1]);
      pts.push(x, y);
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
    this.shapes.push({ k: 'p', pts, ...this.common(c, o, [x0, y0, x1, y1]) });
    return this;
  }

  /** Exact pixels, for tiny details such as pupils and rivets. Snaps to the grid. */
  px(c: string, x: number, y: number, w = 1, h = 1, shade: Level = 1): this {
    const [tx, ty] = this.point(x, y);
    const rx = Math.round(tx);
    const ry = Math.round(ty);
    this.shapes.push({ k: 'r', x: rx, y: ry, w, h, ...this.common(c, { line: false, shade }, [rx, ry, rx + w, ry + h]) });
    return this;
  }
}

function inside(s: Shape, x: number, y: number): boolean {
  if (x < s.bx0 || x > s.bx1 || y < s.by0 || y > s.by1) return false;
  switch (s.k) {
    case 'r':
      return x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h;
    case 'e': {
      const dx = x - s.cx;
      const dy = y - s.cy;
      const u = (dx * s.cos + dy * s.sin) / s.rx;
      const v = (-dx * s.sin + dy * s.cos) / s.ry;
      return u * u + v * v <= 1;
    }
    case 'c': {
      const vx = s.x2 - s.x1;
      const vy = s.y2 - s.y1;
      const len2 = vx * vx + vy * vy;
      const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - s.x1) * vx + (y - s.y1) * vy) / len2));
      const r = s.r1 + (s.r2 - s.r1) * t;
      const dx = x - (s.x1 + vx * t);
      const dy = y - (s.y1 + vy * t);
      return dx * dx + dy * dy <= r * r;
    }
    case 'p': {
      let hit = false;
      const p = s.pts;
      for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
        if (p[i + 1] > y !== p[j + 1] > y && x < ((p[j] - p[i]) * (y - p[i + 1])) / (p[j + 1] - p[i + 1]) + p[i]) hit = !hit;
      }
      return hit;
    }
  }
}

// ---------- color ----------

export type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: Rgb): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/** Turn a hue part of the way toward a target hue, the short way around. */
function hueToward(h: number, target: number, amount: number): number {
  const diff = ((target - h + 540) % 360) - 180;
  const step = Math.sign(diff) * Math.min(Math.abs(diff), amount);
  return (h + step + 360) % 360;
}

/**
 * Three shades of one color: dark, middle, light. Shadows lean cool and
 * highlights lean warm, which is what makes pixel art look painted, not gray.
 */
export function ramp(mid: string): [Rgb, Rgb, Rgb] {
  const [h, s, l] = rgbToHsl(hexToRgb(mid));
  const dark = hslToRgb(hueToward(h, 265, 9), Math.min(1, s * 0.96), l * 0.76);
  const light = hslToRgb(hueToward(h, 52, 10), s * 0.92, l + (1 - l) * 0.34);
  return [dark, hexToRgb(mid), light];
}

/** Line color for the thin look: a deep version of the color it surrounds. */
export function lineColor(mid: string): Rgb {
  const [h, s, l] = rgbToHsl(hexToRgb(mid));
  return hslToRgb(hueToward(h, 265, 24), Math.min(1, s * 0.9 + 0.08), Math.min(0.26, l * 0.36));
}

/** Line color for the thick look: one dark plum ink for everything. */
export const INK: Rgb = [34, 24, 44];

// ---------- raster ----------

export type Sprite = { w: number; h: number; rgba: Uint8Array };

const SUB = [1 / 6, 3 / 6, 5 / 6];
/** A pixel is filled when at least this many of its 9 sample points are covered. */
const FILL_AT = 4;

export function rasterize(shapes: Shape[], w: number, h: number, palette: Record<string, string>, look: Look): Sprite {
  const count = w * h;
  /** Index of the shape that owns each pixel, or -1. */
  const owner = new Int16Array(count).fill(-1);
  /** Index of the top shape that draws lines at each pixel, or -1. */
  const part = new Int16Array(count).fill(-1);
  const votes = new Map<number, number>();
  const partVotes = new Map<number, number>();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      votes.clear();
      partVotes.clear();
      let covered = 0;
      for (const sy of SUB) {
        for (const sx of SUB) {
          let top = -1;
          let topPart = -1;
          for (let i = shapes.length - 1; i >= 0; i--) {
            if (!inside(shapes[i], x + sx, y + sy)) continue;
            if (top < 0) top = i;
            if (shapes[i].line) {
              topPart = i;
              break;
            }
          }
          if (top >= 0) {
            covered += 1;
            votes.set(top, (votes.get(top) ?? 0) + 1);
            if (topPart >= 0) partVotes.set(topPart, (partVotes.get(topPart) ?? 0) + 1);
          }
        }
      }
      if (covered < FILL_AT) continue;
      owner[y * w + x] = best(votes);
      part[y * w + x] = partVotes.size ? best(partVotes) : -1;
    }
  }

  const ramps = new Map<string, [Rgb, Rgb, Rgb]>();
  const rampFor = (key: string) => {
    let r = ramps.get(key);
    if (!r) {
      const hex = palette[key];
      if (!hex) throw new Error(`Unknown palette color "${key}"`);
      r = ramp(hex);
      ramps.set(key, r);
    }
    return r;
  };

  const rgba = new Uint8Array(count * 4);
  const put = (i: number, c: Rgb) => {
    rgba[i * 4] = c[0];
    rgba[i * 4 + 1] = c[1];
    rgba[i * 4 + 2] = c[2];
    rgba[i * 4 + 3] = 255;
  };
  const groupAt = (i: number) => (part[i] >= 0 ? shapes[part[i]].g : -1);

  // Fill, shading and inside lines.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (owner[i] < 0) continue;
      const s = shapes[owner[i]];

      // A line where a nearer body part overlaps this one. The pixel behind gives way.
      let lined = false;
      if (part[i] >= 0) {
        for (const [dx, dy] of NEAR) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const n = ny * w + nx;
          if (part[n] > part[i] && groupAt(n) !== groupAt(i)) lined = true;
        }
      }
      if (lined) {
        put(i, look.outline === 'thick' ? INK : lineColor(palette[shapes[part[i]].c]));
        continue;
      }

      let level: Level = 1;
      if (s.shade !== 'auto' && s.shade !== 'lit') level = s.shade;
      else if (look.shading === 'shaded') {
        // Light comes from the upper left.
        const u = ((x + 0.5 - s.bx0) / Math.max(1, s.bx1 - s.bx0)) * 2 - 1;
        const v = ((y + 0.5 - s.by0) / Math.max(1, s.by1 - s.by0)) * 2 - 1;
        const d = u * 0.5 + v * 0.85;
        level = d > 0.5 && s.shade !== 'lit' ? 0 : d < -0.6 ? 2 : 1;
      }
      put(i, rampFor(s.c)[level]);
    }
  }

  // Outside line: empty pixels that touch the figure.
  const rings = look.outline === 'thick' ? 2 : 1;
  let edge = new Uint8Array(count);
  for (let i = 0; i < count; i++) edge[i] = owner[i] >= 0 ? 1 : 0;
  for (let ring = 0; ring < rings; ring++) {
    const next = new Uint8Array(edge);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (edge[i]) continue;
        let from = -1;
        for (const [dx, dy] of NEAR) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (edge[ny * w + nx]) from = ny * w + nx;
        }
        if (from < 0) continue;
        next[i] = 1;
        if (look.outline === 'thick') put(i, INK);
        else put(i, lineColor(palette[shapes[owner[from]].c]));
      }
    }
    edge = next;
  }

  return { w, h, rgba };
}

const NEAR: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function best(votes: Map<number, number>): number {
  let winner = -1;
  let most = 0;
  for (const [index, n] of votes) {
    // On a tie the shape on top wins.
    if (n > most || (n === most && index > winner)) {
      winner = index;
      most = n;
    }
  }
  return winner;
}

/** How many different colors a sprite uses. Used by tests to keep the palette small. */
export function colorCount(sprite: Sprite): number {
  const seen = new Set<number>();
  for (let i = 0; i < sprite.rgba.length; i += 4) {
    if (sprite.rgba[i + 3] === 0) continue;
    seen.add((sprite.rgba[i] << 16) | (sprite.rgba[i + 1] << 8) | sprite.rgba[i + 2]);
  }
  return seen.size;
}
