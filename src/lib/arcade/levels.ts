/**
 * Levels are plain data. To add one, copy this and change the numbers.
 * Rule D-073: no level is set at the school, at homes or at the garden.
 */
import type { Level } from './rules';

/** Block 1 test street: three waves, the statue, and a rescue. Stand-in for the real first level. */
export const WORKSHOP_LEVEL: Level = {
  id: 'workshop',
  length: 660,
  waves: [
    {
      atX: 110,
      spawns: [
        { role: 'shambler', side: 'right', delay: 0, z: 14 },
        { role: 'shambler', side: 'right', delay: 1.4, z: 32 },
      ],
    },
    {
      atX: 250,
      snack: true,
      spawns: [
        { role: 'shambler', side: 'right', delay: 0, z: 22 },
        { role: 'lunger', side: 'right', delay: 0.8, z: 8 },
        { role: 'shambler', side: 'left', delay: 2.4, z: 34 },
      ],
    },
    {
      atX: 390,
      snack: true,
      spawns: [
        { role: 'tosser', side: 'right', delay: 0, z: 10 },
        { role: 'shambler', side: 'right', delay: 0.6, z: 30 },
        { role: 'lunger', side: 'left', delay: 2, z: 20 },
        { role: 'shambler', side: 'right', delay: 3.4, z: 16 },
      ],
    },
  ],
  boss: { x: 600, z: 14 },
  cage: { x: 634, z: 4, critters: ['squirrel', 'armadillo', 'cottontail', 'dog'] },
};

/** A short street with no boss, used by tests. */
export const SHORT_LEVEL: Level = {
  id: 'short',
  length: 320,
  waves: [{ atX: 100, spawns: [{ role: 'shambler', side: 'right', delay: 0, z: 20 }] }],
  cage: { x: 290, z: 6, critters: ['squirrel'] },
};
