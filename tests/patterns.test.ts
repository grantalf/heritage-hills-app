import assert from 'node:assert/strict';
import { test } from 'node:test';

import { critters, sampleHabits, sampleTallyBase } from '../src/lib/data/game-content';
import { addObservation, combine, emptyObservations, MIN_FOR_PATTERN, pattern, sampleObservations, share, timeOfDay, TIMES, ZONES } from '../src/lib/patterns';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const sample = sampleObservations(sampleTallyBase, sampleHabits);

test('share splits a whole number exactly', () => {
  assert.deepEqual(share(10, [1, 1]), [5, 5]);
  assert.equal(sum(share(64, [3, 1, 4, 3, 0, 0])), 64);
  assert.equal(sum(share(7, [1, 1, 1])), 7);
  assert.deepEqual(share(5, [0, 0]), [0, 0]);
  assert.equal(share(9, [1, 0, 2])[1], 0);
});

test('time of day uses plain blocks of hours', () => {
  const at = (h: number) => timeOfDay(new Date(2026, 5, 1, h));
  assert.equal(at(6), 'dawn');
  assert.equal(at(12), 'day');
  assert.equal(at(18), 'dusk');
  assert.equal(at(23), 'night');
  assert.equal(at(2), 'night');
});

test('sample habits cover every animal in the sample tally, with weights of the right shape', () => {
  const known = new Set(critters.map((c) => c.id));
  for (const id of Object.keys(sampleTallyBase)) assert.ok(sampleHabits[id], `no habit for ${id}`);
  for (const [id, h] of Object.entries(sampleHabits)) {
    assert.ok(known.has(id), id);
    assert.equal(h.zones.length, ZONES.length, id);
    assert.equal(h.times.length, TIMES.length, id);
    for (const w of Object.values(h.byTime ?? {})) assert.equal(w.length, ZONES.length, id);
  }
});

test('sample observations add up to the tally in every direction', () => {
  for (const [id, total] of Object.entries(sampleTallyBase)) {
    const c = sample[id];
    assert.equal(c.total, total, id);
    assert.equal(sum(ZONES.map((z) => c.zones[z])), total, `${id} zones`);
    assert.equal(sum(TIMES.map((t) => c.times[t])), total, `${id} times`);
    assert.equal(sum(c.months), total, `${id} months`);
    for (const t of TIMES) assert.equal(sum(ZONES.map((z) => c.joint[t][z])), c.times[t], `${id} ${t}`);
  }
  assert.equal(combine(sample).total, sum(Object.values(sampleTallyBase)));
});

test('a new sighting is counted once in each view', () => {
  const all = addObservation(emptyObservations(), 'toad', 'yard', new Date(2026, 5, 1, 22));
  assert.equal(all.toad.total, 1);
  assert.equal(all.toad.zones.yard, 1);
  assert.equal(all.toad.times.night, 1);
  assert.equal(all.toad.months[5], 1);
  assert.equal(all.toad.joint.night.yard, 1);
});

test('too few sightings means no pattern is claimed', () => {
  let all = emptyObservations();
  for (let i = 0; i < MIN_FOR_PATTERN - 1; i++) all = addObservation(all, 'toad', 'yard', new Date(2026, 5, 1, 22));
  assert.equal(pattern(all.toad).enough, false);
  assert.equal(pattern(all.toad).topZone, undefined);
  all = addObservation(all, 'toad', 'yard', new Date(2026, 5, 1, 22));
  const p = pattern(all.toad);
  assert.equal(p.enough, true);
  assert.deepEqual(p.topZone, { zone: 'yard', percent: 100 });
  assert.deepEqual(p.topTime, { time: 'night', percent: 100 });
  assert.deepEqual(p.peakMonths, [5]);
  assert.equal(p.moves, false);
});

test('patterns pick out the usual place, time and season', () => {
  const gecko = pattern(sample.gecko);
  assert.equal(gecko.topZone?.zone, 'yard');
  assert.equal(gecko.topTime?.time, 'night');
  assert.ok(gecko.peakMonths.every((m) => m >= 2 && m <= 9));
  const bat = pattern(sample.bat);
  assert.equal(bat.topZone?.zone, 'sky');
  assert.equal(bat.topTime?.time, 'dusk');
});

test('an animal seen in different places through the day is shown as moving', () => {
  const raccoon = pattern(sample.raccoon);
  assert.equal(raccoon.moves, true);
  assert.equal(raccoon.dayPath.find((d) => d.time === 'dusk')?.zone, 'creek');
  assert.equal(raccoon.dayPath.find((d) => d.time === 'night')?.zone, 'yard');
  assert.equal(raccoon.dayPath.find((d) => d.time === 'day')?.zone, undefined);
  assert.equal(pattern(sample.squirrel).moves, false);
});

test('no season is claimed for an animal seen evenly all year', () => {
  assert.deepEqual(pattern(sample.raccoon).peakMonths, []);
  assert.deepEqual(pattern(sample.squirrel).peakMonths, []);
  assert.ok(pattern(sample.gecko).peakMonths.includes(5));
  // Six sample monarchs are too few to say anything, even though they cluster in the fall.
  assert.equal(pattern(sample.monarch).enough, false);
});
