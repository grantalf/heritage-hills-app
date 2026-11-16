/**
 * Patterns in wildlife sightings: where (kind of place), when (time of day) and
 * which months. Built from counts only.
 *
 * Honest limits, shown to players too:
 *  - These are what neighbors happened to notice, not a scientific survey.
 *    Places and hours where more people are outside get more sightings.
 *  - Places are kinds of place, never addresses. Pets are never included.
 */
import type { Zone } from './data/game-types';

export const ZONES: Zone[] = ['yard', 'garden', 'street', 'park', 'creek', 'sky'];
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export const TIMES: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night'];

export type Counts = {
  total: number;
  zones: Record<Zone, number>;
  times: Record<TimeOfDay, number>;
  months: number[];
  /** Sightings for each time of day, by kind of place. */
  joint: Record<TimeOfDay, Record<Zone, number>>;
};
export type Observations = Record<string, Counts>;

const noZones = (): Record<Zone, number> => ({ yard: 0, garden: 0, street: 0, park: 0, creek: 0, sky: 0 });
export const emptyCounts = (): Counts => ({
  total: 0,
  zones: noZones(),
  times: { dawn: 0, day: 0, dusk: 0, night: 0 },
  months: Array.from({ length: 12 }, () => 0),
  joint: { dawn: noZones(), day: noZones(), dusk: noZones(), night: noZones() },
});
export const emptyObservations = (): Observations => ({});

export function timeOfDay(date: Date): TimeOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

export function addObservation(all: Observations, critterId: string, zone: Zone, at: Date): Observations {
  const prev = all[critterId] ?? emptyCounts();
  const time = timeOfDay(at);
  const months = [...prev.months];
  months[at.getMonth()] += 1;
  return {
    ...all,
    [critterId]: {
      total: prev.total + 1,
      zones: { ...prev.zones, [zone]: prev.zones[zone] + 1 },
      times: { ...prev.times, [time]: prev.times[time] + 1 },
      months,
      joint: { ...prev.joint, [time]: { ...prev.joint[time], [zone]: prev.joint[time][zone] + 1 } },
    },
  };
}

export function combine(all: Observations, ids?: readonly string[]): Counts {
  const out = emptyCounts();
  for (const [id, c] of Object.entries(all)) {
    if (ids && !ids.includes(id)) continue;
    out.total += c.total;
    for (const z of ZONES) out.zones[z] += c.zones[z];
    for (const t of TIMES) {
      out.times[t] += c.times[t];
      for (const z of ZONES) out.joint[t][z] += c.joint[t][z];
    }
    c.months.forEach((n, i) => (out.months[i] += n));
  }
  return out;
}

/** Splits a whole number across weights so the parts add up exactly. */
export function share(total: number, weights: readonly number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0 || total === 0) return weights.map(() => 0);
  const exact = weights.map((w) => (total * w) / sum);
  const parts = exact.map(Math.floor);
  let left = total - parts.reduce((a, b) => a + b, 0);
  const order = exact.map((x, i) => ({ i, frac: x - Math.floor(x) })).sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; left > 0; k++, left--) parts[order[k % order.length].i] += 1;
  return parts;
}

const SEASONS: Record<string, number[]> = {
  all: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  warm: [0, 0, 2, 3, 4, 4, 4, 4, 3, 2, 1, 0],
  summer: [0, 0, 0, 1, 3, 5, 5, 4, 2, 0, 0, 0],
  migration: [0, 0, 2, 3, 1, 0, 0, 0, 2, 5, 2, 0],
};

export type Habit = { zones: number[]; times: number[]; season: string; byTime?: Partial<Record<TimeOfDay, number[]>> };

/** Builds invented starting data from totals and habit weights. Labeled "Sample" on screen. */
export function sampleObservations(totals: Readonly<Record<string, number>>, habits: Readonly<Record<string, Habit>>): Observations {
  const out: Observations = {};
  for (const [id, total] of Object.entries(totals)) {
    const habit = habits[id];
    if (!habit) continue;
    const counts = emptyCounts();
    counts.total = total;
    const perTime = share(total, habit.times);
    TIMES.forEach((time, i) => {
      counts.times[time] = perTime[i];
      const perZone = share(perTime[i], habit.byTime?.[time] ?? habit.zones);
      ZONES.forEach((zone, j) => {
        counts.joint[time][zone] = perZone[j];
        counts.zones[zone] += perZone[j];
      });
    });
    counts.months = share(total, SEASONS[habit.season] ?? SEASONS.all);
    out[id] = counts;
  }
  return out;
}

/** Fewer sightings than this and we say "not enough yet" instead of guessing. */
export const MIN_FOR_PATTERN = 10;

/** The busiest month must be at least this many times an even month before we call it a season. */
const SEASON_FACTOR = 1.6;

export type Pattern = {
  enough: boolean;
  topZone?: { zone: Zone; percent: number };
  topTime?: { time: TimeOfDay; percent: number };
  peakMonths: number[];
  /** Where it is seen most at each time of day. A hint at how it moves through the day. */
  dayPath: { time: TimeOfDay; zone?: Zone }[];
  /** True when the usual place changes during the day. */
  moves: boolean;
};

const top = <K extends string>(record: Record<K, number>, keys: readonly K[]): K => keys.reduce((best, k) => (record[k] > record[best] ? k : best), keys[0]);

export function pattern(counts: Counts): Pattern {
  if (counts.total < MIN_FOR_PATTERN) return { enough: false, peakMonths: [], dayPath: [], moves: false };
  const zone = top(counts.zones, ZONES);
  const time = top(counts.times, TIMES);
  const maxMonth = Math.max(...counts.months);
  const floor = Math.max(2, counts.total * 0.08);
  const dayPath = TIMES.map((t) => ({ time: t, zone: counts.times[t] >= floor ? top(counts.joint[t], ZONES) : undefined }));
  return {
    enough: true,
    topZone: { zone, percent: Math.round((counts.zones[zone] / counts.total) * 100) },
    topTime: { time, percent: Math.round((counts.times[time] / counts.total) * 100) },
    // Only name a season when the busiest month clearly stands out from an even spread.
    peakMonths: maxMonth >= SEASON_FACTOR * (counts.total / 12) ? counts.months.map((n, i) => (n >= maxMonth * 0.8 ? i : -1)).filter((i) => i >= 0) : [],
    dayPath,
    moves: new Set(dayPath.map((d) => d.zone).filter(Boolean)).size > 1,
  };
}
