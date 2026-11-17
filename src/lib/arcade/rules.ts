/**
 * Side-scroller rules (decision D-057): movement, bonks, enemies, scrolling,
 * waves, the boss and the rescue ending. No drawing and no phone code here, so
 * every rule can be tested. The screen only sends Input and draws the World.
 *
 * Units: one unit is one art pixel. x runs along the street, z is depth into
 * the street (0 is the back, DEPTH is the front). Time is in seconds.
 *
 * Tone rules built in (D-056, D-072): hits are bonks, beaten monsters poof,
 * the boss goes back to being a statue, and critters can never be hurt.
 */

export const STEP = 1 / 60;
export const DEPTH = 44;

export type EnemyRole = 'shambler' | 'lunger' | 'tosser';
/** Which hero the player chose. Each has its own reach and speed (block 2). */
export type HeroId = 'bo' | 'flor';
export type Role = 'hero' | EnemyRole | 'boss' | 'shot' | 'snack' | 'cage' | 'critter';
export type Difficulty = 'gentle' | 'classic';
export type State = 'idle' | 'walk' | 'attack' | 'wind' | 'hurt' | 'down' | 'statue' | 'wake' | 'charge' | 'stomp' | 'stun' | 'settle' | 'run' | 'cheer' | 'open';
export type Phase = 'play' | 'boss' | 'rescue' | 'won' | 'lost';

export type Input = { x: number; z: number; attack: boolean };
export const NO_INPUT: Input = { x: 0, z: 0, attack: false };

export type Spawn = { role: EnemyRole; side: 'left' | 'right'; delay: number; z: number };
export type Wave = { atX: number; spawns: Spawn[]; snack?: boolean };
export type Level = {
  id: string;
  length: number;
  waves: Wave[];
  /** Where the statue stands. Leave out for a level with no boss. */
  boss?: { x: number; z: number };
  /** Every level ends with a rescue. `critters` are skin-pack roles such as 'squirrel'. */
  cage: { x: number; z: number; critters: string[] };
  /** How the level looks. The rules ignore it; the painter reads it. */
  scenery?: { mood: string; backdrop: string };
};

export type Actor = {
  id: number;
  role: Role;
  /** For critters: which animal. */
  kind?: string;
  x: number;
  z: number;
  face: 1 | -1;
  hp: number;
  maxHp: number;
  state: State;
  /** Seconds spent in the current state. */
  t: number;
  /** Which bonk of the three-bonk combo (hero), or 0. */
  combo: number;
  /** The current swing has already landed or missed. */
  spent: boolean;
  /** Another bonk was asked for during this one. */
  queued: boolean;
  /** Seconds until this actor may act again. */
  cool: number;
  /** Seconds of safety after being hurt. */
  safe: number;
  /** Seconds left of the white flash after a hit. For drawing. */
  flash: number;
  /** Sideways push still to apply. */
  push: number;
};

export type GameEvent =
  | { type: 'bonk'; x: number; z: number; finisher: boolean; boss?: boolean }
  | { type: 'poof'; x: number; z: number; role: Role }
  | { type: 'heroHurt' | 'heroDown' | 'snack' | 'waveStart' | 'waveClear' | 'bossWake' | 'bossAngry' | 'bossStun' | 'bossSettle' | 'cageOpen' | 'won' | 'swing' | 'charge' }
  | { type: 'stomp'; x: number; z: number }
  | { type: 'rescued'; kind: string };

export type World = {
  level: Level;
  difficulty: Difficulty;
  heroId: HeroId;
  /** The boss has lost half its health and moves faster. */
  bossAngry: boolean;
  viewW: number;
  time: number;
  cameraX: number;
  /** While a wave or the boss is live the camera holds still. */
  locked: boolean;
  /** Index of the next wave to start. */
  wave: number;
  waveLive: boolean;
  pending: (Spawn & { at: number })[];
  actors: Actor[];
  nextId: number;
  rng: number;
  phase: Phase;
  score: number;
  /** Things that happened in the last step: for sounds, effects and screen readers. */
  events: GameEvent[];
  prevAttack: boolean;
  checkpoint: { x: number; wave: number };
  rescued: string[];
  /** Critters still to come out of the cage. */
  toRelease: string[];
  releaseT: number;
};

