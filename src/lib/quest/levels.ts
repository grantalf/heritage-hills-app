/**
 * Which rescue level each rescue place opens. The one link between the map and
 * the side-scrolling game (block 2's /brawler route).
 *
 * D-061: the rescue game may ship inside the app, on the web only, or as a
 * small companion app. If it is not in this app, set RESCUE_IN_APP to false.
 * Rescue places then explain where to play it, and every gentle place and quest
 * still works.
 */
import { LEVELS } from '../arcade/levels';

export const RESCUE_IN_APP = true;

export type LevelLink = { ready: true; href: string } | { ready: false };

/** A level id that exists opens it. Anything else is a place for a future level. */
export function levelLink(levelId: string, levelIds: readonly string[] = LEVELS.map((l) => l.id)): LevelLink {
  if (!RESCUE_IN_APP || !levelIds.includes(levelId)) return { ready: false };
  return { ready: true, href: `/brawler?level=${encodeURIComponent(levelId)}` };
}
