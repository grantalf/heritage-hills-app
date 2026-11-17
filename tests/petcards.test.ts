import assert from 'node:assert/strict';
import { test } from 'node:test';

import * as game from '../src/lib/data/game-content';
import * as samples from '../src/lib/data/petcard-content';
import { emptyPetCards, PetCardStore, type PetCardState } from '../src/lib/data/petcard-sample';
import type { Pet } from '../src/lib/data/game-types';
import type { DemoRole } from '../src/lib/data/types';
import {
  advance,
  albumOrder,
  canSeePhoto,
  checkText,
  CLASS_IDS,
  cleanStats,
  decideNote,
  decideRegular,
  FAVORITE_IDS,
  isDelivered,
  isExpired,
  LIMITS,
  MAX_FAVORITES,
  nextBatchDay,
  noteProblems,
  outbound,
  PHOTO_CHECKS,
  PORTRAIT,
  PORTRAIT_SERVICE,
  queueOrder,
  regularProblems,
  requestProblems,
  spendCents,
  STAT_IDS,
  STICKER_IDS,
  stickerCounts,
  toggleFavorite,
  toggleSticker,
  topStickers,
  triesLeft,
  visibleRegulars,
  type PawNote,
  type PortraitRequest,
} from '../src/lib/petcards';
import { en } from '../src/lib/i18n/en';
import { MENU } from '../src/lib/arcade/menu-colors';
import { CARD_COLORS } from '../src/lib/petcard-colors';
import { contrast } from './contrast.test';

const NOW = new Date('2026-11-17T18:00:00.000Z');

// ---------- Card ----------

test('stats stay between 1 and 5 and missing ones start in the middle', () => {
  const stats = cleanStats({ fluff: 9, zoomies: -2, snack: 2.6, bravery: Number.NaN });
  assert.deepEqual(stats, { fluff: 5, zoomies: 1, snack: 3, bravery: 1, volume: 3 });
});

test('a card has at most three favorite things', () => {
  let favs = toggleFavorite([], 'naps');
  favs = toggleFavorite(favs, 'walks');
  favs = toggleFavorite(favs, 'treats');
  favs = toggleFavorite(favs, 'boxes');
  assert.deepEqual(favs, ['naps', 'walks', 'treats']);
  assert.deepEqual(toggleFavorite(favs, 'walks'), ['naps', 'treats']);
  assert.equal(MAX_FAVORITES, 3);
});

test('sample cards use known stats, classes and favorites, within limits', () => {
  for (const card of samples.sampleCards) {
    assert.ok(game.samplePets.some((p) => p.id === card.petId), card.petId);
    assert.ok(CLASS_IDS.includes(card.classId));
    for (const id of STAT_IDS) assert.ok(card.stats[id] >= 1 && card.stats[id] <= 5);
    assert.ok(card.favorites.length <= MAX_FAVORITES && card.favorites.every((f) => FAVORITE_IDS.includes(f)));
    assert.ok(card.mannerisms.en.length <= LIMITS.mannerisms && card.specialMove.en.length <= LIMITS.specialMove);
    assert.equal(card.photoAudience, 'maker', 'sample pets never show a real photo');
    assert.equal(card.sample, true);
  }
});

// ---------- Words ----------

test('words with links, emails, phone numbers or addresses are kept out', () => {
  assert.deepEqual(checkText('Such a sweet dog!', 140), []);
  assert.ok(checkText('see www.example.com', 140).includes('link'));
  assert.ok(checkText('pics at dogs.com', 140).includes('link'));
  assert.ok(checkText('email me a@b.org', 140).includes('email'));
  assert.ok(checkText('call 512 555 0199', 140).includes('phone'));
  assert.ok(checkText('call (512) 555-0199', 140).includes('phone'));
  assert.ok(checkText('He lives at 1234 Sample Drive', 140).includes('address'));
  assert.ok(checkText('vive en Calle Falsa 123', 140).includes('address'));
  assert.ok(checkText('x'.repeat(141), 140).includes('tooLong'));
  assert.ok(checkText('hi', 140, 3).includes('tooShort'));
});

test('ordinary numbers in a note are fine', () => {
  assert.deepEqual(checkText('Duke is 11 years old and walks 2 miles', 140), []);
  assert.deepEqual(checkText('Biscuit carried 3 sticks at once!', 140), []);
});

