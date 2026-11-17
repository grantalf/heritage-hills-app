/**
 * What the rescue game remembers between plays (block 2): rescue stamps, the
 * best score per level, and the player's settings. Kept on this phone only.
 * Nothing about the player is stored: no name, no account, no location.
 *
 * A rescue stamp is not a field guide sighting (D-072). The field guide still
 * needs a real "I spotted it".
 */
import { critters } from '../data/game-content';
import type { Critter } from '../data/game-types';
import type { LevelInfo } from './levels';
import type { Difficulty, HeroId, World } from './rules';

export const PROGRESS_KEY = 'hh.rescue.v1';

export type Progress = {
  /** "levelId:critterId" for every critter ever rescued on this phone. */
  stamps: string[];
  best: Record<string, number>;
  hero: HeroId;
  difficulty: Difficulty;
  sound: boolean;
};

export const emptyProgress = (): Progress => ({ stamps: [], best: {}, hero: 'bo', difficulty: 'gentle', sound: true });

/** Reads saved progress. Anything broken or unknown falls back to a safe default. */
export function parseProgress(raw: string | null | undefined): Progress {
  const base = emptyProgress();
  if (!raw) return base;
  try {
    const v = JSON.parse(raw) as Partial<Progress>;
    return {
      stamps: Array.isArray(v.stamps) ? v.stamps.filter((s): s is string => typeof s === 'string' && /^[a-z0-9-]+:[a-z0-9-]+$/.test(s)).slice(0, 500) : base.stamps,
      best:
        v.best && typeof v.best === 'object'
          ? Object.fromEntries(Object.entries(v.best).filter(([k, n]) => /^[a-z0-9-]+$/.test(k) && typeof n === 'number' && Number.isFinite(n) && n >= 0))
          : base.best,
      hero: v.hero === 'flor' ? 'flor' : 'bo',
      difficulty: v.difficulty === 'classic' ? 'classic' : 'gentle',
      sound: v.sound !== false,
    };
  } catch {
    return base;
  }
}

export const stampId = (levelId: string, critterId: string) => `${levelId}:${critterId}`;

/** Field guide entries for the critters in a level's cage, with their facts. Skips anything not in the guide. */
export function cageCritters(level: LevelInfo): Critter[] {
  return level.cage.critters.map((id) => critters.find((c) => c.id === id)).filter((c): c is Critter => !!c);
}

export type WinResult = { progress: Progress; newStamps: string[]; newBest: boolean };

/** Records a finished level. Only a won level counts. */
export function recordWin(progress: Progress, level: LevelInfo, world: Pick<World, 'phase' | 'rescued' | 'score'>): WinResult {
  if (world.phase !== 'won') return { progress, newStamps: [], newBest: false };
  const newStamps = world.rescued.map((id) => stampId(level.id, id)).filter((s, i, all) => !progress.stamps.includes(s) && all.indexOf(s) === i);
  const prevBest = progress.best[level.id] ?? 0;
  const newBest = world.score > prevBest;
  return {
    progress: { ...progress, stamps: [...progress.stamps, ...newStamps], best: newBest ? { ...progress.best, [level.id]: world.score } : progress.best },
    newStamps,
    newBest,
  };
}

/** How many of a level's critters have a stamp. */
export function stampsFor(progress: Progress, level: LevelInfo): number {
  return level.cage.critters.filter((id) => progress.stamps.includes(stampId(level.id, id))).length;
}
