import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ATLAS } from '../src/lib/arcade/atlas.generated';
import { WORKSHOP_LEVEL } from '../src/lib/arcade/levels';
import { createWorld, heroOf, step, type World } from '../src/lib/arcade/rules';
import { advanceFx, buildScene, frameOf, GROUND_TOP, sheetMeta, VIEW_H, type Fx } from '../src/lib/arcade/scene';
import { activePacks, animName, BASE_PACK, FROST_EXAMPLE, packIsOn, PACKS, REQUIRED_ANIMS, resolveSkins, SKIN_ROLES, type SkinPack } from '../src/lib/arcade/skins';

const day = (month: number, date: number) => new Date(2027, month - 1, date, 12);

test('the everyday pack has a skin for every role', () => {
  for (const role of SKIN_ROLES) assert.ok(BASE_PACK.skins[role], role);
});

test('every skin in every pack points at a real sheet with every animation its role needs', () => {
  for (const pack of PACKS) {
    for (const [role, skin] of Object.entries(pack.skins)) {
      const meta = sheetMeta(skin.sheet);
      assert.ok(meta, `${pack.id}/${role}: sheet "${skin.sheet}" is in the atlas`);
      for (const anim of REQUIRED_ANIMS[role as keyof typeof REQUIRED_ANIMS]) {
        assert.ok(meta.anims[animName(skin, anim)], `${pack.id}/${role}: animation "${anim}"`);
      }
    }
  }
});

test('every pack name and character name is in English and Spanish', () => {
  for (const pack of PACKS) {
    assert.ok(pack.name.en && pack.name.es, pack.id);
    for (const skin of Object.values(pack.skins)) assert.ok(skin.name.en && skin.name.es, skin.sheet);
  }
});

test('a dated pack is on only inside its dates, including a range that crosses New Year', () => {
  assert.equal(packIsOn(FROST_EXAMPLE, day(12, 1)), true);
  assert.equal(packIsOn(FROST_EXAMPLE, day(12, 25)), true);
  assert.equal(packIsOn(FROST_EXAMPLE, day(1, 6)), true);
  assert.equal(packIsOn(FROST_EXAMPLE, day(1, 7)), false);
  assert.equal(packIsOn(FROST_EXAMPLE, day(11, 30)), false);
  assert.equal(packIsOn(FROST_EXAMPLE, day(7, 4)), false);
  const spring: SkinPack = { id: 'spring', name: { en: 'Spring', es: 'Primavera' }, from: '03-20', to: '04-10', skins: {} };
  assert.equal(packIsOn(spring, day(3, 19)), false);
  assert.equal(packIsOn(spring, day(4, 10)), true);
  assert.equal(packIsOn(BASE_PACK, day(7, 4)), true);
});

test('a dated pack swaps only the roles it names; the rest keep their everyday skin', () => {
  const winter: SkinPack = { ...FROST_EXAMPLE, id: 'winter', example: false };
  const packs = [BASE_PACK, winter];
  const july = resolveSkins(day(7, 4), {}, packs);
  const december = resolveSkins(day(12, 20), {}, packs);
  assert.equal(july.shambler.sheet, 'shambler');
  assert.equal(december.shambler.sheet, 'shamblerFrost');
  assert.equal(december.shambler.name.en, 'Frosty Shambler');
  assert.equal(december.boss.sheet, july.boss.sheet);
  assert.equal(december.hero.sheet, july.hero.sheet);
  // A player can turn dated packs off.
  assert.equal(resolveSkins(day(12, 20), { seasonal: false }, packs).shambler.sheet, 'shambler');
});

test('example packs never turn on by date, only when chosen', () => {
  assert.deepEqual(activePacks(day(12, 20)).map((p) => p.id), ['base']);
  assert.deepEqual(activePacks(day(7, 4), { force: 'frostExample' }).map((p) => p.id), ['base', 'frostExample']);
  assert.equal(resolveSkins(day(7, 4), { force: 'frostExample' }).shambler.sheet, 'shamblerFrost');
});

