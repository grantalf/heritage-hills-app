/**
 * The puppets: every character, prop and effect, drawn in code.
 *
 * All designs here are our own. They are stand-in art for block 1 and the
 * starting point for the real art. To change how a character looks, change its
 * numbers here and run `npm run sprites`. To replace a character with art from
 * an artist or a sprite tool, see docs/ART_PIPELINE.md: no code changes needed.
 */
import { Fig } from './raster';

/** One named color each. The rasterizer makes the dark and light shades. */
export const PALETTE: Record<string, string> = {
  white: '#fff8ea',
  ink: '#2a2033',
  mouth: '#8a2f4a',
  blush: '#f08a7a',
  // Hero: a neighbor in a straw hat with a pool noodle.
  skin: '#f2bd8e',
  hair: '#7a4a2e',
  straw: '#f4d06a',
  band: '#e0563f',
  teal: '#2fb8aa',
  denim: '#4a78d0',
  boot: '#8a5530',
  noodle: '#ff74b0',
  // Monsters: goofy, not gory.
  zskin: '#93d06c',
  zshirt: '#c98a5a',
  zpants: '#6a78b0',
  zhair: '#4f7a3a',
  gskin: '#bfa8f2',
  gcloak: '#7a58c2',
  geye: '#ffe36a',
  iskin: '#f59a52',
  ileaf: '#57b860',
  mud: '#8a6a4a',
  // The Triceratops: a cartoon dinosaur built as a welded metal sculpture.
  steel: '#8fa6ba',
  steelB: '#7f95ad',
  steelC: '#a3b8c8',
  seam: '#56677a',
  rivet: '#d5e2ea',
  rust: '#c9743c',
  brass: '#e2b556',
  glow: '#ffdf5a',
  stone: '#a9a495',
  // Pets and critters.
  dog: '#dba660',
  dogEar: '#a9703c',
  cream: '#f8e6c4',
  squirrel: '#d0803e',
  dillo: '#b9a58e',
  dilloShell: '#9a8670',
  bunny: '#b9a188',
  // Props and effects.
  wood: '#b9814a',
  bar: '#ecd27a',
  poof: '#fff1d2',
  star: '#ffd34d',
  melon: '#f0566a',
  rind: '#5fbf62',
  // Backdrop.
  treeFar: '#2f6f6a',
  treeNear: '#3f9a63',
  trunk: '#6a4a3a',
  fence: '#d9b98a',
};

export type FrameDef = { name: string; draw: (f: Fig) => void };
export type AnimDef = { from: number; count: number; fps: number; loop: boolean };
export type SheetDef = {
  id: string;
  /** Cell size in pixels. */
  cw: number;
  ch: number;
  /** Where the character's feet stand inside the cell. */
  ax: number;
  ay: number;
  frames: FrameDef[];
  anims: Record<string, AnimDef>;
  /** Backdrop tiles repeat sideways, so they may touch the cell edge. */
  tile?: boolean;
  /** Color changes for this sheet only: a recolor of another character. */
  recolor?: Record<string, string>;
};

class SheetBuilder {
  frames: FrameDef[] = [];
  anims: Record<string, AnimDef> = {};
  anim(name: string, fps: number, loop: boolean, draws: ((f: Fig) => void)[]): this {
    this.anims[name] = { from: this.frames.length, count: draws.length, fps, loop };
    draws.forEach((draw, i) => this.frames.push({ name: `${name}_${i}`, draw }));
    return this;
  }
}

// ---------- people-shaped puppets ----------

type Face = 'normal' | 'ouch' | 'happy' | 'mean';
type Pose = {
  x?: number;
  y?: number;
  lean?: number;
  head?: number;
  armF: number;
  armB: number;
  legF: number;
  legB: number;
  /** Angle of the held thing, measured from the arm. */
  held?: number;
  face?: Face;
};

type Human = {
  skin: string;
  top: string;
  sleeve: string;
  bottom: string;
  shoe: string;
  head: [number, number];
  torso: [number, number];
  leg: number;
  arm: number;
  limb: number;
  hand: number;
  /** How far the body leans forward at rest. */
  lean: number;
  /** Hands hang loose from the wrist. */
  floppy?: boolean;
  face: (f: Fig, face: Face) => void;
  behindHead?: (f: Fig) => void;
  onHead?: (f: Fig) => void;
  onTorso?: (f: Fig) => void;
  held?: (f: Fig) => void;
};

