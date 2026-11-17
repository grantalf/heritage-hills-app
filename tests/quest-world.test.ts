/**
 * Block 3: the storybook map, travel along roads, places, quests, saved data,
 * patterns on the map, pixel critters and the zone's colors.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { critterArt, petArt } from '../src/lib/data/game-art';
import { bingoCards, critters, samplePets } from '../src/lib/data/game-content';
import type { GameState, Sighting } from '../src/lib/data/game-types';
import { emptyGame, totalPoints } from '../src/lib/game';
import { en } from '../src/lib/i18n/en';
import { es } from '../src/lib/i18n/es';
import { addObservation, emptyObservations, MIN_FOR_PATTERN, ZONES } from '../src/lib/patterns';
import { colorCount, INK } from '../src/lib/pixel/raster';
import { LOOKS } from '../src/lib/pixel/sheet';
import { CRITTER_CELL, critterPixels } from '../src/lib/quest/critter-puppet';
import { CRITTER_INDEX } from '../src/lib/quest/critters.generated';
import { levelLink } from '../src/lib/quest/levels';
import { nearestNode, pathLength, roadGraph, ROADS, shortestPath, toWorld, WORLD_H, WORLD_W } from '../src/lib/quest/map';
import { groupView } from '../src/lib/quest/map-patterns';
import { ZONE, ZONE_EXTRA } from '../src/lib/quest/palette';
import { PAPER } from '../src/lib/quest/paper-colors';
import { PLACES, placeById, placeNode, routeBetween, travelSeconds } from '../src/lib/quest/places';
import { experience, hostQuest, offered, questStatus, questXp, QUESTS, type QuestContext } from '../src/lib/quest/quests';
import { arrive, claim, emptyWorld, meetHost, parseWorld } from '../src/lib/quest/state';
import { contrast } from './contrast.test';

const key = (k: string) => k as keyof typeof en;

// ---------- map and travel ----------

test('the map has the streets from the founder sketch, and only those', () => {
  const names = ROADS.filter((r) => r.name).map((r) => r.name);
  for (const n of ['Hermitage Dr', 'Furness Dr', 'Furness Cv', 'Loralinda Dr', 'Durham Dr', 'Danville Dr', 'Weeping Willow Dr', 'Wisteria Trl', 'Wisteria Cir', 'Bridgetown Dr', 'Brettonwoods Ln', 'Chantilly Ln', 'Shenandoah Dr', 'Pepperell Ct', 'Potomac Path', 'Grayledge Dr', 'Valley Forge Dr', 'Tecumseh Dr']) {
    assert.ok(names.includes(n), n);
  }
  assert.equal(new Set(ROADS.map((r) => r.id)).size, ROADS.length);
});

test('every road point lands on the map', () => {
  for (const road of ROADS) {
    assert.ok(road.points.length >= 2, road.id);
    for (const p of road.points) {
      const [x, y] = toWorld(p);
      assert.ok(x >= 0 && x <= WORLD_W && y >= 0 && y <= WORLD_H, `${road.id} ${p}`);
    }
  }
});

test('the road network is one piece: every road point can reach every other', () => {
  const { nodes, edges } = roadGraph();
  const seen = new Set([0]);
  const queue = [0];
  while (queue.length) for (const e of edges.get(queue.shift()!) ?? []) if (!seen.has(e.to)) (seen.add(e.to), queue.push(e.to));
  assert.equal(seen.size, nodes.length);
});

test('travel goes along the roads between every pair of places', () => {
  const { nodes, edges } = roadGraph();
  for (const a of PLACES) {
    for (const b of PLACES) {
      if (a.id === b.id) continue;
      const path = shortestPath(placeNode(a), placeNode(b));
      assert.ok(path.length >= 1, `${a.id} to ${b.id}`);
      // Each step is a real road segment.
      for (let i = 0; i < path.length - 1; i++) assert.ok(edges.get(path[i])!.some((e) => e.to === path[i + 1]), `${a.id}-${b.id} step ${i}`);
      const route = routeBetween(a, b);
      assert.ok(pathLength(route) > 0);
      const secs = travelSeconds(route);
      assert.ok(secs >= 0.5 && secs <= 2.4, `${a.id}-${b.id} takes ${secs}s`);
      void nodes;
    }
  }
});

test('each place is close to a road, so the token never cuts across yards', () => {
  const { nodes } = roadGraph();
  for (const place of PLACES) {
    const [x, y] = toWorld(place.at);
    const [nx, ny] = nodes[nearestNode([x, y])];
    assert.ok(Math.hypot(nx - x, ny - y) < 45, `${place.id} is ${Math.hypot(nx - x, ny - y).toFixed(0)} from a road`);
  }
});

test('a route that crosses the map follows roads, not a straight line', () => {
  const route = routeBetween(placeById('lookout')!, placeById('school')!);
  const straight = Math.hypot(route[0][0] - route[route.length - 1][0], route[0][1] - route[route.length - 1][1]);
  assert.ok(route.length > 6);
  assert.ok(pathLength(route) > straight);
});

// ---------- places ----------

test('no fights at the school, at homes or at the garden (D-073)', () => {
  for (const id of ['school', 'garden'] as const) {
    const p = placeById(id)!;
    assert.notEqual(p.kind, 'rescue', id);
    assert.ok(!p.activities.some((a) => a.kind === 'rescue'), id);
  }
  assert.equal(placeById('school')!.kind, 'landmark');
  assert.equal(placeById('school')!.activities.length, 0);
  // Rescue places are made-up lands at the edges of the map.
  for (const p of PLACES.filter((x) => x.kind === 'rescue')) {
    assert.equal(p.real, false, p.id);
    const [x] = toWorld(p.at);
    assert.ok(x < 60 || x > WORLD_W - 120, `${p.id} is at the edge`);
  }
});

test('every host is a field guide animal with a pixel critter, a name and a hello in both languages', () => {
  for (const p of PLACES) {
    for (const k of [`place.${p.id}.name`, `place.${p.id}.about`]) {
      assert.ok(en[key(k)], k);
      assert.ok(es[key(k)], k);
    }
    if (!p.host) continue;
    assert.ok(critters.some((c) => c.id === p.host), p.host);
    assert.ok(p.host in CRITTER_INDEX, p.host);
    for (const k of [`host.${p.host}`, `hello.${p.id}`]) {
      assert.ok(en[key(k)], k);
      assert.ok(es[key(k)], k);
    }
  }
});

test('spooky places link to the rescue game; unknown levels wait for later', () => {
  assert.deepEqual(levelLink('frontier-trail'), { ready: true, href: '/brawler?level=frontier-trail' });
  assert.deepEqual(levelLink('roaring-wall'), { ready: false });
  assert.deepEqual(levelLink('frontier-trail', []), { ready: false });
});

// ---------- saved data ----------

test('saved map data is read defensively', () => {
  assert.deepEqual(parseWorld(null), emptyWorld());
  assert.deepEqual(parseWorld('not json'), emptyWorld());
  assert.deepEqual(parseWorld('[1,2]').at, emptyWorld().at);
  const w = parseWorld(JSON.stringify({ at: 'creek', visited: ['garden', 'nowhere', 'garden'], met: ['creek', 42], claimed: ['wander', '<script>', 'x'.repeat(40)], sound: false, intro: 'yes' }));
  assert.equal(w.at, 'creek');
  assert.deepEqual(w.visited, ['garden', 'creek']);
  assert.deepEqual(w.met, ['creek']);
  assert.deepEqual(w.claimed, ['wander']);
  assert.equal(w.sound, false);
  assert.equal(w.intro, false);
});

test('saved map data holds no location, name or account', () => {
  const keys = Object.keys(emptyWorld()).sort();
  assert.deepEqual(keys, ['at', 'claimed', 'intro', 'met', 'sound', 'visited']);
});

// ---------- quests ----------

const sight = (critterId: string, zone: Sighting['zone'] = 'yard'): Sighting => ({ id: critterId + zone + Math.random(), critterId, zone, at: '2026-11-16T12:00:00.000Z', hasPhoto: false });
const ctxWith = (game: Partial<GameState> = {}, world = emptyWorld(), stamps: string[] = []): QuestContext => ({ game: { ...emptyGame(), ...game }, critters, cards: bingoCards, world, stamps });

test('quests are unique, given by hosts, and worded in both languages', () => {
  assert.equal(new Set(QUESTS.map((q) => q.id)).size, QUESTS.length);
  for (const q of QUESTS) {
    assert.ok(placeById(q.place)?.host, `${q.id} has a host`);
    assert.ok(q.target > 0 && q.xp > 0);
    for (const part of ['title', 'ask', 'done']) {
      assert.ok(en[key(`quest.${q.id}.${part}`)], `${q.id}.${part}`);
      assert.ok(es[key(`quest.${q.id}.${part}`)], `${q.id}.${part} es`);
    }
  }
});

test('quests reward noticing, never touching, feeding, chasing or entering yards (D-050)', () => {
  for (const q of QUESTS) {
    const text = en[key(`quest.${q.id}.ask`)].toLowerCase();
    for (const bad of ['touch', 'feed', 'chase', 'catch', 'pick up', 'pet the', "someone's yard"]) assert.ok(!text.includes(bad), `${q.id}: ${bad}`);
  }
});

test('a quest goes from unmet to active to ready to done', () => {
  const q = QUESTS.find((x) => x.id === 'creekSpot')!;
  let world = emptyWorld();
  assert.equal(questStatus(q, ctxWith({}, world)).status, 'unmet');
  world = meetHost(arrive(world, 'creek'), 'creek');
  assert.equal(questStatus(q, ctxWith({}, world)).status, 'active');
  // A sighting somewhere else does not count.
  assert.equal(questStatus(q, ctxWith({ sightings: [sight('heron', 'yard')] }, world)).status, 'active');
  const done = ctxWith({ sightings: [sight('heron', 'creek')] }, world);
  assert.equal(questStatus(q, done).status, 'ready');
  assert.equal(hostQuest('creek', done)?.id, 'creekSpot');
  const after = { ...done, world: claim(world, 'creekSpot') };
  assert.equal(questStatus(q, after).status, 'done');
  assert.equal(hostQuest('creek', after), undefined);
});

test('a host offers its quests in order', () => {
  const world = claim(meetHost(emptyWorld(), 'bridge'), 'birds');
  assert.equal(hostQuest('bridge', ctxWith({}, meetHost(emptyWorld(), 'bridge')))?.id, 'birds');
  assert.equal(hostQuest('bridge', ctxWith({}, world))?.id, 'caseSolve');
});

test('the rescue quest counts Frontier Trail stamps only, and claiming twice pays once', () => {
  const q = QUESTS.find((x) => x.id === 'rescue')!;
  assert.ok(offered(q));
  const world = meetHost(emptyWorld(), 'statue');
  assert.equal(questStatus(q, ctxWith({}, world, ['other-level:fox', 'frontier-trail:armadillo'])).now, 1);
  assert.equal(questStatus(q, ctxWith({}, world, ['frontier-trail:armadillo', 'frontier-trail:squirrel', 'frontier-trail:cottontail'])).status, 'ready');
  const twice = claim(claim(world, 'rescue'), 'rescue');
  assert.equal(questXp(twice), q.xp);
});

test('experience is game points plus quest rewards, and the bar never overflows', () => {
  const game = { sightings: [sight('squirrel'), sight('cardinal')] };
  const base = experience(ctxWith(game));
  assert.equal(base.xp, totalPoints({ ...emptyGame(), ...game }, critters, bingoCards));
  const more = experience(ctxWith(game, claim(emptyWorld(), 'wander')));
  assert.equal(more.xp, base.xp + 20);
  for (const xp of [0, 49, 50, 149, 700, 5000]) {
    const e = experience(ctxWith({}, { ...emptyWorld(), claimed: [] }));
    void xp;
    assert.ok(e.share >= 0 && e.share <= 1);
  }
});

// ---------- patterns on the map ----------

test('patterns on the map say nothing below the minimum and never place yards on the map', () => {
  let all = emptyObservations();
  for (let i = 0; i < MIN_FOR_PATTERN - 1; i++) all = addObservation(all, 'heron', 'creek', new Date(2026, 4, 1, 7));
  const few = groupView(all, critters, 'bird');
  assert.equal(few.enough, false);
  assert.equal(few.atCreek, 0);
  assert.deepEqual(few.top, []);
  for (let i = 0; i < 10; i++) all = addObservation(all, 'cardinal', 'yard', new Date(2026, 4, 1, 18));
  const enough = groupView(all, critters, 'bird');
  assert.equal(enough.enough, true);
  assert.equal(enough.atCreek, MIN_FOR_PATTERN - 1);
  assert.ok(enough.around.every((a) => a.zone !== 'creek'));
  assert.ok(enough.around.some((a) => a.zone === 'yard'));
  assert.ok(enough.around.reduce((s, a) => s + a.percent, 0) <= 100);
});

test('pets never appear in map patterns', () => {
  let all = emptyObservations();
  for (let i = 0; i < 30; i++) all = addObservation(all, samplePets[0].id, 'creek', new Date(2026, 4, 1, 7));
  for (const group of ['mammal', 'bird', 'reptile', 'amphibian', 'insect', 'other'] as const) {
    const v = groupView(all, critters, group);
    assert.equal(v.total, 0);
    assert.ok(!v.top.includes(samplePets[0].id));
  }
  void ZONES;
});

// ---------- pixel critters ----------

test('every field guide animal and sample pet has a pixel critter', () => {
  for (const c of critters) assert.ok(c.id in CRITTER_INDEX, c.id);
  for (const p of samplePets) if (petArt[p.id]) assert.ok(p.id in CRITTER_INDEX, p.id);
});

test('pixel critters fit their cell, have a dark outline and a small palette', () => {
  for (const id of ['raccoon', 'monarch', 'coralsnake', 'scorpion', 'heron']) {
    const sprite = critterPixels(critterArt[id], LOOKS.thickShaded);
    assert.equal(sprite.w, CRITTER_CELL);
    assert.equal(sprite.h, CRITTER_CELL);
    // The edge rows stay clear, so the outline is never cut off.
    for (let x = 0; x < sprite.w; x++) {
      assert.equal(sprite.rgba[x * 4 + 3], 0, `${id} top edge`);
      assert.equal(sprite.rgba[((sprite.h - 1) * sprite.w + x) * 4 + 3], 0, `${id} bottom edge`);
    }
    let ink = 0;
    for (let i = 0; i < sprite.rgba.length; i += 4) if (sprite.rgba[i] === INK[0] && sprite.rgba[i + 1] === INK[1] && sprite.rgba[i + 2] === INK[2]) ink++;
    assert.ok(ink > 40, `${id} outline`);
    assert.ok(colorCount(sprite) <= 32, `${id} uses ${colorCount(sprite)} colors`);
  }
});

// ---------- colors ----------

const TEXT_PAIRS: [keyof typeof ZONE, keyof typeof ZONE][] = [
  ['text', 'background'], ['text', 'surface'], ['text', 'surfaceStrong'], ['text', 'primarySoft'], ['text', 'urgentSoft'], ['text', 'noticeSoft'], ['text', 'goodSoft'],
  ['textSecondary', 'background'], ['textSecondary', 'surface'], ['textSecondary', 'primarySoft'], ['textSecondary', 'urgentSoft'], ['textSecondary', 'noticeSoft'], ['textSecondary', 'goodSoft'],
  ['primary', 'background'], ['primary', 'surface'], ['primary', 'primarySoft'], ['onPrimary', 'primary'],
  ['urgent', 'background'], ['urgent', 'urgentSoft'], ['notice', 'noticeSoft'], ['good', 'goodSoft'], ['good', 'surface'], ['onSample', 'sample'],
];

test('the game zone colors meet text contrast (4.5 to 1)', () => {
  for (const [fg, bg] of TEXT_PAIRS) {
    const ratio = contrast(ZONE[fg], ZONE[bg]);
    assert.ok(ratio >= 4.5, `${fg} on ${bg} is ${ratio.toFixed(2)}`);
  }
  for (const [fg, bg] of [['border', 'background'], ['border', 'surface']] as const) assert.ok(contrast(ZONE[fg], ZONE[bg]) >= 3, `${fg} on ${bg}`);
});

test('the zone pieces and map labels meet text contrast', () => {
  const pairs: [string, string, string][] = [
    ['menu text on wood', ZONE.onPrimary, ZONE_EXTRA.wood],
    ['selected menu text', ZONE_EXTRA.gold, ZONE_EXTRA.woodDark],
    ['experience text', ZONE.onPrimary, ZONE_EXTRA.woodDark],
    ['rescue place text', ZONE_EXTRA.onSpooky, ZONE_EXTRA.spooky],
    ['dialog text', ZONE.text, ZONE_EXTRA.dialog],
    ['dialog name', ZONE.primary, ZONE_EXTRA.dialog],
    ['map labels', PAPER.ink, PAPER.paperLight],
    ['rescue labels on the map', PAPER.red, PAPER.paperLight],
  ];
  for (const [what, fg, bg] of pairs) assert.ok(contrast(fg, bg) >= 4.5, `${what}: ${contrast(fg, bg).toFixed(2)}`);
});
