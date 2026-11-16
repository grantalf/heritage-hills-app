/**
 * Character traits, scientific names and sizes for the field guide.
 * Characters are original drawings built from traits (see components/critter-art.tsx).
 */
import type { ArtSpec } from '@/components/critter-art';

import type { CritterGroup } from './game-types';

export type Size = 'tiny' | 'small' | 'big';

const bird = (base: string, belly: string, wingColor: string, extra: Partial<ArtSpec> = {}): ArtSpec => ({ base, belly, wings: 'bird', wingColor, beak: 'short', legs: 0, ...extra });
const frog = (base: string, extra: Partial<ArtSpec> = {}): ArtSpec => ({ base, eyes: 'top', legs: 4, ...extra });
const bug = (base: string, extra: Partial<ArtSpec> = {}): ArtSpec => ({ base, legs: 6, antennae: true, ...extra });

export const critterArt: Record<string, ArtSpec> = {
  raccoon: { base: '#9C9C9C', belly: '#EDEDED', ears: 'round', earInner: '#5A5A5A', mask: '#3A3A3A', tail: 'ringed', tailColor: '#B5B5B5', whiskers: true },
  opossum: { base: '#DCDCDC', belly: '#FFFFFF', ears: 'round', earInner: '#555555', tail: 'thin', tailColor: '#E8A9A9', cheeks: '#F4B6B6', whiskers: true },
  squirrel: { base: '#C8773A', belly: '#F3D2A8', ears: 'round', earInner: '#F3D2A8', tail: 'bushy', tailColor: '#D98B4A' },
  armadillo: { base: '#B9A58E', ears: 'tuft', earInner: '#E8B9A9', shell: 'banded', shellColor: '#9A8670', snout: true, belly: '#DCCBB8', tail: 'thin', tailColor: '#9A8670' },
  deer: { base: '#C99562', belly: '#F5E3C8', ears: 'long', earInner: '#F5E3C8', spots: '#F5E3C8', tail: 'puff' },
  coyote: { base: '#B8A07A', belly: '#EFE4CF', ears: 'pointy', earInner: '#EFE4CF', tail: 'bushy', tailColor: '#A38C68' },
  fox: { base: '#8E9499', belly: '#F2E6D8', ears: 'pointy', earInner: '#C8773A', cheeks: '#C8773A', tail: 'bushy', tailColor: '#7A8085' },
  skunk: { base: '#2E2E2E', stripe: '#FFFFFF', ears: 'round', earInner: '#555555', tail: 'bushy', tailColor: '#F2F2F2' },
  cottontail: { base: '#B79F84', belly: '#F4EADB', ears: 'long', tail: 'puff', whiskers: true },
  bat: { base: '#7A6250', belly: '#A38C78', ears: 'pointy', earInner: '#5A4638', wings: 'bat', wingColor: '#4E3F33', legs: 0 },

  cardinal: bird('#D7262E', '#E8555C', '#B01E25', { crest: '#D7262E', mask: '#2A2A2A', beakColor: '#F28C28' }),
  bluejay: bird('#4A86D9', '#FFFFFF', '#2F5FA8', { crest: '#4A86D9', beakColor: '#3A3A3A' }),
  mockingbird: bird('#A9AEB3', '#ECECEC', '#7E858C', { beakColor: '#444444' }),
  wren: bird('#B5773E', '#F0D9B5', '#8F5A2B', { beakColor: '#6B4B2A', stripe: '#F0D9B5' }),
  grackle: bird('#2B2540', '#3A3358', '#1E1A30', { beakColor: '#222222', eyeColor: '#F5D547' }),
  dove: bird('#C9B8A6', '#E9DFD3', '#FFFFFF', { beakColor: '#555555', cheeks: '#6FA8DC' }),
  hawk: bird('#8A5A3C', '#F0C9A0', '#6E4630', { beak: 'hook', beakColor: '#E0B030', stripes: '#C97B4A' }),
  owl: bird('#9C8468', '#D9C8AE', '#7D6850', { ears: 'tuft', beak: 'hook', beakColor: '#D9A520', eyeColor: '#F5D547' }),
  hummingbird: bird('#3FA36B', '#EDEDED', '#2E7D52', { beak: 'long', beakColor: '#333333', mask: '#3B2A6B' }),
  heron: bird('#7C93A8', '#E6EDF2', '#5F7890', { beak: 'long', beakColor: '#E0B030', crest: '#2F3E55' }),

  anole: { base: '#5DBB4A', belly: '#E86A9A', tail: 'long', legs: 4 },
  spinylizard: { base: '#9B9B8C', belly: '#D5D5C8', spots: '#5E5E52', tail: 'long', legs: 4 },
  gecko: { base: '#EBD5C4', belly: '#F7EBE2', spots: '#C99F86', tail: 'long', legs: 4, eyeColor: '#F5E7A8' },
  ratsnake: { plan: 'serpent', base: '#8C7A4B', bands: ['#8C7A4B', '#5E5232'], belly: '#E8DDB8' },
  slider: { base: '#6E9F58', belly: '#D9E8A8', shell: 'dome', shellColor: '#4E6B3A', cheeks: '#D93A2B', legs: 4 },
  coralsnake: { plan: 'serpent', base: '#D62828', bands: ['#D62828', '#F5D547', '#222222', '#F5D547'] },

  toad: frog('#8A7A55', { spots: '#5E5238', belly: '#D9CFA8' }),
  leopardfrog: frog('#7DA453', { spots: '#3F5A2A', belly: '#EEF2D0' }),
  treefrog: frog('#7ED957', { belly: '#F5F5DC', cheeks: '#FFFFFF' }),
  cricketfrog: frog('#9A8F6B', { spots: '#5F7A3A', stripe: '#6FA83A' }),

  monarch: { base: '#2B2B2B', wings: 'butterfly', wingColor: '#F28C28', wingSpots: '#2B2B2B', antennae: true, legs: 0, eyeColor: '#FFFFFF' },
  fritillary: { base: '#6B4423', wings: 'butterfly', wingColor: '#F06A1A', wingSpots: '#FFFFFF', antennae: true, legs: 0 },
  honeybee: bug('#F2B632', { stripes: '#2B2B2B', wings: 'insect' }),
  bumblebee: bug('#F5D547', { stripes: '#1E1E1E', wings: 'insect', mask: '#1E1E1E' }),
  firefly: bug('#3A3A3A', { stripe: '#C0392B', wings: 'insect', glow: true }),
  cicada: bug('#4E6B3A', { wings: 'double', eyeColor: '#F4A6A6', belly: '#A9C48A' }),
  dragonfly: bug('#3AA6B9', { wings: 'double', tail: 'long', tailColor: '#3AA6B9', antennae: false, eyeColor: '#C9F0F5' }),
  ladybeetle: bug('#D62828', { spots: '#1E1E1E', mask: '#1E1E1E' }),
  mantis: bug('#7BC043', { pincers: true, belly: '#B9E089' }),
  fireant: bug('#A8432A', { stripes: '#7A2E1C' }),

  gardenspider: { base: '#F5D547', stripes: '#2B2B2B', legs: 8, eyes: 'many' },
  jumpingspider: { base: '#3A3A3A', spots: '#FFFFFF', legs: 8, eyes: 'many', eyeColor: '#B9F0E0' },
  tarantula: { base: '#6B4B2A', belly: '#8F6A45', legs: 8, eyes: 'many' },
  scorpion: { base: '#D9B66B', stripes: '#8F6A2B', legs: 8, pincers: true, tail: 'scorpion', tailColor: '#D9B66B' },
  rolypoly: bug('#7C8088', { stripes: '#555A61', belly: '#A9ADB3' }),
  crayfish: bug('#C8553D', { pincers: true, tail: 'thin', tailColor: '#C8553D' }),
  snail: { base: '#E3C9A0', shell: 'spiral', shellColor: '#B5773E', antennae: true, legs: 0 },
};