test('every sample note and sample text passes the word check', () => {
  for (const n of samples.sampleNotes) assert.deepEqual(checkText(n.text, LIMITS.note, LIMITS.noteMin), [], n.id);
  for (const t of samples.sampleIncoming) assert.deepEqual(checkText(t.replace('{name}', 'Biscuit'), LIMITS.note, LIMITS.noteMin), [], t);
});

// ---------- Stickers ----------

test('one of each sticker per person, and tapping again takes it back', () => {
  let mine = toggleSticker([], 'goodest');
  mine = toggleSticker(mine, 'funny');
  assert.deepEqual(mine, ['goodest', 'funny']);
  assert.deepEqual(toggleSticker(mine, 'goodest'), ['funny']);
  const counts = stickerCounts({ goodest: 4 }, mine);
  assert.equal(counts.goodest, 5);
  assert.equal(counts.funny, 1);
  assert.equal(counts.brave, 0);
});

test('the card shows the top three stickers, ties in a fixed order', () => {
  const counts = stickerCounts({ goodest: 2, softest: 5, funny: 2, brave: 2 }, []);
  assert.deepEqual(topStickers(counts), [
    { id: 'softest', count: 5 },
    { id: 'goodest', count: 2 },
    { id: 'funny', count: 2 },
  ]);
  assert.deepEqual(topStickers(stickerCounts({}, [])), []);
});

test('every sticker has a label in the interface text', () => {
  for (const id of STICKER_IDS) assert.ok(`cards.sticker.${id}` in en, id);
});

// ---------- Paw notes ----------

const note = (over: Partial<PawNote>): PawNote => ({ id: 'n', petId: 'pet-a', text: 'Sweet dog', authorId: 'u1', at: NOW.toISOString(), status: 'waiting', sample: false, ...over });

test('a family cannot write a note on its own pet', () => {
  assert.ok(noteProblems({ text: 'Good boy', petId: 'pet-a', authorId: 'me', isOwnPet: true, notes: [], now: NOW }).includes('ownPet'));
});

test('one waiting note per pet per person, and three notes a day', () => {
  const waiting = [note({ authorId: 'me' })];
  assert.ok(noteProblems({ text: 'Another one', petId: 'pet-a', authorId: 'me', isOwnPet: false, notes: waiting, now: NOW }).includes('alreadyWaiting'));
  const three = ['pet-b', 'pet-c', 'pet-d'].map((petId, i) => note({ id: 'x' + i, petId, authorId: 'me', status: 'shown' }));
  assert.ok(noteProblems({ text: 'Lovely', petId: 'pet-e', authorId: 'me', isOwnPet: false, notes: three, now: NOW }).includes('dailyLimit'));
  const old = three.map((n) => ({ ...n, at: new Date(NOW.getTime() - 25 * 3_600_000).toISOString() }));
  assert.deepEqual(noteProblems({ text: 'Lovely', petId: 'pet-e', authorId: 'me', isOwnPet: false, notes: old, now: NOW }), []);
});

test('only the family decides, and only once', () => {
  const waiting = note({});
  assert.equal(decideNote(waiting, true, false), undefined);
  assert.equal(decideNote(waiting, true, true)?.status, 'shown');
  assert.equal(decideNote({ ...waiting, status: 'shown' }, false, true), undefined);
});

test('a blocked sender is not delivered, and only for that pet', () => {
  const blocks = [{ petId: 'pet-a', authorId: 'u1' }];
  assert.equal(isDelivered('u1', 'pet-a', blocks), false);
  assert.equal(isDelivered('u1', 'pet-b', blocks), true);
  assert.equal(isDelivered('u2', 'pet-a', blocks), true);
});

// ---------- Real photo ----------

test('a real photo is private to the family and the portrait maker by default', () => {
  assert.equal(canSeePhoto('maker', 'family'), true);
  assert.equal(canSeePhoto('maker', 'maker', true), true);
  assert.equal(canSeePhoto('maker', 'maker', false), false, 'not after the request ends');
  assert.equal(canSeePhoto('maker', 'neighbor'), false);
  assert.equal(canSeePhoto('neighbors', 'neighbor'), true);
  assert.equal(canSeePhoto('neighbors', 'visitor'), false, 'visitors never see a real photo');
});

// ---------- Album ----------

test('the album starts on a different card each day and never sorts by stickers', () => {
  const items = [{ id: 'c', name: 'Cy' }, { id: 'a', name: 'Al' }, { id: 'b', name: 'Bo' }];
  assert.deepEqual(albumOrder(items, 0).map((i) => i.id), ['a', 'b', 'c']);
  assert.deepEqual(albumOrder(items, 1).map((i) => i.id), ['b', 'c', 'a']);
  assert.deepEqual(albumOrder(items, 5).map((i) => i.id), ['c', 'a', 'b']);
  assert.deepEqual(albumOrder([], 3), []);
});

