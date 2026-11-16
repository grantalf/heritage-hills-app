/**
 * Critter Club rules. Pure functions so they can be tested and later run on a server.
 *
 * Design choices (docs/GAME.md):
 *  - Cooperative, not competitive. There is no leaderboard of people or streets.
 *  - Points reward noticing and learning, never touching, chasing or feeding.
 *  - Places are broad kinds of place. No addresses and no map pins.
 */
import type { BadgeId, BingoCard, Critter, CritterGroup, GameState, MysteryResult, Rarity } from './data/game-types';

export const GROUPS: CritterGroup[] = ['mammal', 'bird', 'reptile', 'amphibian', 'insect', 'other'];

export const POINTS = {
  sighting: 5,
  firstFind: { common: 20, sometimes: 35, rare: 60 } as Record<Rarity, number>,
  petMet: 10,
  mystery: { 1: 30, 2: 20, 3: 10 } as Record<number, number>,
  bingoSquare: 5,
  bingoLine: 25,
};

export const emptyGame = (): GameState => ({ sightings: [], petsMet: [], mysteries: {}, bingo: {} });

export function spottedIds(state: GameState): Set<string> {
  return new Set(state.sightings.map((s) => s.critterId));
}

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

/** How many complete rows, columns and diagonals a card has. */
export function bingoLines(card: BingoCard, marked: readonly string[]): number {
  const on = card.squares.map((sq) => marked.includes(sq.id));
  return LINES.filter((line) => line.every((i) => on[i])).length;
}

export function mysteryPoints(result: MysteryResult): number {
  return result.solved ? (POINTS.mystery[result.cluesUsed] ?? POINTS.mystery[3]) : 0;
}

export function totalPoints(state: GameState, critters: readonly Critter[], cards: readonly BingoCard[]): number {
  const byId = new Map(critters.map((c) => [c.id, c]));
  let points = state.sightings.length * POINTS.sighting;
  for (const id of spottedIds(state)) {
    const critter = byId.get(id);
    if (critter) points += POINTS.firstFind[critter.rarity];
  }
  points += state.petsMet.length * POINTS.petMet;
  for (const result of Object.values(state.mysteries)) points += mysteryPoints(result);
  for (const card of cards) {
    const marked = state.bingo[card.id] ?? [];
    points += marked.length * POINTS.bingoSquare + bingoLines(card, marked) * POINTS.bingoLine;
  }
  return points;
}

export const RANKS = [
  { id: 'curious', min: 0 },
  { id: 'scout', min: 50 },
  { id: 'detective', min: 150 },
  { id: 'naturalist', min: 350 },
  { id: 'guardian', min: 700 },
] as const;
export type RankId = (typeof RANKS)[number]['id'];

export function rankFor(points: number): { id: RankId; next?: { id: RankId; pointsToGo: number } } {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) if (points >= RANKS[i].min) index = i;
  const next = RANKS[index + 1];
  return { id: RANKS[index].id, next: next ? { id: next.id, pointsToGo: next.min - points } : undefined };
}

export const BADGES: BadgeId[] = ['firstFind', 'sharpEyes', 'allKinds', 'nightOwl', 'pollinatorFriend', 'creekKeeper', 'petPal', 'caseClosed', 'bingo'];

export function earnedBadges(state: GameState, critters: readonly Critter[], cards: readonly BingoCard[]): Set<BadgeId> {
  const byId = new Map(critters.map((c) => [c.id, c]));
  const spotted = [...spottedIds(state)].map((id) => byId.get(id)).filter((c): c is Critter => !!c);
  const earned = new Set<BadgeId>();
  if (spotted.length >= 1) earned.add('firstFind');
  if (spotted.length >= 5) earned.add('sharpEyes');
  if (GROUPS.every((g) => spotted.some((c) => c.group === g))) earned.add('allKinds');
  if (spotted.filter((c) => c.night).length >= 3) earned.add('nightOwl');
  if (spotted.filter((c) => c.pollinator).length >= 3) earned.add('pollinatorFriend');
  if (state.sightings.some((s) => s.zone === 'creek')) earned.add('creekKeeper');
  if (state.petsMet.length >= 3) earned.add('petPal');
  if (Object.values(state.mysteries).some((m) => m.solved)) earned.add('caseClosed');
  if (cards.some((card) => bingoLines(card, state.bingo[card.id] ?? []) >= 1)) earned.add('bingo');
  return earned;
}

/** Which bingo card fits the month (1-12). */
export function cardForMonth(cards: readonly BingoCard[], month: number): BingoCard {
  const warm = month >= 3 && month <= 8;
  return cards.find((c) => c.id === (warm ? 'warm' : 'cool')) ?? cards[0];
}

export type Tally = {
  total: number;
  speciesSeen: number;
  speciesTotal: number;
  byGroup: { group: CritterGroup; seen: number; total: number }[];
  top: { critterId: string; count: number }[];
};

/** Neighborhood totals. Counts only: who saw what, and where exactly, is never part of it. */
export function tally(counts: Readonly<Record<string, number>>, critters: readonly Critter[]): Tally {
  const seen = (c: Critter) => (counts[c.id] ?? 0) > 0;
  return {
    total: critters.reduce((sum, c) => sum + (counts[c.id] ?? 0), 0),
    speciesSeen: critters.filter(seen).length,
    speciesTotal: critters.length,
    byGroup: GROUPS.map((group) => {
      const inGroup = critters.filter((c) => c.group === group);
      return { group, seen: inGroup.filter(seen).length, total: inGroup.length };
    }),
    top: critters
      .map((c) => ({ critterId: c.id, count: counts[c.id] ?? 0 }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count || a.critterId.localeCompare(b.critterId))
      .slice(0, 5),
  };
}
