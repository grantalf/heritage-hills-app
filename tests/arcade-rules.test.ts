import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SHORT_LEVEL, WORKSHOP_LEVEL } from '../src/lib/arcade/levels';
import { createWorld, DEPTH, ENEMY, fingerprint, HERO, heroOf, isEnemy, NO_INPUT, retry, step, STEP, TUNING, type Actor, type GameEvent, type Input, type World } from '../src/lib/arcade/rules';

const seconds = (s: number) => Math.round(s / STEP);
function run(world: World, input: Input | ((w: World) => Input), steps: number, seen: GameEvent[] = []): GameEvent[] {
  for (let i = 0; i < steps; i++) {
    step(world, typeof input === 'function' ? input(world) : input);
    seen.push(...world.events);
  }
  return seen;
}
const boss = (w: World) => w.actors.find((a) => a.role === 'boss') as Actor;
/** Tap the bonk button: down on one step, up on the next. */
const tap = (w: World): Input => ({ x: 0, z: 0, attack: !w.prevAttack });

/** A simple player: walks right, lines up with the nearest monster, bonks, and steps out of the way of the boss. */
function bot(w: World): Input {
  const hero = heroOf(w);
  const b = boss(w);
  const away = (fromZ: number) => (hero.z >= fromZ ? (hero.z < DEPTH - 1 ? 1 : -1) : hero.z > 1 ? -1 : 1);
  const goBonk = (t: Actor, reach: number): Input => {
    const dx = t.x - hero.x;
    const dz = t.z - hero.z;
    if (Math.abs(dz) > 5) return { x: Math.abs(dx) > reach ? Math.sign(dx) : 0, z: Math.sign(dz), attack: false };
    if (Math.abs(dx) > reach) return { x: Math.sign(dx), z: 0, attack: false };
    if (Math.sign(dx) !== hero.face && Math.abs(dx) > 4) return { x: Math.sign(dx), z: 0, attack: false };
    return tap(w);
  };
  if (w.phase === 'boss' && b && b.state !== 'statue' && b.state !== 'settle') {
    if (b.state === 'stun') return goBonk(b, HERO.reach + 14);
    const dz = Math.abs(hero.z - b.z);
    const dx = Math.abs(hero.x - b.x);
    return { x: dx < 52 ? Math.sign(hero.x - b.x) || 1 : 0, z: dz < 15 ? away(b.z) : 0, attack: false };
  }
  const shot = w.actors.find((a) => a.role === 'shot' && Math.abs(a.x - hero.x) < 40 && Math.abs(a.z - hero.z) < 9);
  if (shot) return { x: 0, z: away(shot.z), attack: false };
  const lunging = w.actors.find((a) => a.role === 'lunger' && (a.state === 'wind' || a.state === 'attack') && Math.abs(a.z - hero.z) < 9);
  if (lunging) return { x: 0, z: away(lunging.z), attack: false };
  const enemies = w.actors.filter(isEnemy).sort((p, q) => Math.abs(p.x - hero.x) - Math.abs(q.x - hero.x));
  if (enemies.length) return goBonk(enemies[0], HERO.reach - 6);
  return { x: 1, z: 0, attack: false };
}

test('the same seed and the same buttons give exactly the same game', () => {
  const a = createWorld(WORKSHOP_LEVEL, { seed: 7 });
  const b = createWorld(WORKSHOP_LEVEL, { seed: 7 });
  run(a, bot, seconds(40));
  run(b, bot, seconds(40));
  assert.equal(fingerprint(a), fingerprint(b));
});

test('the hero walks, and stays on the street and on the screen', () => {
  const w = createWorld(SHORT_LEVEL);
  const startX = heroOf(w).x;
  run(w, { x: 1, z: 0, attack: false }, seconds(1));
  assert.ok(Math.abs(heroOf(w).x - startX - HERO.speedX) < 1.5, 'one second of walking covers the walking speed');
  run(w, { x: 0, z: 1, attack: false }, seconds(5));
  assert.equal(heroOf(w).z, DEPTH);
  run(w, { x: -1, z: -1, attack: false }, seconds(8));
  assert.equal(heroOf(w).z, 0);
  assert.ok(heroOf(w).x >= w.cameraX + 8, 'cannot walk off the left edge');
});

test('three quick presses make a three-bonk combo, and the third bonk is the big one', () => {
  const w = createWorld(SHORT_LEVEL);
  const hero = heroOf(w);
  const dummy: Actor = { ...hero, id: 99, role: 'shambler', x: hero.x + 18, hp: 50, maxHp: 50, state: 'idle', cool: 99 };
  w.actors.push(dummy);
  const seen: GameEvent[] = [];
  for (let i = 0; i < seconds(0.85); i++) {
    // Hold the practice dummy in place so every swing can reach it.
    Object.assign(dummy, { x: hero.x + 18, z: hero.z, push: 0, state: 'idle' });
    step(w, tap(w));
    seen.push(...w.events);
  }
  const bonks = seen.filter((e) => e.type === 'bonk');
  assert.equal(bonks.length, 3);
  assert.deepEqual(bonks.map((e) => e.type === 'bonk' && e.finisher), [false, false, true]);
  assert.equal(50 - dummy.hp, HERO.damage[0] + HERO.damage[1] + HERO.damage[2]);
});