function human(f: Fig, h: Human, p: Pose) {
  const hipY = -(h.leg + 2);
  const [tw, th] = h.torso;
  const lean = h.lean + (p.lean ?? 0);
  const arm = (angle: number, front: boolean) =>
    f.at(front ? 1 : -1, -th + 3, -angle - lean * 0.6, () => {
      f.part(() => {
        f.cap(h.sleeve, 0, 0, 0, h.arm * 0.55, h.limb);
        f.cap(h.skin, 0, h.arm * 0.5, 0, h.arm, h.limb * 0.9);
        if (h.floppy) f.at(0, h.arm, angle * 0.9, () => f.cap(h.skin, 0, 0, 0, h.hand * 1.6, h.hand));
        else f.ell(h.skin, 0, h.arm + 0.5, h.hand, h.hand);
      });
      if (front && h.held) f.at(0, h.arm, -(p.held ?? 0), () => f.part(() => h.held?.(f)));
    });
  const leg = (angle: number, x: number) =>
    f.at(x, hipY, -angle, () =>
      f.part(() => {
        f.cap(h.bottom, 0, 0, 0, h.leg, h.limb + 0.4);
        f.cap(h.shoe, -0.5, h.leg + 0.6, 2.6, h.leg + 0.6, h.limb + 0.3);
      }),
    );

  f.at(p.x ?? 0, p.y ?? 0, 0, () => {
    f.at(0, hipY, lean, () => arm(p.armB, false));
    leg(p.legB, -1.5);
    leg(p.legF, 1.5);
    f.at(0, hipY, lean, () => {
      f.part(() => {
        f.cap(h.top, 0, -1, 0, -th + tw * 0.55, tw);
        h.onTorso?.(f);
      });
      f.at(1, -th - h.head[1] + 3, p.head ?? 0, () => {
        if (h.behindHead) f.part(() => h.behindHead?.(f));
        f.part(() => {
          f.ell(h.skin, 0, 0, h.head[0], h.head[1], { shade: 'lit' });
          h.face(f, p.face ?? 'normal');
        });
        if (h.onHead) f.part(() => h.onHead?.(f));
      });
      arm(p.armF, true);
    });
  });
}

const WALK: Pose[] = [
  { legF: 0.55, legB: -0.5, armF: -0.45, armB: 0.45 },
  { legF: 0.1, legB: -0.05, armF: -0.1, armB: 0.1, y: -1 },
  { legF: -0.5, legB: 0.55, armF: 0.45, armB: -0.45 },
  { legF: -0.05, legB: 0.1, armF: 0.1, armB: -0.1, y: -1 },
];

const HERO: Human = {
  skin: 'skin',
  top: 'denim',
  sleeve: 'teal',
  bottom: 'denim',
  shoe: 'boot',
  head: [7.5, 7],
  torso: [5.5, 10],
  leg: 6,
  arm: 8,
  limb: 2.2,
  hand: 2.5,
  lean: 0.04,
  face: (f, face) => {
    if (face === 'ouch') {
      f.px('ink', 1, 0, 3, 1).px('ink', 5, 0, 2, 1);
      f.px('mouth', 3, 3, 3, 2);
    } else {
      f.px('white', 1, -2, 3, 4, 2).px('ink', 2, -1, 2, 3);
      f.px('white', 5, -2, 2, 4, 2).px('ink', 6, -1, 1, 3);
      if (face === 'happy') f.px('mouth', 2, 3, 4, 2).px('white', 3, 3, 2, 1, 2);
      else f.px('mouth', 3, 4, 3, 1);
    }
    f.px('blush', -2, 2, 2, 1);
  },
  behindHead: (f) => f.ell('hair', -5, 1, 4, 5),
  onHead: (f) => {
    f.ell('straw', 0, -5.5, 11.5, 2.4);
    f.ell('straw', -0.5, -8.5, 6, 4);
    f.px('band', -6, -8, 12, 1);
  },
  onTorso: (f) => {
    f.px('teal', -4, -10, 9, 3);
    f.px('brass', 1, -6, 1, 1, 2);
  },
  held: (f) => {
    f.cap('noodle', 0, -3, 0, 17, 2.1);
  },
};

const heroIdle: Pose = { legF: 0.12, legB: -0.12, armF: 0.5, armB: -0.15, held: 1.9 };

