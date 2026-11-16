/**
 * Detective cases: follow a trail of witness clues from place to place, fill in
 * a notebook to narrow the suspects, and name the culprit before time runs out.
 * Pure rules so they can be tested.
 */
import type { Size } from './data/game-art';
import type { CritterGroup, PetKind, Zone } from './data/game-types';
import type { L } from './data/types';

export type Witness = { emoji: string; who: L; clue: L };
export type CaseStop = { zone: Zone; witnesses: [Witness, Witness, Witness]; nextOptions?: [Zone, Zone, Zone] };
export type DetectiveCase = {
  id: string;
  kind: 'wild' | 'pet';
  title: L;
  briefing: L;
  culpritId: string;
  hours: number;
  stops: CaseStop[];
  reveal: L;
  action: L;
  sample: boolean;
};

export const COST = { witness: 1, travel: 2, wrongTurn: 4, wrongName: 4 } as const;

export type Notebook = { group?: CritterGroup; awake?: 'day' | 'night'; size?: Size; petKind?: PetKind };

export type CaseState = {
  stop: number;
  hoursLeft: number;
  heard: string[];
  wrongTurns: Zone[];
  wrongNames: string[];
  outcome?: 'solved' | 'cold';
};

export const startCase = (c: DetectiveCase): CaseState => ({ stop: 0, hoursLeft: c.hours, heard: [], wrongTurns: [], wrongNames: [] });

const spend = (state: CaseState, hours: number): CaseState => {
  const hoursLeft = Math.max(0, state.hoursLeft - hours);
  return { ...state, hoursLeft, outcome: state.outcome ?? (hoursLeft === 0 ? 'cold' : undefined) };
};

export const witnessKey = (stop: number, index: number) => `${stop}-${index}`;

export function hearWitness(state: CaseState, index: number): CaseState {
  const key = witnessKey(state.stop, index);
  if (state.outcome || state.heard.includes(key)) return state;
  return spend({ ...state, heard: [...state.heard, key] }, COST.witness);
}

export function isLastStop(c: DetectiveCase, state: CaseState): boolean {
  return state.stop === c.stops.length - 1;
}

export function travel(c: DetectiveCase, state: CaseState, zone: Zone): CaseState {
  if (state.outcome || isLastStop(c, state)) return state;
  if (c.stops[state.stop + 1].zone === zone) return spend({ ...state, stop: state.stop + 1, wrongTurns: [] }, COST.travel);
  if (state.wrongTurns.includes(zone)) return state;
  return spend({ ...state, wrongTurns: [...state.wrongTurns, zone] }, COST.wrongTurn);
}

export function nameCulprit(c: DetectiveCase, state: CaseState, suspectId: string): CaseState {
  if (state.outcome || !isLastStop(c, state)) return state;
  if (suspectId === c.culpritId) return { ...state, outcome: 'solved' };
  if (state.wrongNames.includes(suspectId)) return state;
  return spend({ ...state, wrongNames: [...state.wrongNames, suspectId] }, COST.wrongName);
}

/** Maps time left to the three reward levels used for points (1 is best). */
export function rewardLevel(c: DetectiveCase, state: CaseState): 1 | 2 | 3 {
  const share = state.hoursLeft / c.hours;
  return share >= 0.5 ? 1 : share >= 0.2 ? 2 : 3;
}

export type Suspect = { id: string; group?: CritterGroup; night?: boolean; size?: Size; petKind?: PetKind };

export function matchesNotebook(s: Suspect, n: Notebook): boolean {
  if (n.group && s.group !== n.group) return false;
  if (n.awake && !!s.night !== (n.awake === 'night')) return false;
  if (n.size && s.size !== n.size) return false;
  if (n.petKind && s.petKind !== n.petKind) return false;
  return true;
}

/** "Saturday, 3 p.m." style clock, starting Saturday at 8 in the morning. */
export function clockParts(c: DetectiveCase, state: CaseState): { day: 0 | 1 | 2; hour: number } {
  const used = c.hours - state.hoursLeft;
  const total = 8 + used;
  return { day: Math.min(2, Math.floor(total / 24)) as 0 | 1 | 2, hour: total % 24 };
}
