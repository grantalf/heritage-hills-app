import assert from 'node:assert/strict';
import { test } from 'node:test';

import { autoplay } from '../src/lib/arcade/autoplay';
import { FRONTIER_TRAIL, LEVELS, levelById } from '../src/lib/arcade/levels';
import { cageCritters, emptyProgress, parseProgress, recordWin, stampId, stampsFor } from '../src/lib/arcade/progress';
import { ANGRY, createWorld, heroOf, HEROES, HERO_IDS, retry, step, STEP, TUNING, type Difficulty, type GameEvent, type HeroId, type World } from '../src/lib/arcade/rules';
import { buildScene, sheetMeta } from '../src/lib/arcade/scene';
import { renderSound, SOUND_NAMES, SOUNDS, soundLength, soundsFor, wavBytes } from '../src/lib/arcade/sound';
import { FROST_EXAMPLE, heroRole, resolveSkins } from '../src/lib/arcade/skins';
import { critters } from '../src/lib/data/game-content';
import { en } from '../src/lib/i18n/en';
import { es } from '../src/lib/i18n/es';

const skins = resolveSkins(new Date(2026, 10, 17));

function playThrough(hero: HeroId, difficulty: Difficulty, seed: number, limit = 60 * 60 * 6) {
  const w = createWorld(FRONTIER_TRAIL, { hero, difficulty, viewW: 180, seed });
  const seen = new Set<string>();
  let knockouts = 0;
  for (let i = 0; i < limit && w.phase !== 'won'; i++) {
    if (w.phase === 'lost') {
      knockouts += 1;
      Object.assign(w, retry(w));
    }
    step(w, autoplay(w));
    for (const e of w.events) seen.add(e.type);
  }
  return { w, seen, knockouts };
}

test('the Frontier Trail is well formed and follows the place rules', () => {
  const lv = FRONTIER_TRAIL;
  let last = 0;
  for (const wave of lv.waves) {
    assert.ok(wave.atX > last, 'waves in order');
    assert.ok(wave.atX < lv.boss!.x - 96, 'every fight comes before the statue');
    last = wave.atX;
  }
  assert.ok(lv.boss!.x < lv.cage.x && lv.cage.x < lv.length);
  assert.ok(lv.title.en && lv.title.es && lv.story.en && lv.story.es && lv.place.en && lv.place.es);
  // D-073: never at the school, homes or the garden.
  for (const text of [lv.title.en, lv.story.en, lv.place.en].map((s) => s.toLowerCase())) {
    for (const banned of ['school', 'elementary', 'home', 'house', 'garden', 'yard']) assert.ok(!text.includes(banned), banned);
  }
  assert.ok(sheetMeta(lv.scenery!.backdrop), 'its scenery is drawn');
  assert.equal(levelById('frontier-trail'), lv);
  assert.equal(levelById('no-such-level'), LEVELS[0], 'an unknown level opens the first one');
});

test('only wild critters from the field guide are in the cage, each with a fact in both languages', () => {
  const inCage = cageCritters(FRONTIER_TRAIL);
  assert.equal(inCage.length, FRONTIER_TRAIL.cage.critters.length);
  for (const c of inCage) {
    assert.ok(critters.includes(c));
    assert.ok(c.fact.en && c.fact.es && c.look.en && c.look.es, c.id);
    assert.ok(skins[c.id as keyof typeof skins], `${c.id} has a picture`);
  }
  assert.ok(!FRONTIER_TRAIL.cage.critters.includes('dog'), 'no pets in cages');
});

test('the two heroes play differently but are equally tough', () => {
  assert.ok(HEROES.flor.reach > HEROES.bo.reach, 'Flor reaches further');
  assert.ok(HEROES.bo.speedX > HEROES.flor.speedX, 'Bo is quicker');
  assert.ok(HEROES.flor.damage[2] > HEROES.bo.damage[2], 'Flor has the bigger last swing');
  for (const id of HERO_IDS) assert.equal(createWorld(FRONTIER_TRAIL, { hero: id }).actors[0].maxHp, TUNING.gentle.heroHp);
  // A monster just beyond Bo's reach but inside Flor's.
  const gap = (HEROES.bo.reach + HEROES.flor.reach) / 2;
  const reachTest = (hero: HeroId) => {
    const w = createWorld(FRONTIER_TRAIL, { hero, viewW: 180 });
    const h = heroOf(w);
    h.x = 60;
    w.actors.push({ ...h, id: 99, role: 'shambler', x: 60 + gap, hp: 3, maxHp: 3, state: 'idle', cool: 9 });
    step(w, { x: 0, z: 0, attack: true });
    for (let i = 0; i < 10; i++) step(w, { x: 0, z: 0, attack: false });
    return w.actors.find((a) => a.id === 99)!.hp;
  };
  assert.equal(reachTest('bo'), 3);
  assert.equal(reachTest('flor'), 2);
});