function heroSheet(): SheetDef {
  const b = new SheetBuilder();
  const d = (p: Pose) => (f: Fig) => human(f, HERO, p);
  b.anim('idle', 3, true, [d(heroIdle), d({ ...heroIdle, y: 1, held: 1.95 })]);
  b.anim('walk', 9, true, WALK.map((p) => d({ ...p, armF: 0.5, held: 1.9 })));
  // Three bonks. Each is a wind-up frame and a swing frame.
  b.anim('attack1', 14, false, [d({ ...heroIdle, armF: 2.2, held: 0.9, lean: -0.05 }), d({ ...heroIdle, armF: 1.35, held: 0.25, lean: 0.14, x: 1 })]);
  b.anim('attack2', 14, false, [d({ ...heroIdle, armF: 0.2, held: 1.2, lean: 0.05 }), d({ ...heroIdle, armF: 1.7, held: -0.1, lean: 0.16, x: 1 })]);
  b.anim('attack3', 12, false, [
    d({ ...heroIdle, armF: 3.0, held: 0.4, lean: -0.14, y: -1 }),
    d({ ...heroIdle, armF: 1.1, held: 0.5, lean: 0.26, x: 2, legF: 0.5, legB: -0.4 }),
    d({ ...heroIdle, armF: 0.9, held: 0.9, lean: 0.14, x: 1 }),
  ]);
  b.anim('hurt', 1, false, [d({ legF: -0.3, legB: 0.2, armF: -0.8, armB: -1.1, held: 1.2, lean: -0.3, face: 'ouch', x: -1 })]);
  b.anim('down', 1, false, [d({ legF: 0.9, legB: 0.7, armF: 0.3, armB: 0.2, held: 1.6, lean: -0.5, face: 'ouch', y: 3 })]);
  b.anim('cheer', 5, true, [
    d({ legF: 0.1, legB: -0.1, armF: 2.9, armB: 2.6, held: 0.2, face: 'happy' }),
    d({ legF: 0.3, legB: -0.3, armF: 3.1, armB: 2.9, held: 0, face: 'happy', y: -3 }),
  ]);
  return { id: 'hero', cw: 64, ch: 56, ax: 26, ay: 52, frames: b.frames, anims: b.anims };
}

const ZOMBIE: Human = {
  skin: 'zskin',
  top: 'zshirt',
  sleeve: 'zshirt',
  bottom: 'zpants',
  shoe: 'zskin',
  head: [8, 7.5],
  torso: [5.5, 10],
  leg: 6,
  arm: 11,
  limb: 2,
  hand: 2,
  lean: 0.16,
  floppy: true,
  face: (f, face) => {
    // Bulging, mismatched eyes.
    f.px('white', 0, -4, 4, 4, 2).px('ink', face === 'ouch' ? 1 : 2, -2, 1, 1);
    f.px('white', 5, -3, 3, 3, 2).px('ink', 6, -3, 1, 1);
    if (face === 'ouch') f.px('mouth', 2, 2, 4, 3).px('white', 3, 2, 1, 1, 2);
    else f.px('mouth', 2, 3, 5, 2).px('white', 5, 3, 1, 1, 2);
    f.px('zhair', -3, -1, 1, 3);
  },
  onHead: (f) => {
    f.poly('zhair', [-6, -5, -4, -10, -2, -6, 0, -11, 2, -6, 4, -9, 5, -5]);
  },
  onTorso: (f) => {
    f.px('zskin', -2, -4, 3, 2);
    f.px('zpants', 2, -8, 2, 2);
  },
};

const GHOUL: Human = {
  skin: 'gskin',
  top: 'gcloak',
  sleeve: 'gcloak',
  bottom: 'gcloak',
  shoe: 'gskin',
  head: [7.5, 6.5],
  torso: [6.5, 9],
  leg: 4,
  arm: 12,
  limb: 2,
  hand: 3,
  lean: 0.42,
  face: (f, face) => {
    f.px('geye', 1, -3, 3, 3, 2).px('ink', face === 'ouch' ? 1 : 3, -2, 1, 1);
    f.px('geye', 5, -3, 2, 3, 2).px('ink', 6, -2, 1, 1);
    f.px('mouth', 1, 2, 6, 1);
    f.px('white', 2, 3, 1, 1, 2).px('white', 5, 3, 1, 1, 2);
  },
  behindHead: (f) => {
    // Big bat-like ears.
    f.poly('gskin', [-6, -2, -10, -11, -2, -6]);
    f.poly('gskin', [1, -5, 3, -13, 6, -4]);
  },
};