type Tuning = { heroHp: number; enemySpeed: number; wind: number; attackers: number; bossHp: number; bossCharge: number; bossStun: number };
export const TUNING: Record<Difficulty, Tuning> = {
  gentle: { heroHp: 12, enemySpeed: 0.8, wind: 1.4, attackers: 1, bossHp: 16, bossCharge: 105, bossStun: 3.2 },
  classic: { heroHp: 8, enemySpeed: 1, wind: 1, attackers: 2, bossHp: 24, bossCharge: 135, bossStun: 2.2 },
};

export type HeroStats = { speedX: number; speedZ: number; reach: number; depthReach: number; swing: number[]; lands: number; damage: number[]; hurt: number; safe: number; comboGap: number };
/**
 * Bo swings a pool noodle: quick feet, short reach. Flor swings a rake: long
 * reach, slower feet, a slower last swing that hits harder. Both have the same
 * health, so the choice is about how you like to play, not how hard it is.
 */
export const HEROES: Record<HeroId, HeroStats> = {
  bo: { speedX: 62, speedZ: 40, reach: 30, depthReach: 9, swing: [0.22, 0.22, 0.34], lands: 0.07, damage: [1, 1, 2], hurt: 0.3, safe: 1.1, comboGap: 0.4 },
  flor: { speedX: 52, speedZ: 36, reach: 40, depthReach: 9, swing: [0.26, 0.26, 0.42], lands: 0.09, damage: [1, 1, 3], hurt: 0.3, safe: 1.1, comboGap: 0.42 },
};
export const HERO_IDS: HeroId[] = ['bo', 'flor'];
/** Bo's numbers. Kept for older code and tests that knew only one hero. */
export const HERO = HEROES.bo;
export const heroStats = (world: Pick<World, 'heroId'>): HeroStats => HEROES[world.heroId];
export const ENEMY: Record<EnemyRole, { hp: number; speed: number; reach: number; wind: number; rest: number; score: number }> = {
  shambler: { hp: 3, speed: 22, reach: 16, wind: 0.45, rest: 0.9, score: 100 },
  lunger: { hp: 2, speed: 34, reach: 62, wind: 0.5, rest: 1.2, score: 150 },
  tosser: { hp: 2, speed: 30, reach: 84, wind: 0.5, rest: 1.6, score: 150 },
};
const LUNGE = { speed: 150, time: 0.36 };
const SHOT = { speed: 72, life: 2.4 };
const BOSS = { walkZ: 26, wind: 0.9, wake: 1.2, stompReach: 34, stompWind: 0.55, score: 2000, wide: 22 };
/** Once half its health is gone the boss winds up faster and charges harder. */
export const ANGRY = { wind: 0.7, charge: 1.15 };

// ---------- setup ----------

function actor(world: Pick<World, 'nextId'>, role: Role, x: number, z: number, hp: number, state: State): Actor {
  return { id: world.nextId++, role, x, z, face: 1, hp, maxHp: hp, state, t: 0, combo: 0, spent: false, queued: false, cool: 0, safe: 0, flash: 0, push: 0 };
}

export function createWorld(level: Level, options: { difficulty?: Difficulty; viewW?: number; seed?: number; hero?: HeroId } = {}): World {
  const difficulty = options.difficulty ?? 'gentle';
  const world: World = {
    level,
    difficulty,
    heroId: options.hero ?? 'bo',
    bossAngry: false,
    viewW: options.viewW ?? 180,
    time: 0,
    cameraX: 0,
    locked: false,
    wave: 0,
    waveLive: false,
    pending: [],
    actors: [],
    nextId: 1,
    rng: (options.seed ?? 1) >>> 0 || 1,
    phase: 'play',
    score: 0,
    events: [],
    prevAttack: false,
    checkpoint: { x: 24, wave: 0 },
    rescued: [],
    toRelease: [],
    releaseT: 0,
  };
  world.actors.push(actor(world, 'hero', 24, DEPTH / 2, TUNING[difficulty].heroHp, 'idle'));
  placeFixtures(world);
  return world;
}

