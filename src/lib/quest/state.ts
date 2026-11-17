/**
 * What the map game remembers: where the hero token stands, which places have
 * been visited, which hosts you have talked to, which quest rewards you have
 * collected, and the sound switch. Kept on this phone only, under WORLD_KEY,
 * and erased by "Delete my information". Nothing about the player is stored.
 */
import { PLACE_IDS, START_PLACE, type PlaceId } from './places';

export const WORLD_KEY = 'hh.world.v1';

export type WorldSave = {
  at: PlaceId;
  visited: PlaceId[];
  /** Places whose host has said hello. */
  met: PlaceId[];
  /** Quests whose reward has been collected. */
  claimed: string[];
  sound: boolean;
  /** The story card on the title screen has been read once. */
  intro: boolean;
};

export const emptyWorld = (): WorldSave => ({ at: START_PLACE, visited: [START_PLACE], met: [], claimed: [], sound: true, intro: false });

const isPlace = (v: unknown): v is PlaceId => typeof v === 'string' && (PLACE_IDS as string[]).includes(v);
const unique = <T>(list: T[]): T[] => [...new Set(list)];

/** Reads saved data. Anything broken or unknown falls back to a safe default. */
export function parseWorld(raw: string | null | undefined): WorldSave {
  const base = emptyWorld();
  if (!raw) return base;
  try {
    const v = JSON.parse(raw) as Partial<Record<keyof WorldSave, unknown>>;
    if (!v || typeof v !== 'object') return base;
    const places = (list: unknown) => (Array.isArray(list) ? unique(list.filter(isPlace)) : []);
    const at = isPlace(v.at) ? v.at : base.at;
    return {
      at,
      visited: unique([...places(v.visited), at]),
      met: places(v.met),
      claimed: Array.isArray(v.claimed) ? unique(v.claimed.filter((q): q is string => typeof q === 'string' && /^[a-zA-Z]{1,30}$/.test(q))).slice(0, 100) : [],
      sound: v.sound !== false,
      intro: v.intro === true,
    };
  } catch {
    return base;
  }
}

export function arrive(save: WorldSave, place: PlaceId): WorldSave {
  return { ...save, at: place, visited: unique([...save.visited, place]) };
}

export function meetHost(save: WorldSave, place: PlaceId): WorldSave {
  return save.met.includes(place) ? save : { ...save, met: [...save.met, place] };
}

export function claim(save: WorldSave, questId: string): WorldSave {
  return save.claimed.includes(questId) ? save : { ...save, claimed: [...save.claimed, questId] };
}