const IMP: Human = {
  skin: 'iskin',
  top: 'ileaf',
  sleeve: 'iskin',
  bottom: 'iskin',
  shoe: 'iskin',
  head: [7, 6.5],
  torso: [4.5, 6],
  leg: 3.5,
  arm: 6,
  limb: 1.8,
  hand: 2.2,
  lean: 0.08,
  face: (f, face) => {
    f.px('white', 1, -3, 4, 4, 2).px('ink', face === 'ouch' ? 2 : 3, -2, 2, 2);
    f.px('mouth', 3, 3, 3, 1);
    f.px('white', 5, 3, 1, 1, 2);
  },
  behindHead: (f) => {
    f.poly('ileaf', [-4, -5, -9, -9, -6, -2]);
    f.poly('ileaf', [3, -5, 8, -11, 6, -3]);
  },
  held: (f) => f.ell('mud', 0, 2, 2.8, 2.8),
};

function enemySheet(id: string, h: Human, size: [number, number, number, number], style: 'shamble' | 'lunge' | 'toss', recolor?: Record<string, string>): SheetDef {
  const b = new SheetBuilder();
  const d = (p: Pose) => (f: Fig) => human(f, h, p);
  // Shamblers hold their arms out in front. The others let them hang.
  const up = style === 'shamble' ? 1.35 : style === 'toss' ? 0.6 : 0.25;
  const rest: Pose = { legF: 0.1, legB: -0.1, armF: up, armB: up - 0.25, held: 1.2 };
  b.anim('idle', 3, true, [d(rest), d({ ...rest, y: 1, armF: up - 0.08 })]);
  b.anim(
    'walk',
    style === 'lunge' ? 10 : 6,
    true,
    WALK.map((p, i) => d({ ...p, armF: up + (i % 2 ? 0.1 : -0.1), armB: up - 0.25 + (i % 2 ? -0.1 : 0.1), lean: i % 2 ? 0.05 : 0, held: 1.2 })),
  );
  if (style === 'toss') {
    b.anim('wind', 1, false, [d({ ...rest, armF: 2.9, held: 0.2, lean: -0.15, face: 'mean' })]);
    b.anim('attack', 1, false, [d({ ...rest, armF: 1.0, held: 0, lean: 0.2, x: 1, face: 'mean' })]);
  } else if (style === 'lunge') {
    b.anim('wind', 1, false, [d({ ...rest, armF: -0.6, armB: -0.9, lean: -0.3, y: 1, legF: 0.5, legB: -0.3, face: 'mean' })]);
    b.anim('attack', 1, false, [d({ ...rest, armF: 1.6, armB: 1.5, lean: 0.3, x: 3, legF: 0.9, legB: -0.8, face: 'mean' })]);
  } else {
    b.anim('wind', 1, false, [d({ ...rest, armF: 2.6, armB: 2.3, lean: -0.2, face: 'mean' })]);
    b.anim('attack', 1, false, [d({ ...rest, armF: 1.1, armB: 0.9, lean: 0.25, x: 2, face: 'mean' })]);
  }
  b.anim('hurt', 1, false, [d({ legF: -0.3, legB: 0.25, armF: -0.6, armB: -0.9, lean: -0.45, face: 'ouch', x: -1 })]);
  return { id, cw: size[0], ch: size[1], ax: size[2], ay: size[3], frames: b.frames, anims: b.anims, recolor };
}

// ---------- the Triceratops ----------

type DinoPose = { y?: number; lean?: number; head?: number; tail?: number; legs: [number, number, number, number]; eye: 'off' | 'on' | 'dizzy' | 'wince'; shake?: number };