export const petArt: Record<string, ArtSpec> = {
  'pet-biscuit': { base: '#E0A84E', belly: '#F7E3B5', ears: 'floppy', earInner: '#C98A30', tail: 'bushy' },
  'pet-bigotes': { base: '#9AA0A6', belly: '#FFFFFF', ears: 'pointy', stripes: '#6B7178', tail: 'thin', whiskers: true, eyeColor: '#CDEB8B' },
  'pet-pepper': { base: '#2E2E2E', belly: '#555555', ears: 'pointy', earInner: '#7A5A5A', tail: 'thin' },
  'pet-duke': { base: '#A9713F', belly: '#E8D2B0', ears: 'floppy', earInner: '#7A4E28', tail: 'thin' },
  'pet-mochi': { base: '#232323', ears: 'pointy', earInner: '#5A4A4A', tail: 'thin', whiskers: true, eyeColor: '#F5D547' },
  'pet-olive': { base: '#9DB36A', belly: '#D9E8A8', shell: 'dome', shellColor: '#6B7F3A', legs: 4 },
};

/** Choices a family makes to build their pet's character. */
export const FUR = { golden: '#E0A84E', brown: '#8B5A2B', black: '#2E2E2E', white: '#F2F2F2', gray: '#9AA0A6', orange: '#E8833A' } as const;
export type FurId = keyof typeof FUR;
export type EarId = 'pointy' | 'floppy' | 'round';
export type MarkId = 'none' | 'spots' | 'mask' | 'stripes';
export const FUR_IDS = Object.keys(FUR) as FurId[];
export const EAR_IDS: EarId[] = ['pointy', 'floppy', 'round'];
export const MARK_IDS: MarkId[] = ['none', 'spots', 'mask', 'stripes'];