// ---------- Regulars ----------

const critter = (id: string) => game.critters.find((c) => c.id === id);

test('a regular must be a wild field guide animal at a shared public place', () => {
  assert.deepEqual(regularProblems({ critter: critter('heron'), name: 'Old Blue', about: 'Stands very still', zone: 'creek' }), []);
  assert.ok(regularProblems({ critter: undefined, name: 'Tiger', about: 'A stray orange cat', zone: 'park' }).includes('notWildlife'));
  assert.ok(regularProblems({ critter: critter('heron'), name: 'Old Blue', about: 'Stands very still', zone: 'yard' }).includes('privatePlace'));
  assert.ok(regularProblems({ critter: critter('heron'), name: 'Old Blue', about: 'Stands very still', zone: 'street' }).includes('privatePlace'));
});

test('animals that can hurt are never regulars', () => {
  for (const c of game.critters.filter((x) => x.caution)) {
    assert.ok(regularProblems({ critter: c, name: 'Name', about: 'About this one', zone: 'park' }).includes('risky'), c.id);
  }
});

test('a regular can never be a pet kind', () => {
  for (const kind of ['dog', 'cat', 'pet']) assert.equal(critter(kind), undefined);
});

test('sample regulars follow the same rules', () => {
  for (const r of samples.sampleRegulars) {
    assert.deepEqual(regularProblems({ critter: critter(r.critterId), name: r.name, about: r.about.en, zone: r.zone }), [], r.id);
  }
});

test('only moderators decide on suggestions; others see approved ones and their own', () => {
  const [approved, , , suggested] = samples.sampleRegulars;
  assert.equal(suggested.status, 'suggested');
  assert.equal(decideRegular(suggested, true, false), undefined);
  assert.equal(decideRegular(suggested, true, true)?.status, 'approved');
  assert.equal(decideRegular(approved, false, true), undefined);
  assert.ok(!visibleRegulars(samples.sampleRegulars, false).includes(suggested));
  assert.ok(visibleRegulars(samples.sampleRegulars, true).includes(suggested));
  assert.ok(visibleRegulars([{ ...suggested, mine: true }], false).length === 1);
});

// ---------- Portrait requests ----------

const req = (over: Partial<PortraitRequest>): PortraitRequest => ({
  id: 'r1',
  petId: 'pet-a',
  petName: 'Al',
  kind: 'dog',
  requestedAt: NOW.toISOString(),
  status: 'waiting',
  tries: 0,
  consent: { at: NOW.toISOString(), version: 'v', service: 'sample' },
  redo: false,
  mine: true,
  sample: false,
  ...over,
});
const base = { isFamily: true, hasPhoto: true, agreed: true, petId: 'pet-a', requests: [] as PortraitRequest[], demo: true };

test('a request needs the family, a photo and a yes on the agreement screen', () => {
  assert.deepEqual(requestProblems(base), []);
  assert.ok(requestProblems({ ...base, isFamily: false }).includes('notFamily'));
  assert.ok(requestProblems({ ...base, hasPhoto: false }).includes('noPhoto'));
  assert.ok(requestProblems({ ...base, agreed: false }).includes('notAgreed'));
});

test('no real request until the board approves an image service', () => {
  assert.equal(PORTRAIT_SERVICE.approved, false);
  assert.ok(requestProblems({ ...base, demo: false }).includes('serviceNotApproved'));
  assert.deepEqual(requestProblems({ ...base, demo: false, service: { approved: true, name: 'X' } }), []);
});

test('one open request per pet, two per household, one redo per pet', () => {
  assert.ok(requestProblems({ ...base, requests: [req({})] }).includes('alreadyOpen'));
  const two = [req({ id: 'a', petId: 'pet-b' }), req({ id: 'b', petId: 'pet-c' })];
  assert.ok(requestProblems({ ...base, requests: two }).includes('householdLimit'));
  const made = [req({ id: 'a', status: 'made' })];
  assert.deepEqual(requestProblems({ ...base, requests: made }), [], 'one redo is allowed');
  const madeTwice = [req({ id: 'a', status: 'made' }), req({ id: 'b', status: 'made' })];
  assert.ok(requestProblems({ ...base, requests: madeTwice }).includes('redoLimit'));
  assert.deepEqual(requestProblems({ ...base, requests: [req({ mine: false })] }), [], "other households' requests do not count");
});