function dino(f: Fig, p: DinoPose) {
  const leg = (x: number, angle: number, color: string) =>
    f.at(x, -15, -angle, () =>
      f.part(() => {
        f.cap(color, 0, 0, 0, 10.5, 4.6);
        f.px('seam', -4, 11, 9, 1);
        f.px('rivet', -3, 9, 1, 1, 2).px('rivet', 2, 9, 1, 1, 2);
      }),
    );
  f.at(p.shake ?? 0, p.y ?? 0, 0, () => {
    // Far-side legs, a little darker.
    leg(-9, p.legs[0], 'steelB');
    leg(13, p.legs[1], 'steelB');
    f.at(0, -22, p.lean ?? 0, () => {
      // Tail.
      f.at(-15, 1, p.tail ?? 0, () => f.part(() => f.cap('steel', 0, 0, -17, 5, 6.5, { r2: 1.6 }).px('seam', -8, -2, 1, 7)));
      // Body: three welded plates.
      f.part(() => {
        f.ell('steel', -1, 0, 19, 12.5);
        f.ell('steelC', -2, -5, 15, 6.5, { line: false });
        f.ell('steelB', 1, 7, 14, 5, { line: false });
        for (const dx of [-11, -2, 8]) {
          const half = Math.floor(12.5 * Math.sqrt(1 - (dx * dx) / 400)) - 1;
          f.px('seam', dx, -half, 1, half * 2);
          for (let y = -half + 2; y < half; y += 5) f.px('rivet', dx + 1, y, 1, 1, 2);
        }
        // A little rust.
        f.ell('rust', -14, 5, 3.5, 2.5, { line: false });
        f.ell('rust', 4, 9, 4, 1.8, { line: false });
        f.px('rust', -6, -9, 3, 1).px('rust', 12, -4, 2, 2);
      });
      // Head: frill, skull, beak and three horns.
      f.at(15, -4, p.head ?? 0, () => {
        f.part(() => {
          f.ell('steelB', 1, -8, 10, 15);
          f.ell('steelC', 1, -8, 6.5, 11, { line: false });
          for (const [x, y] of [[-4, -19], [2, -22], [7, -17], [-6, -10], [8, -8]] as const) f.px('rivet', x, y, 1, 1, 2);
          f.ell('rust', -2, 4, 3, 2, { line: false });
        });
        f.part(() => f.cap('brass', 9, -7, 21, -20, 2.6, { r2: 0.7 }));
        f.part(() => {
          f.ell('steel', 13, 1, 11.5, 8);
          f.poly('brass', [22, -1, 29, 4, 22, 8]);
          f.px('seam', 8, -5, 1, 12);
          f.px('rivet', 9, -4, 1, 1, 2).px('rivet', 9, 4, 1, 1, 2);
          f.px('ink', 16, 6, 5, 1);
          if (p.eye === 'on') f.px('ink', 12, -4, 4, 4).px('glow', 13, -3, 2, 2, 2);
          else if (p.eye === 'dizzy') f.px('ink', 12, -4, 4, 4).px('white', 13, -3, 1, 1, 2).px('white', 14, -2, 1, 1, 2);
          else if (p.eye === 'wince') f.px('ink', 12, -2, 4, 1).px('ink', 13, -3, 2, 1);
          else f.px('seam', 12, -3, 3, 2);
        });
        f.part(() => f.cap('brass', 20, -5, 24, -11, 2.1, { r2: 0.7 }));
      });
    });
    // Near-side legs.
    leg(-12, p.legs[2], 'steel');
    leg(10, p.legs[3], 'steel');
  });
}