test('an animation frame is always inside its own animation', () => {
  for (const [sheet, meta] of Object.entries(ATLAS)) {
    for (const [anim, a] of Object.entries(meta.anims as Record<string, { from: number; count: number }>)) {
      for (const t of [0, 0.05, 0.3, 1.7, 99]) {
        const f = frameOf(sheet, anim, t);
        assert.ok(f >= a.from && f < a.from + a.count, `${sheet}/${anim} at ${t}`);
      }
    }
  }
});

test('the scene lists every actor once, back to front, with feet on the street', () => {
  const skins = resolveSkins(day(7, 4));
  const w: World = createWorld(WORKSHOP_LEVEL);
  for (let i = 0; i < 400; i++) step(w, { x: 1, z: 0, attack: false });
  const scene = buildScene(w, skins);
  const keys = scene.draws.map((d) => d.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const a of w.actors) assert.ok(keys.includes(`a${a.id}`), a.role);
  const ys = scene.draws.filter((d) => d.key.startsWith('a')).map((d) => d.y);
  assert.deepEqual(ys, [...ys].sort((a, b) => a - b), 'sorted by depth');
  for (const d of scene.draws) {
    if (!d.key.startsWith('a')) continue;
    assert.ok(d.y >= GROUND_TOP - 8 && d.y <= VIEW_H, `${d.key} at y ${d.y}`);
    const meta = sheetMeta(d.sheet)!;
    assert.ok(d.frame >= 0 && d.frame < Object.values(meta.anims).reduce((n, a) => Math.max(n, a.from + a.count), 0));
  }
  assert.ok(scene.farX <= 0 && scene.farX > -128 && scene.nearX <= 0 && scene.nearX > -128);
  assert.equal(heroOf(w).role, 'hero');
});

test('effects start from events and end on their own', () => {
  let id = 0;
  let fx: Fx[] = advanceFx([], [{ type: 'poof', x: 10, z: 5, role: 'shambler' }, { type: 'bonk', x: 12, z: 5, finisher: false }], 0, () => ++id);
  assert.deepEqual(fx.map((f) => f.kind), ['poof', 'hit']);
  for (let i = 0; i < 60; i++) fx = advanceFx(fx, [], 1 / 60, () => ++id);
  assert.equal(fx.length, 0);
});

// ---------- colors and the game session ----------

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('menu text on wood and parchment meets the 4.5 to 1 contrast rule', async () => {
  const { MENU, MENU_TEXT_PAIRS } = await import('../src/lib/arcade/menu-colors');
  for (const [text, background] of MENU_TEXT_PAIRS) {
    const ratio = contrast(MENU[text], MENU[background]);
    assert.ok(ratio >= 4.5, `${text} on ${background} is ${ratio.toFixed(2)}`);
  }
});

test('a game session steps at a fixed rate, tells its listeners, and never skips ahead on a slow phone', async () => {
  const { GameSession } = await import('../src/lib/arcade/session');
  const session = new GameSession();
  let calls = 0;
  const stop = session.subscribe(() => (calls += 1));
  session.start(WORKSHOP_LEVEL, { difficulty: 'gentle', viewW: 180 });
  assert.equal(session.status, 'start');
  session.setInput(1, 0, false);
  const x0 = heroOf(session.world!).x;
  // Sixty normal frames: one second of walking.
  for (let i = 0; i < 60; i++) session.advance(1 / 60, 180);
  const walked = heroOf(session.world!).x - x0;
  assert.ok(walked > 55 && walked < 66, `walked ${walked}`);
  // One very long frame moves at most six steps.
  const before = session.world!.time;
  session.advance(5, 180);
  assert.ok(session.world!.time - before <= 6 / 60 + 1e-9);
  // Watching: the game plays itself to the first wave and says so.
  for (let i = 0; i < 600 && session.status === 'start'; i++) session.advance(1 / 60, 180, true);
  assert.equal(session.status, 'waveStart');
  assert.ok(calls > 60);
  stop();
  const frame = session.getFrame();
  session.advance(1 / 60, 180);
  assert.ok(session.getFrame() > frame);
});