test('a request moves only through its allowed steps', () => {
  const waiting = req({});
  assert.equal(advance(waiting, { type: 'photoOk', by: 'maker', checks: ['animalOnly'] }), undefined, 'every photo check is needed');
  const ok = advance(waiting, { type: 'photoOk', by: 'maker', checks: PHOTO_CHECKS });
  assert.equal(ok?.status, 'photoOk');
  assert.equal(advance(waiting, { type: 'finish', by: 'maker', tries: 2, triesLeft: 100 }), undefined, 'no picture before the photo check');
  assert.equal(advance(ok!, { type: 'finish', by: 'maker', tries: 0, triesLeft: 100 }), undefined);
  assert.equal(advance(ok!, { type: 'finish', by: 'maker', tries: PORTRAIT.triesPerRequest + 1, triesLeft: 100 }), undefined);
  assert.equal(advance(ok!, { type: 'finish', by: 'maker', tries: 3, triesLeft: 2 }), undefined, 'cannot pass the spending limit');
  assert.equal(advance(ok!, { type: 'finish', by: 'maker', tries: 3, triesLeft: 3 })?.status, 'made');
  const back = advance(waiting, { type: 'sendBack', by: 'maker', reason: 'people' });
  assert.equal(back?.status, 'sentBack');
  assert.equal(advance(back!, { type: 'newPhoto', by: 'family' })?.status, 'waiting');
  assert.equal(advance(req({ status: 'made' }), { type: 'cancel', by: 'family' }), undefined);
  assert.equal(advance(waiting, { type: 'cancel', by: 'family' })?.status, 'cancelled');
});

test('spending stays under the monthly and yearly limits', () => {
  assert.equal(PORTRAIT.yearlyCapCents, 5000);
  assert.equal(triesLeft([], NOW), PORTRAIT.monthlyCapCents / PORTRAIT.centsPerTry);
  const thisMonth = [{ at: NOW.toISOString(), tries: 99 }];
  assert.equal(spendCents(thisMonth, NOW, 'month'), 396);
  assert.equal(triesLeft(thisMonth, NOW), 1);
  const lastMonth = [{ at: '2026-10-05T12:00:00.000Z', tries: 99 }];
  assert.equal(triesLeft(lastMonth, NOW), 100, 'a new month starts fresh');
  // $48 spent earlier this year: the year has room for $2 (50 tries), less than this month's $4.
  const earlier = Array.from({ length: 10 }, (_, m) => ({ at: new Date(Date.UTC(2026, m, 2)).toISOString(), tries: 120 }));
  assert.equal(spendCents(earlier, NOW, 'year'), 4800);
  assert.equal(triesLeft(earlier, NOW), 50, 'the yearly limit holds even in a quiet month');
  assert.equal(triesLeft([...earlier, { at: '2026-03-03T00:00:00.000Z', tries: 50 }], NOW), 0);
});

test('a waiting photo is dropped after 30 days, and the queue is oldest first', () => {
  const old = req({ id: 'old', requestedAt: '2026-10-01T00:00:00.000Z' });
  assert.equal(isExpired(old, NOW), true);
  assert.equal(isExpired(req({}), NOW), false);
  const queue = queueOrder([req({ id: 'new' }), old, req({ id: 'done', status: 'made' })]);
  assert.deepEqual(queue.map((r) => r.id), ['old', 'new']);
});

test('requests are done in a weekly batch on Sunday', () => {
  assert.equal(nextBatchDay(new Date('2026-11-17T12:00:00')).getUTCDay(), 0);
  assert.equal(nextBatchDay(new Date('2026-11-17T12:00:00')).toISOString().slice(0, 10), '2026-11-22');
});

test('what goes to the image service carries no name, family or place', () => {
  const out = outbound(req({ petName: 'Biscuit' }));
  assert.deepEqual(Object.keys(out).sort(), ['fileName', 'kind']);
  assert.match(out.fileName, /^portrait-[0-9a-z]{6}\.jpg$/);
  assert.ok(!JSON.stringify(out).includes('Biscuit'));
  assert.notEqual(outbound(req({ id: 'r2' })).fileName, out.fileName);
});

// ---------- Store, end to end with sample data ----------