function placeFixtures(world: World) {
  const { level } = world;
  const cage = actor(world, 'cage', level.cage.x, level.cage.z, 1, 'idle');
  world.actors.push(cage);
  if (level.boss) {
    const boss = actor(world, 'boss', level.boss.x, level.boss.z, TUNING[world.difficulty].bossHp, 'statue');
    boss.face = -1;
    world.actors.push(boss);
  }
}

/** After a knock-out: start again from the last checkpoint with full health. Score is kept. */
export function retry(world: World): World {
  const fresh = createWorld(world.level, { difficulty: world.difficulty, viewW: world.viewW, seed: world.rng, hero: world.heroId });
  fresh.score = world.score;
  fresh.wave = world.checkpoint.wave;
  fresh.checkpoint = { ...world.checkpoint };
  const hero = heroOf(fresh);
  hero.x = world.checkpoint.x;
  fresh.cameraX = clamp(hero.x - fresh.viewW * 0.4, 0, Math.max(0, fresh.level.length - fresh.viewW));
  return fresh;
}

// ---------- helpers ----------

export function heroOf(world: World): Actor {
  return world.actors[0];
}
export const isEnemy = (a: Actor): boolean => a.role === 'shambler' || a.role === 'lunger' || a.role === 'tosser';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const sign = (v: number): 1 | -1 => (v < 0 ? -1 : 1);

