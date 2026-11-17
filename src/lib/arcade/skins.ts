/**
 * Skin packs (decision D-063). Every hero, enemy, boss, prop and rescued
 * critter is a role. A role's pictures, name and sounds come from a pack.
 * Packs can carry a date range, so a holiday pack swaps in on its own and
 * swaps out again. Adding a pack needs new art and one entry here: no rule
 * or screen code changes. tests/arcade-skins.test.ts checks every pack has
 * every animation its roles need.
 */
import type { L } from '../data/types';

export type SkinRole = 'hero' | 'shambler' | 'lunger' | 'tosser' | 'boss' | 'shot' | 'snack' | 'cage' | 'pedestal' | 'backdrop' | 'squirrel' | 'armadillo' | 'cottontail' | 'dog';
export const SKIN_ROLES: SkinRole[] = ['hero', 'shambler', 'lunger', 'tosser', 'boss', 'shot', 'snack', 'cage', 'pedestal', 'backdrop', 'squirrel', 'armadillo', 'cottontail', 'dog'];

export type Skin = {
  /** Sprite sheet id in the atlas. */
  sheet: string;
  /** If the sheet uses other animation names, map the game's names to them. */
  anims?: Record<string, string>;
  name: L;
  /** Sound names. Playback arrives in block 2; the slots exist now so packs can fill them. */
  sounds?: { bonked?: string; poof?: string; voice?: string };
};

export type SkinPack = {
  id: string;
  name: L;
  /** First and last day it is on, as 'MM-DD'. A range may cross New Year. Leave out for always. */
  from?: string;
  to?: string;
  /** Example packs show how swapping works. They never turn on by date. */
  example?: boolean;
  skins: Partial<Record<SkinRole, Skin>>;
};

/** Animations the rules ask for. A skin must have all of them for its role. */
export const REQUIRED_ANIMS: Record<SkinRole, string[]> = {
  hero: ['idle', 'walk', 'attack1', 'attack2', 'attack3', 'hurt', 'down', 'cheer'],
  shambler: ['idle', 'walk', 'wind', 'attack', 'hurt'],
  lunger: ['idle', 'walk', 'wind', 'attack', 'hurt'],
  tosser: ['idle', 'walk', 'wind', 'attack', 'hurt'],
  boss: ['statue', 'wake', 'walk', 'wind', 'charge', 'stomp', 'stun'],
  shot: ['idle'],
  snack: ['idle'],
  cage: ['idle', 'open'],
  pedestal: ['idle'],
  backdrop: ['far', 'near'],
  squirrel: ['cheer', 'run'],
  armadillo: ['cheer', 'run'],
  cottontail: ['cheer', 'run'],
  dog: ['cheer', 'run'],
};

const critterSkin = (sheet: string, en: string, es: string): Skin => ({ sheet, name: { en, es }, sounds: { voice: 'cheer' } });

export const BASE_PACK: SkinPack = {
  id: 'base',
  name: { en: 'Everyday', es: 'De todos los días' },
  skins: {
    hero: { sheet: 'hero', name: { en: 'Noodle Neighbor', es: 'Vecino del Flotador' }, sounds: { bonked: 'oof' } },
    shambler: { sheet: 'shambler', name: { en: 'Shambler', es: 'Zombi Torpe' }, sounds: { bonked: 'bonk', poof: 'poof' } },
    lunger: { sheet: 'lunger', name: { en: 'Ghoul', es: 'Espectro' }, sounds: { bonked: 'bonk', poof: 'poof' } },
    tosser: { sheet: 'tosser', name: { en: 'Mud Imp', es: 'Duende de Lodo' }, sounds: { bonked: 'bonk', poof: 'poof' } },
    boss: { sheet: 'boss', name: { en: 'The Iron Triceratops', es: 'El Triceratops de Hierro' }, sounds: { bonked: 'clang', voice: 'creak' } },
    shot: { sheet: 'props', anims: { idle: 'shot' }, name: { en: 'Mud ball', es: 'Bola de lodo' } },
    snack: { sheet: 'props', anims: { idle: 'snack' }, name: { en: 'Watermelon', es: 'Sandía' } },
    cage: { sheet: 'props', anims: { idle: 'cage', open: 'cageOpen' }, name: { en: 'Cage', es: 'Jaula' } },
    pedestal: { sheet: 'props', anims: { idle: 'pedestal' }, name: { en: 'Stone base', es: 'Base de piedra' } },
    backdrop: { sheet: 'backdrop', name: { en: 'Dusk street', es: 'Calle al atardecer' } },
    squirrel: critterSkin('squirrel', 'Fox squirrel', 'Ardilla zorro'),
    armadillo: critterSkin('armadillo', 'Armadillo', 'Armadillo'),
    cottontail: critterSkin('cottontail', 'Cottontail', 'Conejo cola de algodón'),
    dog: critterSkin('dog', 'Dog', 'Perro'),
  },
};

/** Shows a holiday swap: one enemy changes its look and name. Real holiday packs come later. */
export const FROST_EXAMPLE: SkinPack = {
  id: 'frostExample',
  name: { en: 'Winter example', es: 'Ejemplo de invierno' },
  from: '12-01',
  to: '01-06',
  example: true,
  skins: {
    shambler: { sheet: 'shamblerFrost', name: { en: 'Frosty Shambler', es: 'Zombi Helado' }, sounds: { bonked: 'bonk', poof: 'jingle' } },
  },
};

export const PACKS: SkinPack[] = [BASE_PACK, FROST_EXAMPLE];

const monthDay = (date: Date): string => `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Is the pack on for this day? Uses the phone's own calendar day. */
export function packIsOn(pack: SkinPack, date: Date): boolean {
  if (!pack.from || !pack.to) return true;
  const day = monthDay(date);
  return pack.from <= pack.to ? day >= pack.from && day <= pack.to : day >= pack.from || day <= pack.to;
}

export type SkinChoice = {
  /** Turn dated packs off, for players who want the everyday look. */
  seasonal?: boolean;
  /** Turn one pack on whatever the date, for example to preview it. */
  force?: string;
};

/** The packs in use on a day, everyday pack first. Later packs win. */
export function activePacks(date: Date, choice: SkinChoice = {}, packs: SkinPack[] = PACKS): SkinPack[] {
  return packs.filter((pack) => {
    if (!pack.from || !pack.to) return true;
    if (choice.force === pack.id) return true;
    if (pack.example || choice.seasonal === false) return false;
    return packIsOn(pack, date);
  });
}

/** One skin for every role. Roles a dated pack does not change keep their everyday skin. */
export function resolveSkins(date: Date, choice: SkinChoice = {}, packs: SkinPack[] = PACKS): Record<SkinRole, Skin> {
  const out: Partial<Record<SkinRole, Skin>> = {};
  for (const pack of activePacks(date, choice, packs)) Object.assign(out, pack.skins);
  for (const role of SKIN_ROLES) if (!out[role]) throw new Error(`No skin for role "${role}". The everyday pack must cover every role.`);
  return out as Record<SkinRole, Skin>;
}

/** The sheet's own name for one of the game's animations. */
export const animName = (skin: Skin, anim: string): string => skin.anims?.[anim] ?? anim;