function makeStore(role: DemoRole = 'neighbor') {
  let state: PetCardState = emptyPetCards();
  const pets: Pet[] = [{ ...game.samplePets[0], id: 'mypet-1', name: 'Nutmeg', mine: true, sample: false }, ...game.samplePets];
  let who = role;
  const store = new PetCardStore({
    read: () => state,
    write: async (next) => {
      state = next;
    },
    notify: () => undefined,
    role: () => who,
    findPet: (id) => pets.find((p) => p.id === id),
    findCritter: (id) => game.critters.find((c) => c.id === id),
  });
  return { store, setRole: (r: DemoRole) => (who = r), state: () => state };
}

test('end to end: card, notes, photo, request, portrait, with sample data', async () => {
  const { store, setRole } = makeStore('neighbor');

  // The family fills in the card. Two pretend notes arrive to approve.
  await store.saveCard({ petId: 'mypet-1', classId: 'snackBandit', stats: cleanStats({ snack: 5 }), favorites: ['treats'], mannerisms: 'Sneezes when happy', specialMove: 'The Sneeze', photoAudience: 'maker' });
  assert.equal(store.getCard('mypet-1')?.classId, 'snackBandit');
  const waiting = store.getNotes('mypet-1').waiting;
  assert.equal(waiting.length, 2);
  await store.decideNote(waiting[0].id, true);
  await store.blockSender(waiting[1].id);
  assert.equal(store.getNotes('mypet-1').shown.length, 1);
  assert.equal(store.getNotes('mypet-1').waiting.length, 0);

  // The family cannot sticker or note its own pet. A neighbor can sticker another pet.
  await store.toggleSticker('mypet-1', 'goodest');
  assert.equal(store.getStickers('mypet-1').counts.goodest, 0);
  await store.toggleSticker('pet-biscuit', 'brave');
  assert.deepEqual(store.getStickers('pet-biscuit').mine, ['brave']);
  assert.ok((await store.sendNote('mypet-1', 'Good dog')).includes('ownPet'));
  assert.deepEqual(await store.sendNote('pet-duke', 'Duke is the best greeter.'), []);
  assert.equal(store.getNotes('pet-duke').mineWaiting, 1);
  assert.equal(store.getNotes('pet-duke').waiting.length, 0, 'only the family sees waiting notes');

  // Photo and request.
  assert.ok(store.requestProblems('mypet-1', true).includes('noPhoto'));
  store.setPhoto('mypet-1', 'file:///photo.jpg');
  store.setPhoto('pet-duke', 'file:///not-mine.jpg');
  assert.equal(store.getPhoto('pet-duke'), undefined, 'no one can add a photo to a pet that is not theirs');
  assert.deepEqual(store.requestPortrait('mypet-1', true), []);
  const mine = store.getRequest('mypet-1')!;
  assert.equal(mine.status, 'waiting');
  assert.equal(mine.consent.version.length > 0, true);

  // A neighbor is not the portrait maker.
  assert.equal(store.checkPhoto(mine.id, PHOTO_CHECKS), false);
  assert.equal(store.getRequestPhoto(mine.id), undefined);

  // The portrait maker works the queue, oldest first.
  setRole('board');
  const queue = store.listRequests();
  assert.equal(queue[0].sample, true, 'the older sample request comes first');
  assert.equal(store.getRequestPhoto(mine.id), 'file:///photo.jpg');
  assert.equal(store.checkPhoto(mine.id, PHOTO_CHECKS), true);
  assert.equal(await store.finishPortrait(mine.id, 3), true);
  assert.deepEqual(store.getPortrait('mypet-1'), { kind: 'sample' });
  assert.equal(store.getSpend().monthCents, 3 * PORTRAIT.centsPerTry);
  assert.equal(store.getRequestPhoto(mine.id), undefined, 'the maker cannot see the photo once the request ends');

  // The photo was private, so it is deleted when the request ends.
  setRole('neighbor');
  assert.equal(store.getPhoto('mypet-1'), undefined);
  assert.equal(store.getRequest('mypet-1')?.status, 'made');
});

test('a photo the family chose to show neighbors stays after the request', async () => {
  const { store, setRole } = makeStore('neighbor');
  await store.saveCard({ petId: 'mypet-1', classId: 'napWizard', stats: cleanStats({}), favorites: [], mannerisms: '', specialMove: '', photoAudience: 'neighbors' });
  store.setPhoto('mypet-1', 'file:///photo.jpg');
  store.requestPortrait('mypet-1', true);
  const id = store.getRequest('mypet-1')!.id;
  setRole('board');
  store.checkPhoto(id, [], 'notClear');
  setRole('neighbor');
  assert.equal(store.getRequest('mypet-1')?.status, 'sentBack');
  assert.equal(store.cancelRequest(id), true);
  assert.equal(store.getPhoto('mypet-1'), 'file:///photo.jpg');
  setRole('visitor');
  assert.equal(store.getPhoto('mypet-1'), undefined, 'still never shown to visitors');
});

