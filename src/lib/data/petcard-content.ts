/**
 * Sample content for pet character cards. Every pet, note and request here is
 * invented. Nothing describes a real pet, family or neighbor.
 */
import type { PawNote, PetCard, PortraitRequest, Regular, StickerCounts } from '../petcards';
import { CONSENT_VERSION } from '../petcards';
import type { L } from './types';

const card = (petId: string, classId: PetCard['classId'], stats: [number, number, number, number, number], favorites: PetCard['favorites'], mannerisms: L, specialMove: L): PetCard => ({
  petId,
  classId,
  stats: { fluff: stats[0], zoomies: stats[1], snack: stats[2], bravery: stats[3], volume: stats[4] },
  favorites,
  mannerisms,
  specialMove,
  photoAudience: 'maker',
  sample: true,
});

export const sampleCards: PetCard[] = [
  card('pet-biscuit', 'yardExplorer', [4, 5, 5, 3, 2], ['walks', 'sticks', 'treats'],
    { en: 'Wags his whole back half. Brings a gift to every guest.', es: 'Mueve toda la parte de atrás. Le lleva un regalo a cada visita.' },
    { en: 'The Parade Trot', es: 'El Trote de Desfile' }),
  card('pet-bigotes', 'windowWatcher', [3, 1, 3, 4, 2], ['sunbeams', 'birdWatching', 'naps'],
    { en: 'Stares without blinking. Chirps at birds through the glass.', es: 'Mira sin parpadear. Les gorjea a los pájaros a través del vidrio.' },
    { en: 'The Serious Stare', es: 'La Mirada Seria' }),
  card('pet-pepper', 'porchSentinel', [2, 4, 3, 2, 5], ['walks', 'cuddles', 'fetch'],
    { en: 'Barks first, then hides behind a leg. Loves a windy day.', es: 'Ladra primero y luego se esconde detrás de una pierna. Le encantan los días de viento.' },
    { en: 'The Big Little Bark', es: 'El Gran Ladridito' }),
  card('pet-duke', 'couchGuardian', [3, 1, 4, 5, 1], ['naps', 'bellyRubs', 'carRides'],
    { en: 'Sighs like a grandpa. Sniffs every mailbox twice.', es: 'Suspira como un abuelo. Huele cada buzón dos veces.' },
    { en: 'The Slow Sniff', es: 'El Olfateo Lento' }),
  card('pet-mochi', 'napWizard', [5, 2, 3, 3, 1], ['boxes', 'sunbeams', 'naps'],
    { en: 'Fits in any box. Watches the garden like a manager.', es: 'Cabe en cualquier caja. Vigila el jardín como una jefa.' },
    { en: 'The Box Vanish', es: 'La Desaparición en Caja' }),
  card('pet-olive', 'yardExplorer', [1, 1, 5, 4, 1], ['sunbeams', 'treats', 'water'],
    { en: 'Takes all afternoon to cross the yard, and looks proud of it.', es: 'Tarda toda la tarde en cruzar el jardín, y se ve orgullosa.' },
    { en: 'The Slow and Steady', es: 'Lento pero Seguro' }),
];

const counts = (values: Partial<StickerCounts>): Partial<StickerCounts> => values;

/** Stickers already given by pretend neighbors, keyed by card. */
export const sampleStickerBase: Record<string, Partial<StickerCounts>> = {
  'pet-biscuit': counts({ goodest: 14, funny: 9, bestHello: 11, snackChamp: 6, speedy: 3 }),
  'pet-bigotes': counts({ funny: 8, softest: 5, brave: 2 }),
  'pet-pepper': counts({ brave: 7, speedy: 6, goodest: 4 }),
  'pet-duke': counts({ gentle: 16, goodest: 12, bestHello: 9 }),
  'pet-mochi': counts({ softest: 10, funny: 7 }),
  'pet-olive': counts({ gentle: 9, snackChamp: 8, speedy: 1 }),
  'reg-oldblue': counts({ brave: 6, gentle: 5, goodest: 2 }),
  'reg-sheriff': counts({ funny: 12, brave: 4 }),
  'reg-shelly': counts({ gentle: 7, softest: 1 }),
};

