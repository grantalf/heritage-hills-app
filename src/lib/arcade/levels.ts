/**
 * Levels are plain data. To add one, copy this and change the numbers.
 * Rule D-073: no level is set at the school, at homes or at the garden.
 */
import type { L } from '../data/types';
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

/** A level the player can choose, with the words around it. */
export type LevelInfo = Level & {
  title: L;
  /** One or two short lines shown before the level starts. */
  story: L;
  /** Where on the storybook map this level opens (block 3 links spooky places here). */
  place: L;
};

/**
 * The first real level (block 2): the Frontier Trail, in the scrub forest on
 * the east edge of the storybook map. Four fights, two watermelon snacks, the
 * Iron Triceratops, and three caged wild critters to set free.
 * Not at the school, at homes or at the garden (D-073). Only wild critters are
 * in the cage, never pets.
 */
export const FRONTIER_TRAIL: LevelInfo = {
  id: 'frontier-trail',
  title: { en: 'The Frontier Trail', es: 'El Sendero de la Frontera' },
  story: {
    en: 'Ghouls have locked our wild critters in a cage out in the Frontier Lands. Follow the trail, bonk the monsters, and set the critters free.',
    es: 'Unos espantos encerraron a nuestros animalitos silvestres en una jaula en las Tierras de la Frontera. Siga el sendero, péguele a los monstruos y libere a los animalitos.',
  },
  place: { en: 'The Frontier Lands', es: 'Las Tierras de la Frontera' },
  length: 1060,
  scenery: { mood: 'frontier', backdrop: 'frontier' },
  waves: [
    // 1. Two slow Shamblers: learn the bonk.
    {
      atX: 120,
      spawns: [
        { role: 'shambler', side: 'right', delay: 0, z: 16 },
        { role: 'shambler', side: 'right', delay: 1.6, z: 30 },
      ],
    },
    // 2. A Ghoul joins. Watch for it crouching, then step out of its line.
    {
      atX: 300,
      snack: true,
      spawns: [
        { role: 'shambler', side: 'right', delay: 0, z: 24 },
        { role: 'lunger', side: 'right', delay: 1, z: 10 },
        { role: 'shambler', side: 'left', delay: 2.6, z: 34 },
      ],
    },
    // 3. A Mud Imp throws from far away. Walk up and bonk it.
    {
      atX: 480,
      spawns: [
        { role: 'tosser', side: 'right', delay: 0, z: 12 },
        { role: 'shambler', side: 'left', delay: 0.6, z: 30 },
        { role: 'lunger', side: 'right', delay: 2.4, z: 22 },
      ],
    },
    // 4. Everyone, from both sides.
    {
      atX: 660,
      snack: true,
      spawns: [
        { role: 'lunger', side: 'left', delay: 0, z: 14 },
        { role: 'tosser', side: 'right', delay: 0.4, z: 32 },
        { role: 'shambler', side: 'right', delay: 1.2, z: 20 },
        { role: 'shambler', side: 'left', delay: 3.2, z: 28 },
        { role: 'tosser', side: 'left', delay: 4.4, z: 8 },
      ],
    },
  ],
  boss: { x: 990, z: 14 },
  cage: { x: 1030, z: 4, critters: ['armadillo', 'squirrel', 'cottontail'] },
};

/** Levels players can choose, in order. */
export const LEVELS: LevelInfo[] = [FRONTIER_TRAIL];
export const levelById = (id: string | undefined): LevelInfo => LEVELS.find((l) => l.id === id) ?? FRONTIER_TRAIL;

/** A short street with no boss, used by tests. */
export const SHORT_LEVEL: Level = {
  id: 'short',
  length: 320,
  waves: [{ atX: 100, spawns: [{ role: 'shambler', side: 'right', delay: 0, z: 20 }] }],
  cage: { x: 290, z: 6, critters: ['squirrel'] },
};