function bossSheet(): SheetDef {
  const b = new SheetBuilder();
  const d = (p: DinoPose) => (f: Fig) => dino(f, p);
  const still: DinoPose = { legs: [0, 0, 0, 0], eye: 'off' };
  const awake: DinoPose = { legs: [0, 0, 0, 0], eye: 'on' };
  const stride: [number, number, number, number][] = [
    [0.4, -0.4, -0.4, 0.4],
    [0.1, -0.1, -0.1, 0.1],
    [-0.4, 0.4, 0.4, -0.4],
    [-0.1, 0.1, 0.1, -0.1],
  ];
  b.anim('statue', 1, false, [d(still)]);
  b.anim('wake', 8, false, [d({ ...awake, shake: -1, head: -0.1 }), d({ ...awake, shake: 1, head: 0.1 }), d({ ...awake, shake: -1, tail: 0.3 }), d({ ...awake, head: -0.2, tail: -0.2 })]);
  b.anim('idle', 3, true, [d(awake), d({ ...awake, y: 1, tail: 0.15 })]);
  b.anim('walk', 6, true, stride.map((legs, i) => d({ ...awake, legs, y: i % 2 ? -1 : 0, tail: i % 2 ? 0.1 : -0.1 })));
  // Head down and a foot scraping: the warning before a charge.
  b.anim('wind', 6, true, [d({ ...awake, head: 0.4, lean: 0.06, legs: [0, 0, 0, 0.5], tail: -0.3 }), d({ ...awake, head: 0.45, lean: 0.06, legs: [0, 0, 0, -0.2], tail: -0.4 })]);
  b.anim('charge', 12, true, [d({ ...awake, head: 0.5, lean: 0.1, legs: [0.7, -0.7, -0.7, 0.7], tail: -0.5 }), d({ ...awake, head: 0.5, lean: 0.1, legs: [-0.7, 0.7, 0.7, -0.7], tail: -0.5, y: -1 })]);
  b.anim('stomp', 4, false, [d({ ...awake, lean: -0.22, head: -0.2, legs: [0, -0.9, 0, -1.1], y: -2 }), d({ ...awake, lean: 0.05, head: 0.15, legs: [0, 0.1, 0, 0.1], y: 1 })]);
  b.anim('stun', 4, true, [d({ legs: [0.2, -0.2, 0.3, -0.3], eye: 'dizzy', head: 0.25, y: 1 }), d({ legs: [0.2, -0.2, 0.3, -0.3], eye: 'dizzy', head: 0.15, y: 1, tail: 0.2 })]);
  b.anim('hurt', 1, false, [d({ legs: [0.2, 0.2, 0.2, 0.2], eye: 'wince', head: -0.3, lean: -0.08, shake: -1 })]);
  return { id: 'boss', cw: 104, ch: 68, ax: 44, ay: 64, frames: b.frames, anims: b.anims };
}

// ---------- pets and critters ----------

type Critter = { base: string; belly: string; ear: 'floppy' | 'round' | 'long'; earColor: string; tail: 'wag' | 'bushy' | 'thin' | 'puff'; tailColor: string; shell?: string; snout?: boolean };
type CritterPose = { y?: number; legs: [number, number]; tail?: number; ear?: number; happy?: boolean };

function critter(f: Fig, c: Critter, p: CritterPose) {
  const leg = (x: number, angle: number) => f.at(x, -4.5, -angle, () => f.part(() => f.cap(c.base, 0, 0, 0, 4, 1.5)));
  f.at(0, p.y ?? 0, 0, () => {
    leg(-4, -p.legs[0]);
    leg(5, -p.legs[1]);
    f.at(-6, -8, p.tail ?? 0, () =>
      f.part(() => {
        if (c.tail === 'bushy') f.ell(c.tailColor, -3, -5, 4, 6.5, { rot: -0.4 });
        else if (c.tail === 'puff') f.ell(c.tailColor, -1.5, 0, 2.2, 2.2);
        else if (c.tail === 'thin') f.cap(c.tailColor, 0, 1, -7, 3, 1.3, { r2: 0.6 });
        else f.cap(c.tailColor, 0, 0, -4, -6, 1.6, { r2: 1 });
      }),
    );
    f.part(() => {
      f.ell(c.base, 0, -7.5, 7.5, 4.8);
      if (c.shell) {
        f.ell(c.shell, -0.5, -9, 7, 3.6, { line: false });
        for (const x of [-4, -1, 2]) f.px(c.base, x, -12, 1, 5, 0);
      } else f.ell(c.belly, 0.5, -5, 5, 2, { line: false });
    });
    leg(-5.5, p.legs[0]);
    leg(3.5, p.legs[1]);
    f.at(7, -11, 0, () => {
      f.part(() => {
        f.ell(c.base, 0, 0, 4.6, 4.3);
        if (c.snout) f.cap(c.base, 2, 1.5, 7, 2.5, 1.8, { r2: 1 });
        else f.ell(c.belly, 3, 2, 2.4, 1.8, { line: false });
        f.px('ink', 1, -2, 1, 2);
        f.px('ink', c.snout ? 7 : 4, 1, 1, 1);
        if (p.happy) f.px('mouth', 2, 3, 2, 1);
      });
      f.at(-1, -3, p.ear ?? 0, () =>
        f.part(() => {
          if (c.ear === 'long') f.cap(c.earColor, 0, 0, -2.5, -7, 1.7, { r2: 1.2 });
          else if (c.ear === 'floppy') f.cap(c.earColor, -1, 0, -3, 5, 2, { r2: 1.6 });
          else f.ell(c.earColor, -0.5, -1, 1.9, 1.9);
        }),
      );
    });
  });
}