test('the chosen hero is drawn with its own picture and kept after a knock-out', () => {
  const w = createWorld(FRONTIER_TRAIL, { hero: 'flor', viewW: 180 });
  const scene = buildScene(w, skins);
  assert.equal(scene.draws.find((d) => d.key === `a${heroOf(w).id}`)?.sheet, 'flor');
  assert.equal(scene.backdrop, 'frontier');
  assert.equal(scene.mood, 'frontier');
  assert.equal(heroRole('bo'), 'hero');
  assert.equal(retry(w).heroId, 'flor');
});

for (const hero of HERO_IDS) {
  for (const difficulty of ['gentle', 'classic'] as const) {
    test(`${hero} can finish the Frontier Trail (${difficulty}): every fight, the angry statue, and every critter freed`, () => {
      const { w, seen, knockouts } = playThrough(hero, difficulty, 7);
      assert.equal(w.phase, 'won');
      assert.deepEqual(w.rescued, FRONTIER_TRAIL.cage.critters);
      assert.equal(w.actors.find((a) => a.role === 'boss')!.state, 'statue', 'the statue is a statue again');
      for (const e of ['waveStart', 'waveClear', 'snack', 'bossWake', 'bossAngry', 'bossStun', 'bossSettle', 'cageOpen', 'rescued', 'won']) assert.ok(seen.has(e), e);
      assert.ok(w.time < 6 * 60, `under six minutes (${Math.round(w.time)} s)`);
      if (difficulty === 'gentle') assert.ok(knockouts <= 1, `gentle is gentle (${knockouts} knock-outs)`);
    });
  }
}

test('after losing half its health the statue winds up faster and charges harder', () => {
  const wind = (angry: boolean) => {
    const w = createWorld(FRONTIER_TRAIL, { viewW: 180 });
    const boss = w.actors.find((a) => a.role === 'boss')!;
    w.phase = 'boss';
    w.bossAngry = angry;
    boss.state = 'wind';
    boss.t = 0;
    let steps = 0;
    while (boss.state === 'wind' && steps < 600) {
      step(w, { x: 0, z: 0, attack: false });
      steps += 1;
    }
    return steps * STEP;
  };
  assert.ok(wind(true) < wind(false));
  assert.ok(ANGRY.wind < 1 && ANGRY.charge > 1);
});

test('the statue gets angry exactly once', () => {
  const { w } = playThrough('flor', 'classic', 3);
  assert.equal(w.bossAngry, true);
  let count = 0;
  const w2 = createWorld(FRONTIER_TRAIL, { hero: 'flor', difficulty: 'classic', viewW: 180, seed: 3 });
  for (let i = 0; i < 60 * 60 * 6 && w2.phase !== 'won'; i++) {
    if (w2.phase === 'lost') Object.assign(w2, retry(w2));
    step(w2, autoplay(w2));
    count += w2.events.filter((e) => e.type === 'bossAngry').length;
  }
  assert.equal(count, 1);
});

// ---------- sounds ----------

const ALL_EVENTS: GameEvent[] = [
  { type: 'swing' },
  { type: 'bonk', x: 0, z: 0, finisher: false },
  { type: 'poof', x: 0, z: 0, role: 'shambler' },
  { type: 'heroHurt' },
  { type: 'heroDown' },
  { type: 'snack' },
  { type: 'waveStart' },
  { type: 'waveClear' },
  { type: 'bossWake' },
  { type: 'bossAngry' },
  { type: 'charge' },
  { type: 'bossStun' },
  { type: 'stomp', x: 0, z: 0 },
  { type: 'bossSettle' },
  { type: 'cageOpen' },
  { type: 'rescued', kind: 'squirrel' },
  { type: 'won' },
];

test('every game event has a sound', () => {
  for (const e of ALL_EVENTS) assert.equal(soundsFor([e], skins, 'hero').length, 1, e.type);
});