test('holding the button down gives one swing, not a stream', () => {
  const w = createWorld(SHORT_LEVEL);
  let swings = 0;
  let last = 'idle';
  for (let i = 0; i < seconds(2); i++) {
    step(w, { x: 0, z: 0, attack: true });
    if (heroOf(w).state === 'attack' && last !== 'attack') swings += 1;
    last = heroOf(w).state;
  }
  assert.equal(swings, 1);
  assert.equal(heroOf(w).state, 'idle');
});

test('a bonk misses a monster that is in another lane or behind the hero', () => {
  const w = createWorld(SHORT_LEVEL);
  const hero = heroOf(w);
  w.actors.push({ ...hero, id: 98, role: 'shambler', x: hero.x + 18, z: hero.z + HERO.depthReach + 3, hp: 3, maxHp: 3, cool: 99 });
  w.actors.push({ ...hero, id: 99, role: 'shambler', x: hero.x - 20, hp: 3, maxHp: 3, cool: 99 });
  const seen = run(w, tap, 12);
  assert.equal(seen.filter((e) => e.type === 'bonk').length, 0);
});

test('a wave holds the camera still until every monster has poofed, then the street opens again', () => {
  const w = createWorld(SHORT_LEVEL, { difficulty: 'classic' });
  const seen: GameEvent[] = [];
  run(w, { x: 1, z: 0, attack: false }, seconds(1.6), seen);
  assert.ok(seen.some((e) => e.type === 'waveStart'));
  assert.equal(w.locked, true);
  const held = w.cameraX;
  run(w, bot, seconds(1), seen);
  assert.equal(w.cameraX, held, 'camera does not move during a wave');
  run(w, bot, seconds(20), seen);
  assert.ok(seen.some((e) => e.type === 'poof'));
  assert.ok(seen.some((e) => e.type === 'waveClear'));
  assert.equal(w.locked, w.phase !== 'play');
});

test('the camera never scrolls backward', () => {
  const w = createWorld(WORKSHOP_LEVEL);
  run(w, { x: 1, z: 0, attack: false }, seconds(1.2));
  const at = w.cameraX;
  run(w, { x: -1, z: 0, attack: false }, seconds(2));
  assert.equal(w.cameraX, at);
});

test('after being hurt the hero is safe for a moment', () => {
  const w = createWorld(SHORT_LEVEL, { difficulty: 'classic' });
  run(w, { x: 1, z: 0, attack: false }, seconds(1.6));
  const hero = heroOf(w);
  const seen = run(w, NO_INPUT, seconds(6));
  const hurts = seen.filter((e) => e.type === 'heroHurt').length;
  assert.ok(hurts >= 1, 'a monster reaches a hero who stands still');
  assert.equal(TUNING.classic.heroHp - hero.hp, hurts, 'each hurt costs one, never two at once');
  assert.ok(hurts <= Math.ceil(6 / HERO.safe));
});

test('never more monsters winding up at once than the difficulty allows', () => {
  for (const difficulty of ['gentle', 'classic'] as const) {
    const w = createWorld(WORKSHOP_LEVEL, { difficulty, seed: 3 });
    for (let i = 0; i < seconds(45) && w.phase === 'play'; i++) {
      step(w, i < seconds(8) ? bot(w) : { x: 1, z: 0, attack: false });
      const busy = w.actors.filter((a) => isEnemy(a) && a.state === 'wind').length;
      assert.ok(busy <= TUNING[difficulty].attackers, `${difficulty}: ${busy} winding up`);
    }
  }
});

test('a knocked-out hero can try again from the last checkpoint with the score kept', () => {
  const w = createWorld(WORKSHOP_LEVEL, { difficulty: 'classic' });
  run(w, bot, seconds(14));
  assert.ok(w.checkpoint.wave >= 1, 'the bot clears the first wave');
  const score = w.score;
  heroOf(w).hp = 1;
  heroOf(w).safe = 0;
  const seen: GameEvent[] = [];
  for (let i = 0; i < seconds(60) && w.phase !== 'lost'; i++) {
    step(w, { x: 1, z: 0, attack: false });
    seen.push(...w.events);
  }
  assert.equal(w.phase, 'lost');
  assert.ok(seen.some((e) => e.type === 'heroDown'));
  const again = retry(w);
  assert.equal(again.phase, 'play');
  assert.equal(heroOf(again).hp, TUNING.classic.heroHp);
  assert.equal(again.wave, w.checkpoint.wave);
  assert.ok(again.score >= score);
  assert.equal(again.actors.filter(isEnemy).length, 0);
});

