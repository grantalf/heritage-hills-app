import assert from 'node:assert/strict';
import { test } from 'node:test';

import { bingoCards, critters, mysteries, samplePets, sampleTallyBase } from '../src/lib/data/game-content';
import type { GameState, Sighting } from '../src/lib/data/game-types';
import { bingoLines, cardForMonth, earnedBadges, emptyGame, GROUPS, mysteryPoints, POINTS, rankFor, tally, totalPoints } from '../src/lib/game';

const sight = (critterId: string, zone: Sighting['zone'] = 'yard'): Sighting => ({ id: critterId + zone + Math.random(), critterId, zone, at: '2026-11-16T12:00:00.000Z', hasPhoto: false });
const withSightings = (...s: Sighting[]): GameState => ({ ...emptyGame(), sightings: s });

test('field guide ids are unique and every group has animals', () => {
  assert.equal(new Set(critters.map((c) => c.id)).size, critters.length);
  for (const g of GROUPS) assert.ok(critters.filter((c) => c.group === g).length >= 4, g);
});

test('every animal that can hurt has a caution', () => {
  for (const id of ['coralsnake', 'scorpion', 'fireant', 'bat', 'coyote', 'skunk', 'raccoon']) {
    assert.ok(critters.find((c) => c.id === id)?.caution, id);
  }
});

test('a new player has no points and the first rank', () => {
  assert.equal(totalPoints(emptyGame(), critters, bingoCards), 0);
  assert.deepEqual(rankFor(0), { id: 'curious', next: { id: 'scout', pointsToGo: 50 } });
});

test('a first find earns more than a repeat, and rare animals earn more', () => {
  const one = totalPoints(withSightings(sight('squirrel')), critters, bingoCards);
  const two = totalPoints(withSightings(sight('squirrel'), sight('squirrel')), critters, bingoCards);
  assert.equal(one, POINTS.sighting + POINTS.firstFind.common);
  assert.equal(two - one, POINTS.sighting);
  const rare = totalPoints(withSightings(sight('owl')), critters, bingoCards);
  assert.ok(rare > one);
});

test('ranks rise with points and the top rank has no next', () => {
  assert.equal(rankFor(49).id, 'curious');
  assert.equal(rankFor(50).id, 'scout');
  assert.equal(rankFor(150).id, 'detective');
  assert.equal(rankFor(350).id, 'naturalist');
  assert.equal(rankFor(9999).id, 'guardian');
  assert.equal(rankFor(9999).next, undefined);
});

test('bingo lines: rows, columns and diagonals', () => {
  const card = bingoCards[0];
  const ids = card.squares.map((s) => s.id);
  assert.equal(bingoLines(card, []), 0);
  assert.equal(bingoLines(card, [ids[0], ids[1]]), 0);
  assert.equal(bingoLines(card, [ids[0], ids[1], ids[2]]), 1);
  assert.equal(bingoLines(card, [ids[0], ids[4], ids[8]]), 1);
  assert.equal(bingoLines(card, ids), 8);
});

test('bingo cards have nine squares and fit the season', () => {
  for (const card of bingoCards) assert.equal(card.squares.length, 9);
  assert.equal(cardForMonth(bingoCards, 11).id, 'cool');
  assert.equal(cardForMonth(bingoCards, 1).id, 'cool');
  assert.equal(cardForMonth(bingoCards, 6).id, 'warm');
});

test('mysteries: fewer clues earns more, a wrong guess earns nothing', () => {
  assert.ok(mysteryPoints({ solved: true, cluesUsed: 1 }) > mysteryPoints({ solved: true, cluesUsed: 3 }));
  assert.equal(mysteryPoints({ solved: false, cluesUsed: 1 }), 0);
});

test('every mystery has its answer among four options', () => {
  for (const m of mysteries) {
    assert.equal(m.options.length, 4, m.id);
    assert.ok(m.options.some((o) => o.id === m.answerId), m.id);
    const known = m.kind === 'wild' ? critters.map((c) => c.id) : samplePets.map((p) => p.id);
    for (const o of m.options) assert.ok(known.includes(o.id), `${m.id}: ${o.id}`);
  }
});

test('badges are earned by what the player did', () => {
  assert.equal(earnedBadges(emptyGame(), critters, bingoCards).size, 0);
  const state: GameState = {
    sightings: [sight('bat'), sight('owl'), sight('gecko'), sight('monarch'), sight('honeybee'), sight('hummingbird'), sight('slider', 'creek'), sight('toad'), sight('rolypoly')],
    petsMet: ['a', 'b', 'c'],
    mysteries: { 'm-holes': { solved: true, cluesUsed: 2 } },
    bingo: { cool: ['c1', 'c2', 'c3'] },
  };
  const earned = earnedBadges(state, critters, bingoCards);
  for (const b of ['firstFind', 'sharpEyes', 'allKinds', 'nightOwl', 'pollinatorFriend', 'creekKeeper', 'petPal', 'caseClosed', 'bingo'] as const) {
    assert.ok(earned.has(b), b);
  }
});

test('one group missing means no "all kinds" badge', () => {
  const earned = earnedBadges(withSightings(sight('bat'), sight('owl'), sight('gecko'), sight('toad'), sight('monarch')), critters, bingoCards);
  assert.equal(earned.has('allKinds'), false);
});

test('the neighborhood tally counts animals, not people', () => {
  const t = tally({ squirrel: 3, owl: 1 }, critters);
  assert.equal(t.total, 4);
  assert.equal(t.speciesSeen, 2);
  assert.equal(t.speciesTotal, critters.length);
  assert.deepEqual(t.top[0], { critterId: 'squirrel', count: 3 });
  assert.deepEqual(Object.keys(t).sort(), ['byGroup', 'speciesSeen', 'speciesTotal', 'top', 'total']);
});

test('sample tally only names animals in the guide', () => {
  const ids = new Set(critters.map((c) => c.id));
  for (const id of Object.keys(sampleTallyBase)) assert.ok(ids.has(id), id);
});

test('sample pets never include an address', () => {
  for (const pet of samplePets) {
    assert.equal(pet.sample, true);
    for (const text of [pet.where.en, pet.where.es]) assert.doesNotMatch(text, /\d{2,}/, `${pet.id} hint must not contain numbers`);
  }
});