function critterSheet(id: string, c: Critter): SheetDef {
  const b = new SheetBuilder();
  const d = (p: CritterPose) => (f: Fig) => critter(f, c, p);
  b.anim('idle', 3, true, [d({ legs: [0, 0], tail: 0 }), d({ legs: [0, 0], tail: 0.35, ear: 0.1 })]);
  b.anim('run', 12, true, [d({ legs: [0.8, -0.8], y: -1 }), d({ legs: [0.2, -0.2], y: -3, tail: 0.2 }), d({ legs: [-0.8, 0.8], y: -1 }), d({ legs: [-0.2, 0.2], y: 0, tail: -0.2 })]);
  b.anim('cheer', 6, true, [d({ legs: [0.1, -0.1], happy: true, tail: 0.4 }), d({ legs: [0.5, -0.5], happy: true, y: -4, tail: -0.3, ear: -0.2 })]);
  return { id, cw: 32, ch: 28, ax: 15, ay: 25, frames: b.frames, anims: b.anims };
}

const DOG: Critter = { base: 'dog', belly: 'cream', ear: 'floppy', earColor: 'dogEar', tail: 'wag', tailColor: 'dog' };
const SQUIRREL: Critter = { base: 'squirrel', belly: 'cream', ear: 'round', earColor: 'squirrel', tail: 'bushy', tailColor: 'squirrel' };
const ARMADILLO: Critter = { base: 'dillo', belly: 'cream', ear: 'long', earColor: 'dillo', tail: 'thin', tailColor: 'dilloShell', shell: 'dilloShell', snout: true };
const COTTONTAIL: Critter = { base: 'bunny', belly: 'cream', ear: 'long', earColor: 'bunny', tail: 'puff', tailColor: 'white' };

// ---------- props and effects ----------

function star(f: Fig, cx: number, cy: number, r: number, color = 'star') {
  const pts: number[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 ? r * 0.42 : r;
    pts.push(cx + Math.sin(a) * rr, cy - Math.cos(a) * rr);
  }
  f.poly(color, pts);
}

function propsSheet(): SheetDef {
  const b = new SheetBuilder();
  const cage = (open: boolean) => (f: Fig) => {
    f.part(() => f.poly('wood', [-15, -4, 15, -4, 15, 0, -15, 0]));
    if (!open) {
      // Friendly eyes peeking out. The critters are unharmed.
      f.px('ink', -9, -18, 26, 14);
      f.px('white', -6, -12, 2, 2, 2).px('white', -2, -12, 2, 2, 2);
      f.px('white', 5, -9, 2, 2, 2).px('white', 9, -9, 2, 2, 2);
      for (let x = -13; x <= 13; x += 5) f.part(() => f.px('bar', x, -22, 2, 18));
    } else {
      f.px('ink', -9, -18, 22, 14);
      for (const x of [-13, 12]) f.part(() => f.px('bar', x, -22, 2, 18));
      f.part(() => f.poly('bar', [15, -22, 24, -19, 24, -3, 15, -4]));
      f.px('ink', 18, -18, 1, 12).px('ink', 21, -17, 1, 11);
    }
    f.part(() => f.poly('wood', [-16, -26, 16, -26, 15, -21, -15, -21]));
  };
  b.anim('cage', 1, false, [cage(false)]);
  b.anim('cageOpen', 1, false, [cage(true)]);
  b.anim('pedestal', 1, false, [
    (f) => {
      f.part(() => f.poly('stone', [-23, -7, 23, -7, 25, 0, -25, 0]));
      f.px('ink', -8, -4, 16, 1);
    },
  ]);
  b.anim('snack', 1, false, [
    (f) => {
      f.part(() => f.poly('rind', [-8, -8, 8, -8, 0, 0]));
      f.poly('melon', [-6, -8, 6, -8, 0, -2], { line: false });
      f.px('ink', -2, -6, 1, 1).px('ink', 2, -6, 1, 1).px('ink', 0, -4, 1, 1);
    },
  ]);
  b.anim('shot', 8, true, [(f) => f.ell('mud', 0, -5, 3.2, 3.2).px('mud', -1, -6, 1, 1, 2), (f) => f.ell('mud', 0, -5, 3.6, 2.8).px('mud', 0, -6, 1, 1, 2)]);
  return { id: 'props', cw: 56, ch: 32, ax: 27, ay: 29, frames: b.frames, anims: b.anims };
}