test('the statue cannot be bonked until it wakes, and wakes only after the last wave', () => {
  const w = createWorld(WORKSHOP_LEVEL);
  const b = boss(w);
  assert.equal(b.state, 'statue');
  const hero = heroOf(w);
  hero.x = b.x - 20;
  hero.z = b.z;
  w.cameraX = WORKSHOP_LEVEL.length - w.viewW;
  // Waves are not done, so standing next to it does nothing.
  w.wave = 0;
  w.level = { ...WORKSHOP_LEVEL, waves: [{ atX: 9999, spawns: [] }] };
  run(w, tap, seconds(1));
  assert.equal(b.state, 'statue');
  assert.equal(b.hp, b.maxHp);
});

test('a charge that runs into the edge of the arena leaves the boss dizzy, and dizzy bonks count double', () => {
  const w = createWorld({ ...WORKSHOP_LEVEL, waves: [] }, { difficulty: 'classic' });
  const hero = heroOf(w);
  hero.x = boss(w).x - 90;
  const seen: GameEvent[] = [];
  for (let i = 0; i < seconds(30) && boss(w).state !== 'stun'; i++) {
    step(w, bot(w));
    seen.push(...w.events);
  }
  assert.ok(seen.some((e) => e.type === 'bossWake'));
  assert.equal(boss(w).state, 'stun');
  const b = boss(w);
  const before = b.hp;
  Object.assign(hero, { x: b.x - 30, z: b.z, face: 1, safe: 0, state: 'idle', t: 1, combo: 0, push: 0 });
  w.prevAttack = false;
  step(w, { x: 0, z: 0, attack: true });
  run(w, NO_INPUT, 6);
  assert.equal(before - b.hp, HERO.damage[0] * 2);
});

for (const difficulty of ['gentle', 'classic'] as const) {
  test(`the whole test street can be finished (${difficulty}): waves, boss back to a statue, every critter rescued`, () => {
    let w = createWorld(WORKSHOP_LEVEL, { difficulty, seed: 11 });
    const seen: GameEvent[] = [];
    let tries = 0;
    for (let i = 0; i < seconds(600) && w.phase !== 'won'; i++) {
      step(w, bot(w));
      seen.push(...w.events);
      if (w.phase === 'lost') {
        tries += 1;
        w = retry(w);
      }
    }
    assert.equal(w.phase, 'won', `finished in ${w.time.toFixed(0)} s of play`);
    assert.ok(tries <= 3, `needed ${tries} retries`);
    assert.equal(boss(w).state, 'statue', 'the Triceratops is a statue again');
    assert.deepEqual(w.rescued, WORKSHOP_LEVEL.cage.critters);
    assert.equal(seen.filter((e) => e.type === 'rescued').length, 4);
    const order = ['waveStart', 'waveClear', 'bossWake', 'bossSettle', 'cageOpen', 'won'].map((type) => seen.findIndex((e) => e.type === type));
    assert.deepEqual([...order].sort((a, b) => a - b), order, 'events come in story order');
    assert.ok(w.score >= ENEMY.shambler.score * 5);
  });
}

test('critters, the cage and snacks can never be bonked or hurt', () => {
  const w = createWorld(SHORT_LEVEL);
  const hero = heroOf(w);
  for (const role of ['critter', 'cage', 'snack'] as const) w.actors.push({ ...hero, id: 200 + w.actors.length, role, x: hero.x + 14, hp: 1, maxHp: 1, state: 'cheer', t: 0 });
  const seen = run(w, tap, 20);
  assert.equal(seen.filter((e) => e.type === 'bonk' || e.type === 'poof').length, 0);
  assert.ok(w.actors.filter((a) => a.role === 'critter').every((a) => a.hp === 1));
});

test('a level with no boss ends with a rescue when the hero reaches the cage', () => {
  const w = createWorld(SHORT_LEVEL, { seed: 5 });
  const seen = run(w, bot, seconds(60));
  assert.equal(w.phase, 'won');
  assert.deepEqual(w.rescued, ['squirrel']);
  assert.ok(seen.some((e) => e.type === 'cageOpen'));
});

test('a snack gives health back but never more than full', () => {
  const w = createWorld(SHORT_LEVEL);
  const hero = heroOf(w);
  hero.hp = hero.maxHp - 1;
  w.actors.push({ ...hero, id: 300, role: 'snack', x: hero.x + 4, state: 'idle' });
  const seen = run(w, NO_INPUT, 2);
  assert.ok(seen.some((e) => e.type === 'snack'));
  assert.equal(hero.hp, hero.maxHp);
});
