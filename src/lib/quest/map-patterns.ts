/**
 * Sighting patterns shown on the storybook map, safely (FABLE_PLAN.md, D-053).
 *
 * Sightings record a kind of place, never an address or pin (D-046). So the map
 * can only place what happened at a public place on the map: today that is the
 * creek. Everything else (yards, gardens, streets, sky) is shown as a share in
 * a note at the edge of the map, on purpose, never as a spot.
 *
 * The four or five large named regions from the plan are not built: they need
 * board approval (D-067), and sightings do not record a region today.
 *
 * Wildlife only: the counts come from getObservations(), which never includes
 * pets or strays. Nothing is shown below MIN_FOR_PATTERN sightings.
 */
import type { Critter, CritterGroup, Zone } from '../data/game-types';
import { combine, MIN_FOR_PATTERN, pattern, TIMES, ZONES, type Observations, type TimeOfDay } from '../patterns';

/** Kinds of place that are also a public place drawn on the map. */
export const ON_MAP: Partial<Record<Zone, 'creek'>> = { creek: 'creek' };

export type GroupView = {
  group: CritterGroup;
  total: number;
  enough: boolean;
  /** Sightings at public places on the map. */
  atCreek: number;
  /** Everything not on the map, as shares of the total, largest first. */
  around: { zone: Zone; percent: number }[];
  /** Where the group is usually seen at each time of day. */
  dayPath: { time: TimeOfDay; zone?: Zone }[];
  /** The group's most-seen animals, for the tokens. */
  top: string[];
};

export function groupView(all: Observations, critters: readonly Critter[], group: CritterGroup): GroupView {
  const ids = critters.filter((c) => c.group === group).map((c) => c.id);
  const counts = combine(all, ids);
  const found = pattern(counts);
  const enough = counts.total >= MIN_FOR_PATTERN;
  const offMap = ZONES.filter((z) => !ON_MAP[z]);
  return {
    group,
    total: counts.total,
    enough,
    atCreek: enough ? counts.zones.creek : 0,
    around: enough
      ? offMap
          .map((zone) => ({ zone, percent: Math.round((counts.zones[zone] / counts.total) * 100) }))
          .filter((x) => x.percent > 0)
          .sort((a, b) => b.percent - a.percent)
      : [],
    dayPath: enough ? found.dayPath : TIMES.map((time) => ({ time })),
    top: enough
      ? ids
          .filter((id) => (all[id]?.total ?? 0) > 0)
          .sort((a, b) => all[b].total - all[a].total || a.localeCompare(b))
          .slice(0, 3)
      : [],
  };
}
