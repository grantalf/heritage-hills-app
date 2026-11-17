/**
 * The draft's stand-ins must never reach residents (block 5 review, S-09 to S-11, S-25).
 * These checks fail if the one demo switch is bypassed.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('the sample data store is created only behind the demo switch', () => {
  const provider = read('src/lib/data/provider.tsx');
  assert.match(provider, /if \(!DEMO\) throw new Error\(NOT_READY_MESSAGE\)/);
  // Nothing else builds the sample store for the app.
  for (const file of ['src/app/_layout.tsx', 'src/lib/session.ts']) assert.ok(!read(file).includes('new SampleRepository'), file);
});

test('the demo switch is read strictly: only an explicit true turns it on', () => {
  assert.match(read('src/lib/demo.ts'), /extra\?\.demo === true/);
});

test('the role picker, the pretend second officer and the workshop sit behind the switch', () => {
  assert.match(read('src/app/(tabs)/more.tsx'), /\{DEMO \? \(\s*<Card>/);
  assert.match(read('src/app/(tabs)/more.tsx'), /\{DEMO \? <RowLink icon=\{Gamepad2\}/);
  assert.match(read('src/app/board.tsx'), /\{DEMO \? \(\s*<Btn\s+icon=\{BadgeCheck\}\s+label=\{t\('board.confirmOther'\)\}/);
});

test('this preview build is a demo build, and says so', () => {
  const app = JSON.parse(read('app.json')) as { expo: { extra: { demo?: boolean } } };
  assert.equal(app.expo.extra.demo, true);
});

// ---------- Smaller fixes from the same review ----------

import { isSafeLink } from '../src/lib/links';
import { activePacks, packIsOn, PACKS } from '../src/lib/arcade/skins';
import * as content from '../src/lib/data/content';

test('only https, phone and email links open', () => {
  assert.equal(isSafeLink('https://www.austintexas.gov/'), true);
  assert.equal(isSafeLink('tel:311'), true);
  for (const bad of ['javascript:alert(1)', 'http://example.org', 'data:text/html,hi', 'file:///etc/passwd', 'not a link']) assert.equal(isSafeLink(bad), false, bad);
});

test('every link in the app content is a safe link', () => {
  const urls = JSON.stringify(content).match(/"(https?|tel|mailto|javascript):[^"]*"/g) ?? [];
  assert.ok(urls.length > 0);
  for (const u of urls) assert.ok(isSafeLink(JSON.parse(u)), u);
});

test('a skin pack with only one date never turns on', () => {
  const day = new Date(2026, 11, 20);
  const broken = { ...PACKS[1], id: 'half', from: '12-01', to: undefined, example: false };
  assert.equal(packIsOn(broken, day), false);
  assert.ok(!activePacks(day, {}, [PACKS[0], broken]).some((p) => p.id === 'half'));
  assert.equal(packIsOn({ ...broken, to: '13-40' }, day), false, 'a date that is not a real month and day stays off');
});

import { translate } from '../src/lib/i18n/translate';

test('counts of one read naturally in English and Spanish', () => {
  assert.equal(translate('en', 'events.going', { count: 1 }), '1 neighbor is going');
  assert.equal(translate('en', 'events.going', { count: 12 }), '12 neighbors are going');
  assert.equal(translate('es', 'events.going', { count: 1 }), '1 vecino va a ir');
  assert.equal(translate('es', 'cards.noteLeft', { count: 1 }), 'Queda 1 letra');
});