function fxSheet(): SheetDef {
  const b = new SheetBuilder();
  // A beaten monster turns into a puff of dust and stars. Nothing graphic.
  b.anim('poof', 12, false, [
    (f) => f.ell('poof', 0, -10, 6, 6),
    (f) => {
      f.ell('poof', -5, -11, 5.5, 5.5).ell('poof', 5, -9, 5, 5).ell('poof', 0, -15, 5, 5);
      star(f, 9, -17, 3);
    },
    (f) => {
      f.ell('poof', -9, -12, 4, 4).ell('poof', 8, -8, 3.5, 3.5).ell('poof', 1, -19, 3.5, 3.5);
      star(f, -8, -20, 3);
      star(f, 11, -18, 2.5);
    },
    (f) => {
      f.ell('poof', -11, -14, 2, 2).ell('poof', 10, -7, 1.8, 1.8).ell('poof', 2, -21, 1.8, 1.8);
      star(f, 12, -20, 2);
    },
  ]);
  b.anim('hit', 16, false, [(f) => star(f, 0, -11, 5, 'white'), (f) => star(f, 0, -11, 9), (f) => star(f, 0, -11, 6, 'white')]);
  b.anim('dizzy', 6, true, [
    (f) => {
      star(f, -7, -10, 3);
      star(f, 6, -13, 2.5);
    },
    (f) => {
      star(f, 7, -10, 3);
      star(f, -6, -13, 2.5);
    },
  ]);
  return { id: 'fx', cw: 32, ch: 28, ax: 16, ay: 26, frames: b.frames, anims: b.anims };
}

function backdropSheet(): SheetDef {
  const b = new SheetBuilder();
  const W = 128;
  const wrap = (f: Fig, draw: () => void) => {
    for (const dx of [-W, 0, W]) f.at(dx, 0, 0, draw);
  };
  // Far tree line: quiet, one color family, so the characters stand out.
  b.anim('far', 1, false, [
    (f) =>
      wrap(f, () => {
        for (const [x, r] of [[10, 15], [34, 19], [60, 14], [84, 20], [110, 16]] as const) f.ell('treeFar', x, -r * 0.9, r, r * 1.05, { shade: 1 });
        f.px('treeFar', 0, -8, W, 8);
      }),
  ]);
  // Near row: shrubs and a low fence.
  b.anim('near', 1, false, [
    (f) =>
      wrap(f, () => {
        for (let x = 4; x < W; x += 12) f.part(() => f.px('fence', x, -15, 4, 15));
        f.part(() => f.px('fence', 0, -11, W, 3));
        for (const [x, r] of [[22, 9], [70, 11], [104, 8]] as const)
          f.part(() => {
            f.cap('trunk', x, -2, x, -6, 1.5);
            f.ell('treeNear', x, -r - 3, r * 1.25, r);
          });
      }),
  ]);
  return { id: 'backdrop', cw: W, ch: 48, ax: 0, ay: 48, frames: b.frames, anims: b.anims, tile: true };
}

/** Every sprite sheet in the game. */
export function allSheets(): SheetDef[] {
  return [
    heroSheet(),
    enemySheet('shambler', ZOMBIE, [56, 52, 22, 48], 'shamble'),
    // An example of a holiday swap: the same puppet in frosty colors with a scarf.
    enemySheet('shamblerFrost', { ...ZOMBIE, onTorso: (f) => f.px('band', -5, -11, 10, 2).px('band', -5, -9, 2, 4) }, [56, 52, 22, 48], 'shamble', {
      zskin: '#a8dcf0',
      zshirt: '#f4f1e6',
      zpants: '#5a8fc0',
      zhair: '#e8f4fb',
    }),
    enemySheet('lunger', GHOUL, [56, 48, 22, 44], 'lunge'),
    enemySheet('tosser', IMP, [40, 40, 16, 36], 'toss'),
    bossSheet(),
    critterSheet('dog', DOG),
    critterSheet('squirrel', SQUIRREL),
    critterSheet('armadillo', ARMADILLO),
    critterSheet('cottontail', COTTONTAIL),
    propsSheet(),
    fxSheet(),
    backdropSheet(),
  ];
}