test('the metal statue clangs, finishers sound bigger, and a holiday pack can swap a sound', () => {
  assert.deepEqual(soundsFor([{ type: 'bonk', x: 0, z: 0, finisher: false, boss: true }], skins, 'hero'), ['clang']);
  assert.deepEqual(soundsFor([{ type: 'bonk', x: 0, z: 0, finisher: true }], skins, 'hero'), ['bigBonk']);
  const winter = resolveSkins(new Date(2026, 11, 20), { force: FROST_EXAMPLE.id });
  assert.deepEqual(soundsFor([{ type: 'poof', x: 0, z: 0, role: 'shambler' }], winter, 'hero'), ['jingle']);
  assert.deepEqual(soundsFor([{ type: 'poof', x: 0, z: 0, role: 'lunger' }], winter, 'hero'), ['poof']);
});

test('a crowd does not make a din: no repeats in one step and at most three sounds', () => {
  const crowd = soundsFor([...ALL_EVENTS, ...ALL_EVENTS], skins, 'hero');
  assert.ok(crowd.length <= 3);
  assert.equal(new Set(crowd).size, crowd.length);
});

test('every pack sound name is a real sound', () => {
  for (const skin of Object.values(skins)) {
    for (const name of Object.values(skin.sounds ?? {})) assert.ok(name in SOUNDS, `${skin.sheet}: ${name}`);
  }
  for (const skin of Object.values(FROST_EXAMPLE.skins)) for (const name of Object.values(skin.sounds ?? {})) assert.ok(name in SOUNDS, name);
});

test('sounds are short and soft, and render without clipping', () => {
  for (const name of SOUND_NAMES) {
    assert.ok(soundLength(name) <= 1, `${name} is under a second`);
    const samples = renderSound(name);
    let peak = 0;
    for (const s of samples) peak = Math.max(peak, Math.abs(s));
    assert.ok(peak > 0.02, `${name} is not silent`);
    assert.ok(peak <= 0.6, `${name} peak ${peak.toFixed(2)} stays soft`);
  }
  const wav = wavBytes(renderSound('bonk'));
  assert.equal(String.fromCharCode(...wav.slice(0, 4)), 'RIFF');
  assert.equal(String.fromCharCode(...wav.slice(8, 12)), 'WAVE');
});

// ---------- stamps and saved settings ----------

const won = (rescued: string[], score: number): Pick<World, 'phase' | 'rescued' | 'score'> => ({ phase: 'won', rescued, score });

test('a won level gives one stamp per critter, once', () => {
  const first = recordWin(emptyProgress(), FRONTIER_TRAIL, won(FRONTIER_TRAIL.cage.critters, 4200));
  assert.equal(first.newStamps.length, 3);
  assert.equal(first.newBest, true);
  assert.equal(stampsFor(first.progress, FRONTIER_TRAIL), 3);
  const again = recordWin(first.progress, FRONTIER_TRAIL, won(FRONTIER_TRAIL.cage.critters, 3000));
  assert.equal(again.newStamps.length, 0);
  assert.equal(again.newBest, false);
  assert.equal(again.progress.best[FRONTIER_TRAIL.id], 4200);
  assert.ok(again.progress.stamps.includes(stampId('frontier-trail', 'armadillo')));
});

test('a lost level records nothing', () => {
  const p = emptyProgress();
  const r = recordWin(p, FRONTIER_TRAIL, { phase: 'lost', rescued: [], score: 900 });
  assert.equal(r.progress, p);
  assert.equal(r.newStamps.length, 0);
});

test('saved progress that is broken or tampered with falls back safely', () => {
  assert.deepEqual(parseProgress(null), emptyProgress());
  assert.deepEqual(parseProgress('not json'), emptyProgress());
  const odd = parseProgress(JSON.stringify({ stamps: ['frontier-trail:squirrel', '<script>', 5], best: { 'frontier-trail': 300, bad: -1, 'x y': 4 }, hero: 'villain', difficulty: 'nightmare', sound: false }));
  assert.deepEqual(odd.stamps, ['frontier-trail:squirrel']);
  assert.deepEqual(odd.best, { 'frontier-trail': 300 });
  assert.equal(odd.hero, 'bo');
  assert.equal(odd.difficulty, 'gentle');
  assert.equal(odd.sound, false);
});

test('progress holds no personal information', () => {
  const p = recordWin(emptyProgress(), FRONTIER_TRAIL, won(['squirrel'], 100)).progress;
  assert.deepEqual(Object.keys(p).sort(), ['best', 'difficulty', 'hero', 'sound', 'stamps']);
});

test('the rescue text is in English and Spanish', () => {
  const keys = Object.keys(en).filter((k) => k.startsWith('rescue.'));
  assert.ok(keys.length > 50);
  for (const k of keys) assert.ok((es as Record<string, string>)[k]?.trim(), k);
});
