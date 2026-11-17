/**
 * Points of interest on the storybook map, and travel between them (D-070).
 *
 * Tap a place and the hero token travels there along the roads on its own.
 * Gentle places open Critter Club activities. Rescue places open a
 * side-scrolling rescue level. Landmarks only show a short note.
 *
 * Rules (STYLE_BRIEF.md, D-073):
 *  - No fights at the school, at homes or at the garden.
 *  - Real places are public ones only. Made-up places sit at the edges.
 *  - The hero is a made-up traveler. The game never uses the phone's location.
 */
import type { Zone } from '../data/game-types';
import { nearestNode, pathLength, roadGraph, shortestPath, toWorld, type Pt } from './map';

export type PlaceKind = 'gentle' | 'rescue' | 'landmark';

/** Critters who host a place: each is a field guide animal. */
export type HostId = 'armadillo' | 'heron' | 'bumblebee' | 'mockingbird' | 'owl' | 'cottontail';

/** Things a place can open. Each one also has a plain menu entry somewhere else. */
export type Activity =
  | { kind: 'spot'; zone: Zone }
  | { kind: 'cases' }
  | { kind: 'bingo' }
  | { kind: 'tally' }
  | { kind: 'patterns' }
  | { kind: 'guide' }
  | { kind: 'stamps' }
  | { kind: 'rescue'; level: string };

export type PlaceId = 'creek' | 'garden' | 'bridge' | 'statue' | 'lookout' | 'signpost' | 'school' | 'frontier' | 'shadowlands';

export type Place = {
  id: PlaceId;
  kind: PlaceKind;
  /** Where it sits, in sketch pixels like the roads. */
  at: Pt;
  /** A real public place, or a storybook feature made up for the map. */
  real: boolean;
  /** The critter who lives here and hands out quests (a field guide id). */
  host?: HostId;
  activities: Activity[];
};

export const PLACES: Place[] = [
  { id: 'statue', kind: 'gentle', real: true, at: [955, 1080], host: 'armadillo', activities: [{ kind: 'stamps' }] },
  { id: 'creek', kind: 'gentle', real: true, at: [600, 250], host: 'heron', activities: [{ kind: 'spot', zone: 'creek' }, { kind: 'patterns' }] },
  { id: 'garden', kind: 'gentle', real: true, at: [1050, 304], host: 'bumblebee', activities: [{ kind: 'spot', zone: 'garden' }, { kind: 'bingo' }] },
  { id: 'bridge', kind: 'gentle', real: true, at: [1172, 228], host: 'mockingbird', activities: [{ kind: 'cases' }, { kind: 'tally' }, { kind: 'spot', zone: 'sky' }] },
  { id: 'lookout', kind: 'gentle', real: false, at: [150, 105], host: 'owl', activities: [{ kind: 'patterns' }, { kind: 'guide' }] },
  { id: 'signpost', kind: 'gentle', real: false, at: [548, 1960], host: 'cottontail', activities: [{ kind: 'spot', zone: 'street' }, { kind: 'tally' }] },
  { id: 'school', kind: 'landmark', real: true, at: [1450, 1410], activities: [] },
  { id: 'frontier', kind: 'rescue', real: false, at: [1640, 990], activities: [{ kind: 'rescue', level: 'frontier-trail' }] },
  { id: 'shadowlands', kind: 'rescue', real: false, at: [-90, 980], activities: [{ kind: 'rescue', level: 'roaring-wall' }] },
];

export const PLACE_IDS = PLACES.map((p) => p.id);
export const START_PLACE: PlaceId = 'statue';
export const placeById = (id: string | undefined): Place | undefined => PLACES.find((p) => p.id === id);

/** Where a place is on the map, in map units. */
export const placePoint = (place: Place): Pt => toWorld(place.at);

/** The road point a place is reached from. */
export function placeNode(place: Place): number {
  // The school is reached from Furness Drive, never through a yard.
  return nearestNode(placePoint(place));
}

/** The route the hero token takes from one place to another, in map units. */
export function routeBetween(from: Place, to: Place): Pt[] {
  if (from.id === to.id) return [placePoint(from)];
  const { nodes } = roadGraph();
  const path = shortestPath(placeNode(from), placeNode(to));
  if (path.length === 0) return [placePoint(from), placePoint(to)];
  return [placePoint(from), ...path.map((i) => nodes[i]), placePoint(to)];
}

/** Travel takes a moment, never long: short trips are quick, long trips are capped. */
export function travelSeconds(route: readonly Pt[]): number {
  const len = pathLength(route);
  return Math.min(2.4, Math.max(0.5, len / 420));
}