const note = (id: string, petId: string, daysAgo: number, text: string): PawNote => ({
  id,
  petId,
  text,
  authorId: 'sample-neighbor-' + id,
  at: new Date(Date.UTC(2026, 10, 16 - daysAgo, 15)).toISOString(),
  status: 'shown',
  sample: true,
});

/** Notes that the pretend families already approved. Notes are shown as written. */
export const sampleNotes: PawNote[] = [
  note('n1', 'pet-biscuit', 1, 'Biscuit walked my kids to the bus stop with a stick twice his size. Best start to a Monday.'),
  note('n2', 'pet-biscuit', 4, 'Gracias, Biscuit, por saludar siempre con tanta alegría.'),
  note('n3', 'pet-biscuit', 9, 'He sat so nicely while we asked to pet him. Good boy.'),
  note('n4', 'pet-duke', 2, 'Duke makes our mail carrier smile every single day.'),
  note('n5', 'pet-bigotes', 3, 'We wave at Señor Bigotes on every walk. He has not waved back yet.'),
];

/** Arrive for a family's new card, so the approve step can be tried. Clearly pretend. */
export const sampleIncoming: string[] = [
  'We love seeing {name} on our walks. What a sweet face!',
  '¡Qué linda mascota! {name} siempre nos alegra el día.',
];

const regular = (id: string, critterId: string, name: string, zone: Regular['zone'], classId: Regular['classId'], stats: [number, number, number, number, number], about: L, status: Regular['status'] = 'approved'): Regular => ({
  id,
  critterId,
  name,
  about,
  zone,
  classId,
  stats: { fluff: stats[0], zoomies: stats[1], snack: stats[2], bravery: stats[3], volume: stats[4] },
  status,
  mine: false,
  sample: true,
});

export const sampleRegulars: Regular[] = [
  regular('reg-oldblue', 'heron', 'Old Blue', 'creek', 'porchSentinel', [2, 1, 5, 4, 1],
    { en: 'A tall heron who stands so still you may walk right past.', es: 'Una garza alta que se queda tan quieta que quizá usted pase de largo.' }),
  regular('reg-sheriff', 'mockingbird', 'Sheriff', 'park', 'yardExplorer', [2, 4, 2, 5, 5],
    { en: 'Sings every song in the neighborhood, including a car alarm.', es: 'Canta todas las canciones del vecindario, hasta una alarma de carro.' }),
  regular('reg-shelly', 'slider', 'Shelly', 'creek', 'napWizard', [1, 1, 3, 2, 1],
    { en: 'Suns on the same log most warm afternoons. Slides off if you get close.', es: 'Toma el sol en el mismo tronco casi todas las tardes cálidas. Se desliza al agua si usted se acerca.' }),
  regular('reg-hoot', 'owl', 'Professor Hoot', 'park', 'windowWatcher', [4, 2, 3, 4, 2],
    { en: 'A small owl heard after dark from the big oaks.', es: 'Un búho pequeño que se oye al anochecer desde los robles grandes.' }, 'suggested'),
];

/** One pretend request, so the portrait maker's queue is not empty the first time it is opened. */
export const sampleRequest = (now: Date): PortraitRequest => ({
  id: 'req-sample-pepper',
  petId: 'pet-pepper',
  petName: 'Pepper',
  kind: 'dog',
  requestedAt: new Date(now.getTime() - 3 * 86_400_000).toISOString(),
  status: 'waiting',
  tries: 0,
  consent: { at: new Date(now.getTime() - 3 * 86_400_000).toISOString(), version: CONSENT_VERSION, service: 'sample' },
  redo: false,
  mine: false,
  sample: true,
});
