/**
 * Turns the game World into a flat list of things to draw. Still no phone
 * code: the list is plain data, so it is tested, and the part that paints it
 * (components/arcade/stage.tsx) can be swapped for a faster one later
 * without touching rules or art.
 */
import { ATLAS } from './atlas.generated';
import { type Actor, type GameEvent, type World } from './rules';
import { animName, type Skin, type SkinRole } from './skins';

/** Height of the stage in art pixels, and where the street begins. */
export const VIEW_H = 124;
export const GROUND_TOP = 72;
export const TILE_W = 128;

type Meta = { cw: number; ch: number; ax: number; ay: number; cols: number; anims: Record<string, { from: number; count: number; fps: number; loop: boolean }> };
export const sheetMeta = (sheet: string): Meta | undefined => (ATLAS as unknown as Record<string, Meta>)[sheet];

export function frameOf(sheet: string, anim: string, t: number): number {
  const meta = sheetMeta(sheet);
  const a = meta?.anims[anim];
  if (!a) return 0;
  const i = Math.floor(Math.max(0, t) * a.fps);
  return a.from + (a.loop ? i % a.count : Math.min(i, a.count - 1));
}

export type Draw = {
  key: string;
  sheet: string;
  frame: number;
  /** Where the feet are on the stage, in art pixels. */
  x: number;
  y: number;
  flip: boolean;
  /** Width of the soft shadow under it, or 0. */
  shadow: number;
  /** Drawn pale for a moment after a hit. */
  flash: boolean;
  /** Blinking while safe after being hurt. */
  hidden: boolean;
};

export type Fx = { id: number; kind: 'poof' | 'hit' | 'dizzy'; x: number; z: number; t: number };

const FX_LIFE = { poof: 4 / 12, hit: 3 / 16, dizzy: 0.5 };

/** Effects are born from events and fade on their own. */
export function advanceFx(list: Fx[], events: GameEvent[], dt: number, nextId: () => number): Fx[] {
  const out = list.map((f) => ({ ...f, t: f.t + dt })).filter((f) => f.t < FX_LIFE[f.kind]);
  for (const e of events) {
    if (e.type === 'poof') out.push({ id: nextId(), kind: 'poof', x: e.x, z: e.z, t: 0 });
    else if (e.type === 'bonk') out.push({ id: nextId(), kind: 'hit', x: e.x, z: e.z, t: 0 });
    else if (e.type === 'stomp') out.push({ id: nextId(), kind: 'poof', x: e.x, z: e.z, t: 0 });
  }
  return out;
}

function animFor(a: Actor): string {
  if (a.role === 'hero') return a.state === 'attack' ? `attack${Math.max(1, a.combo)}` : a.state;
  if (a.role === 'boss') return a.state === 'settle' || a.state === 'idle' ? 'walk' : a.state;
  if (a.role === 'cage') return a.state === 'open' ? 'open' : 'idle';
  if (a.role === 'critter') return a.state === 'run' ? 'run' : 'cheer';
  if (a.role === 'shot' || a.role === 'snack') return 'idle';
  return a.state;
}

const SHADOW: Partial<Record<Actor['role'], number>> = { hero: 22, shambler: 22, lunger: 22, tosser: 16, boss: 60, critter: 14, shot: 8 };

export type Scene = { draws: Draw[]; farX: number; nearX: number };

export function buildScene(world: World, skins: Record<SkinRole, Skin>, fx: Fx[] = []): Scene {
  const draws: (Draw & { depth: number })[] = [];
  const add = (key: string, skin: Skin, anim: string, t: number, x: number, z: number, flip: boolean, extra: Partial<Draw> = {}, lift = 0) => {
    draws.push({ key, sheet: skin.sheet, frame: frameOf(skin.sheet, animName(skin, anim), t), x: Math.round(x - world.cameraX), y: GROUND_TOP + Math.round(z) - lift, flip, shadow: 0, flash: false, hidden: false, depth: z, ...extra });
  };

  if (world.level.boss) add('pedestal', skins.pedestal, 'idle', 0, world.level.boss.x, world.level.boss.z - 0.5, false);

  for (const a of world.actors) {
    const role: SkinRole = a.role === 'critter' ? ((a.kind ?? 'squirrel') as SkinRole) : (a.role as SkinRole);
    const skin = skins[role];
    if (!skin) continue;
    const onPedestal = a.role === 'boss' && a.state === 'statue' ? 6 : 0;
    add(`a${a.id}`, skin, animFor(a), a.t, a.x, a.z, a.face < 0, { shadow: onPedestal ? 0 : (SHADOW[a.role] ?? 0), flash: a.flash > 0, hidden: a.safe > 0 && a.state !== 'down' && Math.floor(a.safe * 12) % 2 === 0 }, onPedestal + (a.role === 'shot' ? 12 : 0));
    if (a.role === 'boss' && a.state === 'stun') {
      draws.push({ key: `dizzy${a.id}`, sheet: 'fx', frame: frameOf('fx', 'dizzy', a.t), x: Math.round(a.x - world.cameraX + a.face * 26), y: GROUND_TOP + Math.round(a.z) - 44, flip: false, shadow: 0, flash: false, hidden: false, depth: a.z + 0.2 });
    }
  }
  for (const f of fx) {
    draws.push({ key: `fx${f.id}`, sheet: 'fx', frame: frameOf('fx', f.kind, f.t), x: Math.round(f.x - world.cameraX), y: GROUND_TOP + Math.round(f.z) - (f.kind === 'hit' ? 12 : 0), flip: false, shadow: 0, flash: false, hidden: false, depth: f.z + 0.3 });
  }

  draws.sort((p, q) => p.depth - q.depth || (p.key < q.key ? -1 : 1));
  const wrap = (v: number) => -(((v % TILE_W) + TILE_W) % TILE_W);
  return { draws: draws.map(({ depth: _depth, ...d }) => d), farX: wrap(world.cameraX * 0.35), nearX: wrap(world.cameraX) };
}

/** One plain sentence for screen readers and the status line under the stage. */
export type StatusKey = 'start' | 'waveStart' | 'waveClear' | 'bossWake' | 'bossStun' | 'bossSettle' | 'cageOpen' | 'won' | 'heroDown';
export function statusFor(events: GameEvent[]): StatusKey | undefined {
  let found: StatusKey | undefined;
  for (const e of events) {
    if (e.type === 'waveStart' || e.type === 'waveClear' || e.type === 'bossWake' || e.type === 'bossStun' || e.type === 'bossSettle' || e.type === 'cageOpen' || e.type === 'won' || e.type === 'heroDown') found = e.type;
  }
  return found;
}
