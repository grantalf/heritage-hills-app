/**
 * The word check against the ways around it found by the block 5 security review (S-02, S-04).
 * Each line here was a real bypass or a real false alarm worry.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkNote, checkText, petTextProblems, shareTextProblems, STREET_NAMES } from '../src/lib/petcards';
import { ROADS } from '../src/lib/quest/map';
import { SampleRepository } from '../src/lib/data/sample';

const CAUGHT = [
  'find us at petpals dot com',
  'write joe @ gmail . com',
  'joe (at) gmail (dot) com',
  'see biscuit.us or pets.xyz or pup.gg',
  'go to 203.0.113.9/pics',
  'follow @biscuit_the_dog on insta',
  'text five one two five five five zero one four seven',
  'llama al cinco uno dos cinco cinco cinco cero uno cuatro siete',
  'call ５１２５５５０１４７',
  'call ٥١٢٥٥٥٠١٤٧',
  'call 512-555-O147',
  'call 512​555​0147',
  'mysite․com',
  'mysite.сom',
  'the house at 1234 Hermitage',
  'blue house on Loralinda by the cul de sac',
  'twelve thirty four Hermitage Drive',
  '7 Furness Cv',
  '123456 Durham Dr',
  'Calle Hermitage número 1234',
  'lives on Wisteria Trail',
];

const FINE = [
  'She is 12 years old and loves 3 walks',
  'Best dog st. ever',
  'Born 2019, 15 lbs, 3 legs',
  'Loves the 10 am walk to the park',
  'One nap, two naps, then dinner at six',
  'Dot loves the wisteria by the porch',
  'Waits at the door for treats',
  'Le encanta dormir dos siestas',
];

test('known ways around the word check are caught', () => {
  for (const text of CAUGHT) assert.ok(checkNote(text).length > 0, text);
});

test('ordinary pet words are not blocked', () => {
  for (const text of FINE) assert.deepEqual(checkText(text, 140), [], text);
});

test('every street on the storybook map is in the word check', () => {
  const names = STREET_NAMES.map((s) => s.name);
  for (const road of ROADS) {
    if (!road.name) continue;
    const words = road.name.toLowerCase().split(' ').slice(0, -1).join(' ');
    assert.ok(names.includes(words), road.name);
  }
});

test('new pets and share items are checked, on the form and in the store', async () => {
  assert.ok(petTextProblems({ name: 'Rex', about: 'Lives at 1234 Hermitage Dr', hello: '' }).includes('address'));
  assert.ok(petTextProblems({ name: 'Rex', about: 'Friendly', hello: 'call 512 555 0147' }).includes('phone'));
  assert.ok(shareTextProblems({ title: 'Ladder', condition: 'text me at joe@example.org' }).includes('email'));
  assert.deepEqual(petTextProblems({ name: 'Rex', about: 'Loves naps in the sun', hello: 'Slow hand, then a scratch' }), []);
  const repo = new SampleRepository();
  await assert.rejects(repo.addPet({ name: 'Rex', kind: 'dog', about: 'Lives at 1234 Hermitage Dr', hello: '' }));
  await assert.rejects(repo.addShareItem({ category: 'tool', title: 'Drill', condition: 'see drills dot com' }));
});