export function buildPetArt(kind: 'dog' | 'cat' | 'other', fur: FurId, ears: EarId, mark: MarkId): ArtSpec {
  const base = FUR[fur];
  const contrast = fur === 'white' ? '#B9B9B9' : fur === 'black' ? '#6B6B6B' : '#FFFFFF';
  return {
    base,
    belly: fur === 'white' ? '#FFFFFF' : fur === 'black' ? '#4A4A4A' : '#FBEBD0',
    ears,
    tail: kind === 'dog' ? 'bushy' : 'thin',
    whiskers: kind === 'cat',
    spots: mark === 'spots' ? contrast : undefined,
    mask: mark === 'mask' ? (fur === 'black' ? '#6B6B6B' : '#3A3A3A') : undefined,
    stripes: mark === 'stripes' ? (fur === 'black' ? '#6B6B6B' : '#5A4632') : undefined,
  };
}

export const scientificNames: Record<string, string> = {
  raccoon: 'Procyon lotor', opossum: 'Didelphis virginiana', squirrel: 'Sciurus niger', armadillo: 'Dasypus novemcinctus', deer: 'Odocoileus virginianus',
  coyote: 'Canis latrans', fox: 'Urocyon cinereoargenteus', skunk: 'Mephitis mephitis', cottontail: 'Sylvilagus floridanus', bat: 'Tadarida brasiliensis',
  cardinal: 'Cardinalis cardinalis', bluejay: 'Cyanocitta cristata', mockingbird: 'Mimus polyglottos', wren: 'Thryothorus ludovicianus', grackle: 'Quiscalus mexicanus',
  dove: 'Zenaida asiatica', hawk: 'Buteo lineatus', owl: 'Megascops asio', hummingbird: 'Archilochus alexandri', heron: 'Ardea herodias',
  anole: 'Anolis carolinensis', spinylizard: 'Sceloporus olivaceus', gecko: 'Hemidactylus turcicus', ratsnake: 'Pantherophis obsoletus', slider: 'Trachemys scripta elegans', coralsnake: 'Micrurus tener',
  toad: 'Incilius nebulifer', leopardfrog: 'Lithobates berlandieri', treefrog: 'Dryophytes cinereus', cricketfrog: 'Acris blanchardi',
  monarch: 'Danaus plexippus', fritillary: 'Dione vanillae', honeybee: 'Apis mellifera', bumblebee: 'Bombus pensylvanicus', firefly: 'Lampyridae', cicada: 'Cicadidae',
  dragonfly: 'Anax junius', ladybeetle: 'Coccinellidae', mantis: 'Stagmomantis carolina', fireant: 'Solenopsis invicta',
  gardenspider: 'Argiope aurantia', jumpingspider: 'Phidippus audax', tarantula: 'Aphonopelma hentzi', scorpion: 'Centruroides vittatus', rolypoly: 'Armadillidium vulgare', crayfish: 'Procambarus clarkii', snail: 'Cornu aspersum',
};

const BIG = new Set(['deer', 'coyote', 'heron', 'ratsnake']);
const TINY = new Set(['bat', 'wren', 'hummingbird', 'anole', 'gecko']);
export function sizeOf(id: string, group: CritterGroup): Size {
  if (BIG.has(id)) return 'big';
  if (TINY.has(id) || group === 'amphibian' || group === 'insect' || group === 'other') return 'tiny';
  return 'small';
}

/** Opens a page of real photos of the species, taken by naturalists. */
export function realPhotosUrl(id: string): string | undefined {
  const name = scientificNames[id];
  return name ? 'https://www.inaturalist.org/taxa/search?q=' + encodeURIComponent(name) : undefined;
}
