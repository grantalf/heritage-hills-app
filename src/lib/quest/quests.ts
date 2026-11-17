/**
 * Quests: small jobs that critter hosts give out at their places.
 *
 * Each quest is a rule over things the game already records (sightings, pets
 * met, cases, bingo, rescue stamps, places visited), so quests add no new data.
 * Quests reward noticing and learning only (D-050): nothing asks you to get
 * closer to, touch, feed or chase an animal, or to go into anyone's yard.
 *
 * Experience points (XP) are the game's existing points plus quest rewards.
 * They decide the rank shown on the experience bar.
 */
import type { BingoCard, Critter, CritterGroup, GameState } from '../data/game-types';
import { bingoLines, GROUPS, RANKS, rankFor, spottedIds, totalPoints, type RankId } from '../game';
import { RESCUE_IN_APP } from './levels';
import type { PlaceId } from './places';
import type { WorldSave } from './state';

export type QuestContext = {
  game: GameState;
  critters: readonly Critter[];
  cards: readonly BingoCard[];
  world: WorldSave;
  /** Rescue stamps from the side-scroller, "levelId:critterId". */
  stamps: readonly string[];
};

export type QuestId = 'wander' | 'rescue' | 'creekSpot' | 'birds' | 'caseSolve' | 'pollinators' | 'bingoLine' | 'nightOwls' | 'allKinds' | 'pets';

export type Quest = {
  id: QuestId;
  place: PlaceId;
  target: number;
  xp: number;
  progress: (ctx: QuestContext) => number;
  /** Only offered when the rescue game is part of this app (D-061). */
  needsRescue?: boolean;
};

const spotted = (ctx: QuestContext, keep: (c: Critter) => boolean) => {
  const ids = spottedIds(ctx.game);
  return ctx.critters.filter((c) => ids.has(c.id) && keep(c)).length;
};
const groupsFound = (ctx: QuestContext) => {
  const ids = spottedIds(ctx.game);
  return GROUPS.filter((g: CritterGroup) => ctx.critters.some((c) => c.group === g && ids.has(c.id))).length;
};

/** In the order each host offers them. */
export const QUESTS: Quest[] = [
  { id: 'wander', place: 'statue', target: 4, xp: 20, progress: (x) => x.world.visited.length },
  { id: 'rescue', place: 'statue', target: 3, xp: 40, needsRescue: true, progress: (x) => x.stamps.filter((s) => s.startsWith('frontier-trail:')).length },
  { id: 'creekSpot', place: 'creek', target: 1, xp: 15, progress: (x) => new Set(x.game.sightings.filter((s) => s.zone === 'creek').map((s) => s.critterId)).size },
  { id: 'birds', place: 'bridge', target: 3, xp: 30, progress: (x) => spotted(x, (c) => c.group === 'bird') },
  { id: 'caseSolve', place: 'bridge', target: 1, xp: 25, progress: (x) => Object.values(x.game.mysteries).filter((m) => m.solved).length },
  { id: 'pollinators', place: 'garden', target: 2, xp: 25, progress: (x) => spotted(x, (c) => !!c.pollinator) },
  { id: 'bingoLine', place: 'garden', target: 1, xp: 25, progress: (x) => x.cards.reduce((n, card) => n + bingoLines(card, x.game.bingo[card.id] ?? []), 0) },
  { id: 'nightOwls', place: 'lookout', target: 3, xp: 30, progress: (x) => spotted(x, (c) => !!c.night) },
  { id: 'allKinds', place: 'lookout', target: 6, xp: 50, progress: groupsFound },
  { id: 'pets', place: 'signpost', target: 2, xp: 20, progress: (x) => x.game.petsMet.length },
];

export const offered = (q: Quest): boolean => !q.needsRescue || RESCUE_IN_APP;
export const questById = (id: string) => QUESTS.find((q) => q.id === id);

export type QuestStatus = 'unmet' | 'active' | 'ready' | 'done';

export function questStatus(q: Quest, ctx: QuestContext): { status: QuestStatus; now: number } {
  const now = Math.min(q.target, Math.max(0, q.progress(ctx)));
  if (ctx.world.claimed.includes(q.id)) return { status: 'done', now: q.target };
  if (!ctx.world.met.includes(q.place)) return { status: 'unmet', now };
  return { status: now >= q.target ? 'ready' : 'active', now };
}

/** What a host says when you arrive: the first quest that is not finished, or nothing left. */
export function hostQuest(place: PlaceId, ctx: QuestContext): Quest | undefined {
  return QUESTS.filter((q) => q.place === place && offered(q)).find((q) => !ctx.world.claimed.includes(q.id));
}

export function questXp(world: WorldSave): number {
  return QUESTS.filter((q) => world.claimed.includes(q.id)).reduce((sum, q) => sum + q.xp, 0);
}

export type Experience = { xp: number; rank: RankId; next?: { rank: RankId; toGo: number }; share: number };

/** XP and rank for the experience bar. share is how far along to the next rank, 0 to 1. */
export function experience(ctx: QuestContext): Experience {
  const xp = totalPoints(ctx.game, ctx.critters, ctx.cards) + questXp(ctx.world);
  const r = rankFor(xp);
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].min) i = k;
  const next = RANKS[i + 1];
  if (!r.next || !next) return { xp, rank: r.id, share: 1 };
  return { xp, rank: r.id, next: { rank: r.next.id, toGo: r.next.pointsToGo }, share: (xp - RANKS[i].min) / (next.min - RANKS[i].min) };
}
