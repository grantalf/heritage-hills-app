import type { L } from './types';

export type CritterGroup = 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'insect' | 'other';

/** How often a neighbor is likely to see it. A draft guess until local sightings replace it. */
export type Rarity = 'common' | 'sometimes' | 'rare';

/** Broad kinds of places. Never an address, a street or a map pin. */
export type Zone = 'yard' | 'street' | 'park' | 'creek' | 'garden' | 'sky';

export type Critter = {
  id: string;
  group: CritterGroup;
  /** Placeholder picture until the neighborhood has its own art or photos. */
  emoji: string;
  name: L;
  fact: L;
  /** Where and when to look. */
  look: L;
  rarity: Rarity;
  /** Shown as a "look, don't touch" warning. */
  caution?: L;
  night?: boolean;
  pollinator?: boolean;
};

export type Sighting = {
  id: string;
  critterId: string;
  zone: Zone;
  at: string;
  hasPhoto: boolean;
};

export type PetKind = 'dog' | 'cat' | 'other';
export type Pet = {
  id: string;
  kind: PetKind;
  emoji: string;
  /** Pet names are shown as written in every language. */
  name: string;
  about: L;
  loves: L;
  /** How the family wants neighbors to greet the pet. */
  hello: L;
  /** A general hint, never an address. */
  where: L;
  stories: L[];
  mine: boolean;
  sample: boolean;
};

export type MysteryOption = { id: string; emoji: string; label: L };
export type Mystery = {
  id: string;
  kind: 'wild' | 'pet';
  title: L;
  intro: L;
  clues: [L, L, L];
  options: MysteryOption[];
  answerId: string;
  reveal: L;
  action: L;
  sample: boolean;
};

export type BingoSquare = { id: string; emoji: string; text: L };
export type BingoCard = { id: string; title: L; squares: BingoSquare[] };

export type BadgeId =
  | 'firstFind'
  | 'sharpEyes'
  | 'allKinds'
  | 'nightOwl'
  | 'pollinatorFriend'
  | 'creekKeeper'
  | 'petPal'
  | 'caseClosed'
  | 'bingo';

export type MysteryResult = { solved: boolean; cluesUsed: number };

/** Everything the game remembers about one player. Stays on the device in the first draft. */
export type GameState = {
  sightings: Sighting[];
  petsMet: string[];
  mysteries: Record<string, MysteryResult>;
  bingo: Record<string, string[]>;
};
