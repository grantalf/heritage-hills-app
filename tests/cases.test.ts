import assert from 'node:assert/strict';
import { test } from 'node:test';

import { clockParts, COST, hearWitness, isLastStop, matchesNotebook, nameCulprit, rewardLevel, startCase, travel, type DetectiveCase, type Suspect } from '../src/lib/cases';
import { critterArt, petArt, scientificNames, sizeOf } from '../src/lib/data/game-art';
import { cases, critters, samplePets } from '../src/lib/data/game-content';

const byId = (id: string): DetectiveCase => cases.find((c) => c.id === id) as DetectiveCase;
const holes = byId('case-holes');

/** Plays the fastest honest route: one witness at each stop, the right way each time. */
function playWell(c: DetectiveCase) {
  let s = startCase(c);
  for (let i = 0; i < c.stops.length; i++) {
    s = hearWitness(s, 0);
    if (i < c.stops.length - 1) s = travel(c, s, c.stops[i + 1].zone);
  }
  return s;
}

test('every case is well formed', () => {
  for (const c of cases) {
    assert.ok(c.stops.length >= 3, c.id);
    const known = c.kind === 'wild' ? critters.map((x) => x.id) : samplePets.map((p) => p.id);
    assert.ok(known.includes(c.culpritId), `${c.id}: culprit must exist`);
    c.stops.forEach((stop, i) => {
      assert.equal(stop.witnesses.length, 3, `${c.id} stop ${i}`);
      const last = i === c.stops.length - 1;
      if (last) assert.equal(stop.nextOptions, undefined, `${c.id}: the last stop has nowhere to go`);
      else {
        const next = c.stops[i + 1].zone;
        assert.equal(stop.nextOptions?.length, 3, `${c.id} stop ${i}`);
        assert.equal(new Set(stop.nextOptions).size, 3, `${c.id} stop ${i}: three different places`);
        assert.ok(stop.nextOptions?.includes(next), `${c.id} stop ${i}: the right way must be offered`);
        assert.ok(!stop.nextOptions?.includes(stop.zone), `${c.id} stop ${i}: cannot travel to where you are`);
      }
    });
    // Pet cases use invented pets only: a real pet is never made a "culprit".
    if (c.kind === 'pet') assert.equal(c.sample, true, c.id);
  }
});

test('asking a witness costs an hour, and asking twice costs nothing more', () => {
  let s = hearWitness(startCase(holes), 0);
  assert.equal(s.hoursLeft, holes.hours - COST.witness);
  s = hearWitness(s, 0);
  assert.equal(s.hoursLeft, holes.hours - COST.witness);
});

test('the right way moves on; a wrong turn costs more and is only charged once', () => {
  const start = startCase(holes);
  const wrong = holes.stops[0].nextOptions?.find((z) => z !== holes.stops[1].zone) as 'garden';
  let s = travel(holes, start, wrong);
  assert.equal(s.stop, 0);
  assert.equal(s.hoursLeft, holes.hours - COST.wrongTurn);
  assert.equal(travel(holes, s, wrong).hoursLeft, s.hoursLeft);
  s = travel(holes, s, holes.stops[1].zone);
  assert.equal(s.stop, 1);
  assert.equal(s.hoursLeft, holes.hours - COST.wrongTurn - COST.travel);
  assert.deepEqual(s.wrongTurns, []);
});

test('the culprit can only be named at the last stop', () => {
  const early = nameCulprit(holes, startCase(holes), holes.culpritId);
  assert.equal(early.outcome, undefined);
  const s = playWell(holes);
  assert.ok(isLastStop(holes, s));
  assert.equal(nameCulprit(holes, s, holes.culpritId).outcome, 'solved');
});

test('a wrong name costs hours, and the clock running out closes the case', () => {
  let s = playWell(holes);
  const before = s.hoursLeft;
  s = nameCulprit(holes, s, 'squirrel');
  assert.equal(s.hoursLeft, before - COST.wrongName);
  assert.equal(nameCulprit(holes, s, 'squirrel').hoursLeft, s.hoursLeft);
  for (const id of critters.map((c) => c.id).filter((id) => id !== holes.culpritId)) s = nameCulprit(holes, s, id);
  assert.equal(s.hoursLeft, 0);
  assert.equal(s.outcome, 'cold');
  assert.equal(nameCulprit(holes, s, holes.culpritId).outcome, 'cold');
});

test('a quick solve earns the top reward; a slow one earns less', () => {
  for (const c of cases) assert.equal(rewardLevel(c, playWell(c)), 1, c.id);
  assert.equal(rewardLevel(holes, { ...startCase(holes), hoursLeft: 6 }), 2);
  assert.equal(rewardLevel(holes, { ...startCase(holes), hoursLeft: 2 }), 3);
});

test('the clock starts Saturday at 8 and rolls over to Sunday', () => {
  assert.deepEqual(clockParts(holes, startCase(holes)), { day: 0, hour: 8 });
  assert.deepEqual(clockParts(holes, { ...startCase(holes), hoursLeft: holes.hours - 7 }), { day: 0, hour: 15 });
  assert.deepEqual(clockParts(holes, { ...startCase(holes), hoursLeft: holes.hours - 18 }), { day: 1, hour: 2 });
});

test('a full notebook narrows the suspects to a short list that includes the culprit', () => {
  const suspects: Suspect[] = critters.map((x) => ({ id: x.id, group: x.group, night: !!x.night, size: sizeOf(x.id, x.group) }));
  for (const c of cases.filter((x) => x.kind === 'wild')) {
    const culprit = suspects.find((s) => s.id === c.culpritId) as Suspect;
    const notebook = { group: culprit.group, awake: culprit.night ? ('night' as const) : ('day' as const), size: culprit.size };
    const left = suspects.filter((s) => matchesNotebook(s, notebook));
    assert.ok(left.some((s) => s.id === c.culpritId), c.id);
    assert.ok(left.length <= 8, `${c.id}: ${left.length} suspects left`);
    // Like a warrant in the old detective games, a complete notebook may leave just one suspect.
    // But no single note should give the answer away.
    for (const one of [{ group: notebook.group }, { awake: notebook.awake }, { size: notebook.size }]) {
      assert.ok(suspects.filter((s) => matchesNotebook(s, one)).length >= 2, `${c.id}: one note gives it away`);
    }
  }
  const pets: Suspect[] = samplePets.map((p) => ({ id: p.id, petKind: p.kind }));
  assert.ok(pets.length <= 8);
  assert.ok(pets.filter((p) => matchesNotebook(p, { petKind: 'dog' })).length >= 2);
});

test('every animal and sample pet has its own character and a scientific name where one applies', () => {
  for (const c of critters) {
    assert.ok(critterArt[c.id], `no character for ${c.id}`);
    assert.ok(scientificNames[c.id], `no scientific name for ${c.id}`);
  }
  for (const p of samplePets) assert.ok(petArt[p.id], `no character for ${p.id}`);
});