test('removing a pet removes its card, notes, stickers, photo and requests', async () => {
  const { store } = makeStore('neighbor');
  await store.saveCard({ petId: 'mypet-1', classId: 'napWizard', stats: cleanStats({}), favorites: [], mannerisms: '', specialMove: '', photoAudience: 'maker' });
  store.setPhoto('mypet-1', 'file:///p.jpg');
  store.requestPortrait('mypet-1', true);
  const after = store.forgetPet('mypet-1');
  assert.equal(after.cards['mypet-1'], undefined);
  assert.equal(after.notes.filter((n) => n.petId === 'mypet-1').length, 0);
  assert.equal((after.requests ?? []).filter((r) => r.petId === 'mypet-1').length, 0);
});

test('visitors can look but cannot sticker, note or suggest', async () => {
  const { store } = makeStore('visitor');
  await store.toggleSticker('pet-biscuit', 'goodest');
  assert.deepEqual(store.getStickers('pet-biscuit').mine, []);
  assert.ok((await store.sendNote('pet-biscuit', 'Lovely dog')).length > 0);
  assert.ok((await store.suggestRegular({ critterId: 'heron', name: 'Stilts', about: 'Tall and quiet', zone: 'creek', classId: 'napWizard', stats: cleanStats({}) })).length > 0);
});

test('saved card data never holds a photo or a portrait image', async () => {
  const { store, setRole, state } = makeStore('neighbor');
  await store.saveCard({ petId: 'mypet-1', classId: 'napWizard', stats: cleanStats({}), favorites: [], mannerisms: '', specialMove: '', photoAudience: 'maker' });
  store.setPhoto('mypet-1', 'file:///secret-photo.jpg');
  store.requestPortrait('mypet-1', true);
  setRole('board');
  const id = store.listRequests().find((r) => r.petId === 'mypet-1')!.id;
  store.checkPhoto(id, PHOTO_CHECKS);
  await store.finishPortrait(id, 1, 'file:///secret-portrait.png');
  const saved = JSON.stringify(state());
  assert.ok(!saved.includes('secret-photo') && !saved.includes('secret-portrait'));
});

test('the store ends a request after 30 days and deletes its private photo', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: NOW });
  const { store } = makeStore('neighbor');
  store.setPhoto('mypet-1', 'file:///p.jpg');
  store.requestPortrait('mypet-1', true);
  assert.equal(store.getRequest('mypet-1')?.status, 'waiting');
  t.mock.timers.tick(31 * 86_400_000);
  assert.equal(store.getRequest('mypet-1')?.status, 'expired');
  assert.equal(store.getPhoto('mypet-1'), undefined);
});

test('card text is readable on every card background', () => {
  const pairs: [string, string, number][] = [
    [MENU.ink, CARD_COLORS.goldSoft, 4.5],
    [MENU.ink, MENU.parchmentDeep, 4.5],
    [MENU.inkSoft, MENU.parchmentDeep, 4.5],
    [MENU.parchment, MENU.woodDark, 4.5],
    // A filled stat segment must stand out from an empty one (WCAG 1.4.11).
    [CARD_COLORS.statOn, MENU.parchment, 3],
  ];
  for (const [fg, bg, min] of pairs) assert.ok(contrast(fg, bg) >= min, `${fg} on ${bg} is ${contrast(fg, bg).toFixed(2)}`);
});

test('only the family can take down a note it showed', async () => {
  const { store, setRole } = makeStore('neighbor');
  await store.saveCard({ petId: 'mypet-1', classId: 'napWizard', stats: cleanStats({}), favorites: [], mannerisms: '', specialMove: '', photoAudience: 'maker' });
  const [first] = store.getNotes('mypet-1').waiting;
  await store.decideNote(first.id, true);
  setRole('visitor');
  await store.removeNote(first.id);
  setRole('neighbor');
  assert.equal(store.getNotes('mypet-1').shown.length, 1, 'a signed-out person cannot take it down');
  await store.removeNote(first.id);
  assert.equal(store.getNotes('mypet-1').shown.length, 0);
  await store.removeNote('note-on-someone-else');
  assert.equal(store.getNotes('pet-biscuit').shown.length, 3, "nobody can take down another family's notes");
});