/** Small repeatable random number generator for levels that need chance. A game still replays exactly from its seed. */
export function chance(world: World): number {
  let t = (world.rng += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  world.rng >>>= 0;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function setState(a: Actor, state: State) {
  a.state = state;
  a.t = 0;
  a.spent = false;
}

function arena(world: World): [number, number] {
  return [world.cameraX + 8, world.cameraX + world.viewW - 8];
}

// ---------- one step ----------

/** Advance the game by one STEP. Changes `world` in place and returns it. */
export function step(world: World, input: Input): World {
  world.events = [];
  if (world.phase === 'won' || world.phase === 'lost') return world;
  world.time += STEP;
  const hero = heroOf(world);

  for (const a of world.actors) {
    a.t += STEP;
    a.cool = Math.max(0, a.cool - STEP);
    a.safe = Math.max(0, a.safe - STEP);
    a.flash = Math.max(0, a.flash - STEP);
    if (a.push !== 0) {
      const move = a.push * Math.min(1, STEP * 9);
      a.x += move;
      a.push -= move;
      if (Math.abs(a.push) < 0.5) a.push = 0;
    }
  }

  stepHero(world, hero, input);
  for (const a of [...world.actors]) {
    if (isEnemy(a)) stepEnemy(world, a, hero);
    else if (a.role === 'boss') stepBoss(world, a, hero);
    else if (a.role === 'shot') stepShot(world, a, hero);
    else if (a.role === 'snack') stepSnack(world, a, hero);
    else if (a.role === 'critter') stepCritter(world, a);
  }
  stepWaves(world, hero);
  stepRescue(world, hero);
  stepCamera(world, hero);

  // Keep everyone on the street.
  const [left, right] = arena(world);
  hero.x = clamp(hero.x, left, right);
  hero.z = clamp(hero.z, 0, DEPTH);
  for (const a of world.actors) {
    if (isEnemy(a) || a.role === 'boss') {
      a.z = clamp(a.z, 0, DEPTH);
      // Monsters stay inside a held screen. The boss looks after its own place.
      if (isEnemy(a) && world.locked && a.state !== 'walk') a.x = clamp(a.x, left - 4, right + 4);
    }
  }
  world.prevAttack = input.attack;
  return world;
}

function stepHero(world: World, hero: Actor, input: Input) {
  const HERO = heroStats(world);
  const pressed = input.attack && !world.prevAttack;
  if (world.phase === 'rescue') {
    if (hero.state !== 'cheer') setState(hero, 'cheer');
    return;
  }
  if (hero.state === 'down') {
    if (hero.t > 0.9) world.phase = 'lost';
    return;
  }
  if (hero.state === 'hurt') {
    if (hero.t < HERO.hurt) return;
    setState(hero, 'idle');
  }
  if (hero.state === 'attack') {
    const i = hero.combo - 1;
    if (pressed) hero.queued = true;
    if (!hero.spent && hero.t >= HERO.lands) {
      hero.spent = true;
      bonk(world, hero, HERO.damage[i], hero.combo === 3);
    }
    if (hero.t < HERO.swing[i]) return;
    if (hero.queued && hero.combo < 3) {
      hero.combo += 1;
      hero.queued = false;
      setState(hero, 'attack');
      world.events.push({ type: 'swing' });
      return;
    }
    hero.queued = false;
    setState(hero, 'idle');
  }
  if (pressed) {
    // A new press soon after the last bonk carries the combo on. Otherwise start over.
    hero.combo = hero.combo > 0 && hero.combo < 3 && hero.t <= HERO.comboGap ? hero.combo + 1 : 1;
    setState(hero, 'attack');
    world.events.push({ type: 'swing' });
    hero.x += hero.face * 2;
    return;
  }
  if (hero.t > HERO.comboGap) hero.combo = 0;
  const mx = clamp(input.x, -1, 1);
  const mz = clamp(input.z, -1, 1);
  if (mx !== 0 || mz !== 0) {
    hero.x += mx * HERO.speedX * STEP;
    hero.z += mz * HERO.speedZ * STEP;
    if (mx !== 0) hero.face = sign(mx);
    if (hero.state !== 'walk') {
      const combo = hero.combo;
      const since = hero.t;
      setState(hero, 'walk');
      // Walking does not reset the combo clock.
      hero.combo = combo;
      hero.t = since;
    }
  } else if (hero.state === 'walk') {
    const combo = hero.combo;
    const since = hero.t;
    setState(hero, 'idle');
    hero.combo = combo;
    hero.t = since;
  }
}

/** The hero's swing. Each monster in reach is bonked once. Critters, the cage and snacks are never targets. */
function bonk(world: World, hero: Actor, damage: number, finisher: boolean) {
  const HERO = heroStats(world);
  for (const a of [...world.actors]) {
    if (!isEnemy(a) && a.role !== 'boss') continue;
    if (a.role === 'boss' && (a.state === 'statue' || a.state === 'wake' || a.state === 'settle')) continue;
    const wide = a.role === 'boss' ? BOSS.wide : 0;
    const ahead = (a.x - hero.x) * hero.face;
    if (ahead < -6 - wide || ahead > HERO.reach + wide) continue;
    if (Math.abs(a.z - hero.z) > HERO.depthReach + (a.role === 'boss' ? 4 : 0)) continue;
    world.events.push({ type: 'bonk', x: a.x - hero.face * wide * 0.5, z: a.z, finisher, boss: a.role === 'boss' });
    a.flash = 0.12;
    if (a.role === 'boss') {
      a.hp -= a.state === 'stun' ? damage * 2 : damage;
      if (!world.bossAngry && a.hp > 0 && a.hp <= a.maxHp / 2) {
        world.bossAngry = true;
        world.events.push({ type: 'bossAngry' });
      }
      if (a.hp <= 0) {
        a.hp = 0;
        world.score += BOSS.score;
        setState(a, 'settle');
      }
      continue;
    }
    a.hp -= damage;
    a.push = hero.face * (finisher ? 26 : 9);
    if (a.hp <= 0) {
      world.score += ENEMY[a.role as EnemyRole].score;
      world.events.push({ type: 'poof', x: a.x, z: a.z, role: a.role });
      world.actors.splice(world.actors.indexOf(a), 1);
    } else setState(a, 'hurt');
  }
}

function hurtHero(world: World, hero: Actor, damage: number, from: number, push: number) {
  const HERO = heroStats(world);
  if (hero.safe > 0 || hero.state === 'down' || world.phase === 'rescue') return;
  hero.hp = Math.max(0, hero.hp - damage);
  hero.safe = HERO.safe;
  hero.push = sign(hero.x - from) * push;
  hero.combo = 0;
  hero.queued = false;
  if (hero.hp === 0) {
    setState(hero, 'down');
    world.events.push({ type: 'heroDown' });
  } else {
    setState(hero, 'hurt');
    world.events.push({ type: 'heroHurt' });
  }
}

function stepEnemy(world: World, e: Actor, hero: Actor) {
  const tune = TUNING[world.difficulty];
  const kind = ENEMY[e.role as EnemyRole];
  const dx = hero.x - e.x;
  const dz = hero.z - e.z;
  if (e.state === 'hurt') {
    if (e.t >= 0.28) setState(e, 'idle');
    return;
  }
  if (e.state === 'wind') {
    if (e.t < kind.wind * tune.wind) return;
    setState(e, 'attack');
    if (e.role === 'tosser') {
      const shot = actor(world, 'shot', e.x + e.face * 8, e.z, 1, 'idle');
      shot.face = e.face;
      world.actors.push(shot);
    }
    return;
  }
  if (e.state === 'attack') {
    if (e.role === 'lunger') {
      e.x += e.face * LUNGE.speed * STEP;
      if (!e.spent && Math.abs(hero.x - e.x) < 10 && Math.abs(dz) < 7) {
        e.spent = true;
        hurtHero(world, hero, 1, e.x, 14);
      }
      if (e.t >= LUNGE.time) rest(e, kind.rest);
    } else if (e.role === 'shambler') {
      if (!e.spent && e.t >= 0.05) {
        e.spent = true;
        const ahead = dx * e.face;
        if (ahead > -4 && ahead < kind.reach + 4 && Math.abs(dz) < 8) hurtHero(world, hero, 1, e.x, 12);
      }
      if (e.t >= 0.3) rest(e, kind.rest);
    } else if (e.t >= 0.3) rest(e, kind.rest);
    return;
  }

  // Walking into position. Each enemy keeps its own lane beside the hero so they do not stack.
  e.face = sign(dx);
  const lane = ((e.id % 3) - 1) * 6;
  const side = dx === 0 ? (e.id % 2 ? 1 : -1) : -sign(dx);
  const [left, right] = arena(world);
  const wantX = world.locked ? clamp(hero.x + side * (kind.reach - 3), left + 2, right - 2) : hero.x + side * (kind.reach - 3);
  const wantZ = e.role === 'shambler' ? hero.z + lane * 0.5 : hero.z + lane * 0.3;
  const toX = wantX - e.x;
  const toZ = wantZ - e.z;
  const speed = kind.speed * tune.enemySpeed;
  const near = Math.abs(toX) < 3 && Math.abs(toZ) < 3;
  if (!near) {
    const len = Math.hypot(toX, toZ) || 1;
    e.x += (toX / len) * speed * STEP;
    e.z += (toZ / len) * speed * 0.7 * STEP;
    if (e.state !== 'walk') setState(e, 'walk');
  } else if (e.state !== 'idle') setState(e, 'idle');

  const lined = Math.abs(dz) < 6 && Math.abs(dx) < kind.reach + 4 && Math.abs(dx) > (e.role === 'shambler' ? 0 : 24);
  const busy = world.actors.filter((a) => isEnemy(a) && (a.state === 'wind' || a.state === 'attack')).length;
  if (lined && e.cool === 0 && busy < tune.attackers && onScreen(world, e)) setState(e, 'wind');
}

function rest(e: Actor, seconds: number) {
  setState(e, 'idle');
  e.cool = seconds;
}

function onScreen(world: World, a: Actor): boolean {
  return a.x > world.cameraX + 4 && a.x < world.cameraX + world.viewW - 4;
}

function stepShot(world: World, shot: Actor, hero: Actor) {
  shot.x += shot.face * SHOT.speed * STEP;
  if (Math.abs(hero.x - shot.x) < 7 && Math.abs(hero.z - shot.z) < 7 && hero.safe === 0 && hero.state !== 'down') {
    hurtHero(world, hero, 1, shot.x, 8);
    shot.t = SHOT.life;
  }
  if (shot.t >= SHOT.life) world.actors.splice(world.actors.indexOf(shot), 1);
}

function stepSnack(world: World, snack: Actor, hero: Actor) {
  if (Math.abs(hero.x - snack.x) < 10 && Math.abs(hero.z - snack.z) < 8) {
    hero.hp = Math.min(hero.maxHp, hero.hp + 3);
    world.events.push({ type: 'snack' });
    world.actors.splice(world.actors.indexOf(snack), 1);
  }
}

function stepBoss(world: World, boss: Actor, hero: Actor) {
  const tune = TUNING[world.difficulty];
  const [left, right] = arena(world);
  const home = world.level.boss!;
  switch (boss.state) {
    case 'statue':
      return;
    case 'wake':
      if (boss.t >= BOSS.wake) setState(boss, 'walk');
      return;
    case 'walk': {
      boss.face = sign(hero.x - boss.x);
      const dz = hero.z - boss.z;
      boss.z += clamp(dz, -1, 1) * BOSS.walkZ * tune.enemySpeed * STEP;
      const close = Math.abs(hero.x - boss.x) < BOSS.stompReach - 4 && Math.abs(dz) < 12;
      if (close && boss.t > 0.7) setState(boss, 'stomp');
      else if ((Math.abs(dz) < 4 && boss.t > 0.5) || boss.t > 2.2) setState(boss, 'wind');
      return;
    }
    case 'wind':
      if (boss.t >= BOSS.wind * tune.wind * (world.bossAngry ? ANGRY.wind : 1)) {
        setState(boss, 'charge');
        world.events.push({ type: 'charge' });
      }
      return;
    case 'charge':
      boss.x += boss.face * tune.bossCharge * (world.bossAngry ? ANGRY.charge : 1) * STEP;
      if (!boss.spent && Math.abs(hero.x - boss.x) < BOSS.wide && Math.abs(hero.z - boss.z) < 9) {
        boss.spent = true;
        hurtHero(world, hero, 2, boss.x, 30);
      }
      // Running into the edge of the arena leaves it dizzy: the best time to bonk.
      if (boss.x <= left + BOSS.wide || boss.x >= right - BOSS.wide) {
        boss.x = clamp(boss.x, left + BOSS.wide, right - BOSS.wide);
        setState(boss, 'stun');
        world.events.push({ type: 'bossStun' });
      }
      return;
    case 'stomp':
      if (!boss.spent && boss.t >= BOSS.stompWind * tune.wind) {
        boss.spent = true;
        world.events.push({ type: 'stomp', x: boss.x, z: boss.z });
        if (Math.abs(hero.x - boss.x) < BOSS.stompReach && Math.abs(hero.z - boss.z) < 14) hurtHero(world, hero, 1, boss.x, 34);
      }
      if (boss.t >= BOSS.stompWind * tune.wind + 0.5) setState(boss, 'walk');
      return;
    case 'stun':
      if (boss.t >= tune.bossStun) setState(boss, 'walk');
      return;
    case 'settle': {
      // Beaten: the spell breaks. It walks home and is a statue again.
      const toX = home.x - boss.x;
      const toZ = home.z - boss.z;
      if (Math.abs(toX) < 2 && Math.abs(toZ) < 2) {
        boss.x = home.x;
        boss.z = home.z;
        boss.face = -1;
        setState(boss, 'statue');
        world.events.push({ type: 'bossSettle' });
        return;
      }
      if (Math.abs(toX) >= 2) boss.face = sign(toX);
      boss.x += clamp(toX, -1, 1) * 46 * STEP;
      boss.z += clamp(toZ, -1, 1) * 30 * STEP;
      return;
    }
    default:
      setState(boss, 'walk');
  }
}

function stepWaves(world: World, hero: Actor) {
  const { level } = world;
  if (world.phase !== 'play' && world.phase !== 'boss') return;

  if (world.waveLive) {
    for (let i = world.pending.length - 1; i >= 0; i--) {
      const spawn = world.pending[i];
      if (world.time < spawn.at) continue;
      const x = spawn.side === 'right' ? world.cameraX + world.viewW + 18 : world.cameraX - 18;
      const e = actor(world, spawn.role, x, clamp(spawn.z, 0, DEPTH), ENEMY[spawn.role].hp, 'walk');
      e.face = spawn.side === 'right' ? -1 : 1;
      world.actors.push(e);
      world.pending.splice(i, 1);
    }
    if (world.pending.length === 0 && !world.actors.some(isEnemy)) {
      const done = level.waves[world.wave - 1];
      world.waveLive = false;
      world.locked = false;
      world.checkpoint = { x: hero.x, wave: world.wave };
      world.events.push({ type: 'waveClear' });
      if (done.snack) world.actors.push(actor(world, 'snack', world.cameraX + world.viewW * 0.62, DEPTH / 2, 1, 'idle'));
    }
    return;
  }

  const next = level.waves[world.wave];
  if (next && hero.x >= next.atX) {
    world.wave += 1;
    world.waveLive = true;
    world.locked = true;
    world.pending = next.spawns.map((s) => ({ ...s, at: world.time + s.delay }));
    world.events.push({ type: 'waveStart' });
    return;
  }

  // All waves done: the boss, if the level has one.
  const boss = world.actors.find((a) => a.role === 'boss');
  if (!next && boss && boss.state === 'statue' && world.phase === 'play' && hero.x >= boss.x - 96) {
    world.phase = 'boss';
    world.locked = true;
    setState(boss, 'wake');
    world.events.push({ type: 'bossWake' });
  }
}

function stepRescue(world: World, hero: Actor) {
  const { level } = world;
  const cage = world.actors.find((a) => a.role === 'cage')!;
  if (world.phase === 'play' || world.phase === 'boss') {
    const boss = world.actors.find((a) => a.role === 'boss');
    const bossDone = boss ? world.phase === 'boss' && boss.state === 'statue' : world.wave >= level.waves.length && !world.waveLive;
    const near = boss ? true : hero.x >= cage.x - 56;
    if (bossDone && near) {
      world.phase = 'rescue';
      world.locked = true;
      setState(cage, 'open');
      world.toRelease = [...level.cage.critters];
      world.releaseT = 0.5;
      world.events.push({ type: 'cageOpen' });
    }
    return;
  }
  if (world.phase !== 'rescue') return;
  world.releaseT -= STEP;
  if (world.toRelease.length && world.releaseT <= 0) {
    const kind = world.toRelease.shift()!;
    const c = actor(world, 'critter', cage.x + 14, cage.z + 4 + ((world.rescued.length % 3) - 1) * 5, 1, 'cheer');
    c.kind = kind;
    c.face = -1;
    world.actors.push(c);
    world.rescued.push(kind);
    world.events.push({ type: 'rescued', kind });
    world.releaseT = 0.45;
  }
  if (!world.toRelease.length && !world.actors.some((a) => a.role === 'critter')) {
    world.phase = 'won';
    world.events.push({ type: 'won' });
  }
}

/** Freed critters cheer, then run off past the hero. Unharmed and happy. */
function stepCritter(world: World, c: Actor) {
  if (c.state === 'cheer') {
    if (c.t >= 1) setState(c, 'run');
    return;
  }
  c.x -= 84 * STEP;
  if (c.x < world.cameraX - 20) world.actors.splice(world.actors.indexOf(c), 1);
}

function stepCamera(world: World, hero: Actor) {
  const max = Math.max(0, world.level.length - world.viewW);
  if (world.phase === 'boss' || world.phase === 'rescue') {
    // Slide to the end of the street so the whole arena is in view.
    world.cameraX = Math.min(max, world.cameraX + 110 * STEP);
    return;
  }
  if (world.locked) return;
  // The street scrolls forward only, as in the old arcade games.
  world.cameraX = clamp(Math.max(world.cameraX, hero.x - world.viewW * 0.4), 0, max);
}

/** A short text of the whole game state. Two games with the same text are the same game. */
export function fingerprint(world: World): string {
  return [world.phase, world.score, world.cameraX.toFixed(2), ...world.actors.map((a) => `${a.role}:${a.state}:${a.x.toFixed(2)}:${a.z.toFixed(2)}:${a.hp}`)].join('|');
}
