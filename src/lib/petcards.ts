/**
 * Pet character cards, stickers, paw notes and portrait requests (docs/PETCARDS.md).
 * Pure rules so they can be tested here and enforced again by the real backend.
 *
 * Design choices:
 *  - A pet has a card only if its own family made it. Wild "regulars" are
 *    suggested by neighbors and approved by a moderator.
 *  - Stickers are preset, so they need no moderating. Paw notes show only after
 *    the pet's family approves them. No star ratings and no ranking of pets.
 *  - Portraits are made by a person (the portrait maker), by request. The app
 *    itself never calls an image service.
 */
import type { Critter, PetKind, Zone } from './data/game-types';
import type { L } from './data/types';

// ---------- Card ----------

export const STAT_IDS = ['fluff', 'zoomies', 'snack', 'bravery', 'volume'] as const;
export type StatId = (typeof STAT_IDS)[number];
export type Stats = Record<StatId, number>;
export const STAT_MIN = 1;
export const STAT_MAX = 5;

export const CLASS_IDS = ['couchGuardian', 'squirrelScout', 'napWizard', 'porchSentinel', 'snackBandit', 'windowWatcher', 'yardExplorer', 'lapChampion'] as const;
export type ClassId = (typeof CLASS_IDS)[number];

export const FAVORITE_IDS = ['naps', 'walks', 'treats', 'boxes', 'sunbeams', 'fetch', 'bellyRubs', 'carRides', 'birdWatching', 'sticks', 'water', 'cuddles'] as const;
export type FavoriteId = (typeof FAVORITE_IDS)[number];
export const MAX_FAVORITES = 3;

/** Who may see the pet's real photo. The default is the smallest group. */
export type PhotoAudience = 'maker' | 'neighbors';
export const DEFAULT_PHOTO_AUDIENCE: PhotoAudience = 'maker';

export type PetCard = {
  petId: string;
  classId: ClassId;
  stats: Stats;
  favorites: FavoriteId[];
  /** The family's own words, shown as written. */
  mannerisms: L;
  specialMove: L;
  photoAudience: PhotoAudience;
  sample: boolean;
};

export const LIMITS = { mannerisms: 120, specialMove: 40, note: 140, noteMin: 3, regularName: 24, regularAbout: 120 } as const;

export function clampStat(value: number): number {
  if (!Number.isFinite(value)) return STAT_MIN;
  return Math.min(STAT_MAX, Math.max(STAT_MIN, Math.round(value)));
}

export function cleanStats(stats: Partial<Stats> | undefined): Stats {
  const out = {} as Stats;
  for (const id of STAT_IDS) out[id] = clampStat(stats?.[id] ?? 3);
  return out;
}

const DEFAULT_CLASS: Record<PetKind, ClassId> = { dog: 'yardExplorer', cat: 'windowWatcher', other: 'napWizard' };

/** The card a pet has before its family fills one in. */
export function defaultCard(petId: string, kind: PetKind): PetCard {
  return {
    petId,
    classId: DEFAULT_CLASS[kind],
    stats: cleanStats(undefined),
    favorites: [],
    mannerisms: { en: '', es: '' },
    specialMove: { en: '', es: '' },
    photoAudience: DEFAULT_PHOTO_AUDIENCE,
    sample: false,
  };
}

export function toggleFavorite(current: readonly FavoriteId[], id: FavoriteId): FavoriteId[] {
  if (current.includes(id)) return current.filter((f) => f !== id);
  if (current.length >= MAX_FAVORITES) return [...current];
  return [...current, id];
}

// ---------- Words written by people ----------

export type TextProblem = 'tooShort' | 'tooLong' | 'link' | 'email' | 'phone' | 'address';

const TLDS = 'com|org|net|io|co|me|ly|app|info|us|xyz|gg|photos|pics|pet|pets|tv|biz|edu|gov|link|site|online|store|page|dev|mx|social|club';
const LINK = new RegExp(`(https?:\\/\\/|www\\.|\\b[a-z0-9-]+\\.(${TLDS})\\b|\\b\\d{1,3}(\\.\\d{1,3}){3}\\b)`, 'i');
const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
/** A social media name such as @biscuit_the_dog. Treated like a link. */
const HANDLE = /(^|[\s(])@[a-z0-9_.]{3,}/i;
/** Seven or more digits, allowing spaces, dots, dashes and brackets between them. */
const PHONE = /(\d[\s().-]*){7,}/;
/** A number followed by a street word, in English or Spanish, or the word first as Spanish writes it. */
const STREET_WORDS = 'drive|dr|lane|ln|street|st|trail|trl|court|ct|cove|cv|circle|cir|path|road|rd|avenue|ave|boulevard|blvd|way|calle|avenida|camino';
/**
 * The neighborhood's own streets (from the storybook map, src/lib/quest/map.ts, plus the southern edge).
 * `alone: true` names are rare words, so they are caught even with no number or street word.
 */
export const STREET_NAMES: { name: string; alone: boolean }[] = [
  { name: 'hermitage', alone: true }, { name: 'furness', alone: true }, { name: 'loralinda', alone: true }, { name: 'durham', alone: true },
  { name: 'danville', alone: true }, { name: 'weeping willow', alone: false }, { name: 'wisteria', alone: false }, { name: 'bridgetown', alone: true },
  { name: 'brettonwoods', alone: true }, { name: 'chantilly', alone: true }, { name: 'shenandoah', alone: true }, { name: 'pepperell', alone: true },
  { name: 'potomac', alone: true }, { name: 'grayledge', alone: true }, { name: 'valley forge', alone: false }, { name: 'tecumseh', alone: true },
  { name: 'rutherford', alone: true },
];
const NAMES = STREET_NAMES.map((n) => n.name.replace(' ', '\\s+')).join('|');
const ALONE = STREET_NAMES.filter((n) => n.alone).map((n) => n.name).join('|');
const ADDRESS = new RegExp(
  [
    `\\b\\d{1,6}\\s+([a-záéíóúñ]+\\s+){0,2}(${STREET_WORDS})\\b`,
    `\\b(calle|avenida|camino)\\s+([a-záéíóúñ]+\\s+){0,2}\\d{1,6}\\b`,
    `\\b\\d{1,6}\\s+(${NAMES})\\b`,
    `\\b(${NAMES})\\s+((n[uú]mero|no\\.?|#)\\s*)?\\d{1,6}\\b`,
    `\\b(${NAMES})\\s+(${STREET_WORDS})\\b`,
    `\\b(${ALONE})\\b`,
  ].join('|'),
  'i',
);

const ZERO_WIDTH = /[­​-‏⁠﻿]/g;
/** Latin letters that other alphabets draw the same way, used to hide links. */
const LOOK_ALIKES: Record<string, string> = { а: 'a', е: 'e', о: 'o', р: 'p', с: 'c', у: 'y', х: 'x', і: 'i', ј: 'j', ѕ: 's', ԁ: 'd', ο: 'o', α: 'a', ρ: 'p' };
const DIGIT_WORDS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  cero: '0', uno: '1', dos: '2', tres: '3', cuatro: '4', cinco: '5', seis: '6', siete: '7', ocho: '8', nueve: '9',
};
const DIGIT_WORD = new RegExp(`\\b(${Object.keys(DIGIT_WORDS).join('|')})\\b`, 'gi');

/**
 * Undoes the usual tricks for slipping contact details past a check: odd
 * Unicode, invisible characters, look-alike letters, other digit sets,
 * numbers written as words, "at" and "dot" spelled out, and spaces around
 * @ and dots (block 5 review, S-04). Used only for checking; the person's
 * words are saved as they wrote them.
 */
export function normalizeForCheck(text: string): string {
  let v = text.normalize('NFKC').replace(ZERO_WIDTH, '');
  v = v.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
  v = [...v].map((ch) => LOOK_ALIKES[ch] ?? ch).join('');
  v = v.replace(DIGIT_WORD, (w) => DIGIT_WORDS[w.toLowerCase()]);
  // The letter O between digits, as in 512-555-O147.
  v = v.replace(/(?<=\d[\s().-]*)[oO](?=[\s().-]*\d)/g, '0');
  v = v.replace(/\s*[([{]\s*(at|arroba)\s*[)\]}]\s*/gi, '@').replace(/\s*[([{]\s*(dot|punto)\s*[)\]}]\s*/gi, '.');
  v = v.replace(/\s+(at|arroba)\s+(?=[a-z0-9-]+\s*(\.|\bdot\b|\bpunto\b))/gi, '@');
  v = v.replace(new RegExp(`\\s+(dot|punto)\\s+(?=(${TLDS})\\b)`, 'gi'), '.');
  v = v.replace(/\s*@\s*(?=[a-z0-9])/gi, (m) => (m.trimStart() === m ? m : '@'));
  v = v.replace(new RegExp(`\\s*\\.\\s*(?=(${TLDS})\\b)`, 'gi'), '.');
  return v;
}

/**
 * Checks words before they can be shown to neighbors. It keeps out the things
 * that put people or animals at risk: links and social media names, ways to
 * contact someone, and anything that looks like an address or names one of
 * our streets. Kindness is checked by people: the pet's family approves
 * notes, and anyone can report. The real server must run this check again.
 */
export function checkText(text: string, max: number, min = 0): TextProblem[] {
  const value = text.trim();
  const v = normalizeForCheck(value);
  const problems: TextProblem[] = [];
  if (value.length < min) problems.push('tooShort');
  if (value.length > max) problems.push('tooLong');
  if (EMAIL.test(v)) problems.push('email');
  else if (LINK.test(v) || HANDLE.test(value.normalize('NFKC').replace(ZERO_WIDTH, ''))) problems.push('link');
  if (PHONE.test(v)) problems.push('phone');
  else if (ADDRESS.test(v)) problems.push('address');
  return problems;
}

/** Words a family types when adding a pet (block 5 review, S-02). */
export const PET_TEXT = { name: 30, about: 120, hello: 120 } as const;
export function petTextProblems(input: { name: string; about: string; hello: string }): TextProblem[] {
  return [...new Set([...checkText(input.name, PET_TEXT.name), ...checkText(input.about, PET_TEXT.about), ...checkText(input.hello, PET_TEXT.hello)])];
}
/** Words a neighbor types when adding a share shelf item. */
export const SHARE_TEXT = { title: 60, condition: 60 } as const;
export function shareTextProblems(input: { title: string; condition: string }): TextProblem[] {
  return [...new Set([...checkText(input.title, SHARE_TEXT.title), ...checkText(input.condition, SHARE_TEXT.condition)])];
}

export const checkNote = (text: string) => checkText(text, LIMITS.note, LIMITS.noteMin);

// ---------- Stickers ----------

export const STICKER_IDS = ['goodest', 'softest', 'funny', 'brave', 'gentle', 'speedy', 'bestHello', 'snackChamp'] as const;
export type StickerId = (typeof STICKER_IDS)[number];
export type StickerCounts = Record<StickerId, number>;
export const TOP_STICKERS = 3;

export function stickerCounts(base: Partial<StickerCounts> | undefined, mine: readonly StickerId[]): StickerCounts {
  const out = {} as StickerCounts;
  for (const id of STICKER_IDS) out[id] = Math.max(0, base?.[id] ?? 0) + (mine.includes(id) ? 1 : 0);
  return out;
}

/** One of each sticker per person per card. Tapping again takes it back. */
export function toggleSticker(mine: readonly StickerId[], id: StickerId): StickerId[] {
  return mine.includes(id) ? mine.filter((s) => s !== id) : [...mine, id];
}

export function topStickers(counts: StickerCounts, limit = TOP_STICKERS): { id: StickerId; count: number }[] {
  return STICKER_IDS.map((id, order) => ({ id, count: counts[id], order }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count || a.order - b.order)
    .slice(0, limit)
    .map(({ id, count }) => ({ id, count }));
}

// ---------- Paw notes ----------

export type NoteStatus = 'waiting' | 'shown' | 'declined';
export type PawNote = {
  id: string;
  petId: string;
  text: string;
  /** Kept for moderation only. Never shown to neighbors. */
  authorId: string;
  at: string;
  status: NoteStatus;
  sample: boolean;
};

export const NOTES_ON_CARD = 2;
export const NOTES_PER_DAY = 3;

export function shownNotes(notes: readonly PawNote[], petId: string): PawNote[] {
  return notes.filter((n) => n.petId === petId && n.status === 'shown').sort((a, b) => b.at.localeCompare(a.at));
}

export function waitingNotes(notes: readonly PawNote[], petId: string): PawNote[] {
  return notes.filter((n) => n.petId === petId && n.status === 'waiting').sort((a, b) => a.at.localeCompare(b.at));
}

export type NoteProblem = TextProblem | 'ownPet' | 'alreadyWaiting' | 'dailyLimit';

/** Why a note cannot be sent. An empty list means it can. */
export function noteProblems(input: {
  text: string;
  petId: string;
  authorId: string;
  isOwnPet: boolean;
  notes: readonly PawNote[];
  now: Date;
}): NoteProblem[] {
  const problems: NoteProblem[] = [...checkNote(input.text)];
  if (input.isOwnPet) problems.push('ownPet');
  const mine = input.notes.filter((n) => n.authorId === input.authorId);
  if (mine.some((n) => n.petId === input.petId && n.status === 'waiting')) problems.push('alreadyWaiting');
  const dayAgo = input.now.getTime() - 24 * 3_600_000;
  if (mine.filter((n) => new Date(n.at).getTime() > dayAgo).length >= NOTES_PER_DAY) problems.push('dailyLimit');
  return problems;
}

/**
 * A family can stop notes from a sender. The sender is not told: their later
 * notes are accepted and quietly never delivered, so blocking cannot be used
 * to start an argument.
 */
export function isDelivered(authorId: string, petId: string, blocks: readonly { petId: string; authorId: string }[]): boolean {
  return !blocks.some((b) => b.petId === petId && b.authorId === authorId);
}

/** Only the pet's family decides, and only on notes that are still waiting. */
export function decideNote(note: PawNote, show: boolean, byFamily: boolean): PawNote | undefined {
  if (!byFamily || note.status !== 'waiting') return undefined;
  return { ...note, status: show ? 'shown' : 'declined' };
}

// ---------- Who sees the real photo ----------

export type PhotoViewer = 'visitor' | 'neighbor' | 'family' | 'maker';

/** Visitors never see a real photo. The portrait maker sees it only while a request is open. */
export function canSeePhoto(audience: PhotoAudience, viewer: PhotoViewer, requestOpen = false): boolean {
  if (viewer === 'family') return true;
  if (viewer === 'maker') return requestOpen || audience === 'neighbors';
  if (viewer === 'neighbor') return audience === 'neighbors';
  return false;
}

// ---------- Album order ----------

/**
 * Cards are shown in name order, starting from a different card each day, so
 * no pet is always first. Sticker counts never change the order: the album is
 * not a popularity contest (decision D-049).
 */
export function albumOrder<T extends { id: string; name: string }>(items: readonly T[], day: number): T[] {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  if (sorted.length === 0) return sorted;
  const start = ((day % sorted.length) + sorted.length) % sorted.length;
  return [...sorted.slice(start), ...sorted.slice(0, start)];
}

export const dayNumber = (now: Date) => Math.floor(now.getTime() / 86_400_000);

// ---------- Neighborhood regulars (wild animals many neighbors know) ----------

/** Regulars are placed only at shared public kinds of place. Never a yard or a street. */
export const PUBLIC_ZONES = ['creek', 'park', 'sky'] as const satisfies readonly Zone[];
export type PublicZone = (typeof PUBLIC_ZONES)[number];

export type RegularStatus = 'suggested' | 'approved' | 'declined';
export type Regular = {
  id: string;
  /** The kind of animal, from the field guide. Its cartoon comes from there. */
  critterId: string;
  name: string;
  about: L;
  zone: PublicZone;
  classId: ClassId;
  stats: Stats;
  status: RegularStatus;
  mine: boolean;
  sample: boolean;
};

export type RegularProblem = 'notWildlife' | 'risky' | 'privatePlace' | 'nameTooShort' | 'aboutTooShort' | TextProblem;

/**
 * A regular must be a wild animal from the field guide. Animals that can hurt
 * are left out, so no one goes looking for them. Cats and dogs on their own
 * are never regulars: showing where a stray is can get it hurt (D-048).
 */
export function regularProblems(input: { critter: Critter | undefined; name: string; about: string; zone: string }): RegularProblem[] {
  const problems: RegularProblem[] = [];
  if (!input.critter) problems.push('notWildlife');
  else if (input.critter.caution) problems.push('risky');
  if (!(PUBLIC_ZONES as readonly string[]).includes(input.zone)) problems.push('privatePlace');
  if (input.name.trim().length < 2) problems.push('nameTooShort');
  if (input.about.trim().length < 5) problems.push('aboutTooShort');
  for (const p of [...checkText(input.name, LIMITS.regularName), ...checkText(input.about, LIMITS.regularAbout)]) {
    if (!problems.includes(p)) problems.push(p);
  }
  return problems;
}

export function decideRegular(regular: Regular, approve: boolean, byModerator: boolean): Regular | undefined {
  if (!byModerator || regular.status !== 'suggested') return undefined;
  return { ...regular, status: approve ? 'approved' : 'declined' };
}

/** Everyone sees approved regulars. A person also sees their own suggestions. Moderators see all that are waiting. */
export function visibleRegulars(regulars: readonly Regular[], isModerator: boolean): Regular[] {
  return regulars.filter((r) => r.status === 'approved' || (r.status === 'suggested' && (r.mine || isModerator)));
}

// ---------- Portrait requests ----------

/**
 * The outside image service. Until the board approves one (decision D-059) and
 * its terms are checked, no real request can be made: the app only shows how
 * the steps will work, with sample data.
 */
export type PortraitService = { approved: boolean; name?: string; termsCheckedOn?: string };
export const PORTRAIT_SERVICE: PortraitService = { approved: false };

/** The words of the agreement screen. Change the version whenever the meaning changes. */
export const CONSENT_VERSION = '2026-11-16.1';

export const PORTRAIT = {
  triesPerRequest: 4,
  /** Estimate checked 2026-11-16. Prices change; re-check when the account is opened. */
  centsPerTry: 4,
  yearlyCapCents: 5000,
  /** A hard monthly limit on the service account is the real guard. This is the second one. */
  monthlyCapCents: 400,
  openPerHousehold: 2,
  redosPerPet: 1,
  /** A photo waits in the queue this long at most. Then the request ends and the photo is deleted. */
  keepPhotoDays: 30,
  /** Requests are done together once a week. 0 is Sunday. */
  batchWeekday: 0,
} as const;

export const PHOTO_CHECKS = ['animalOnly', 'noPeople', 'noNumbers', 'noPlace'] as const;
export type PhotoCheck = (typeof PHOTO_CHECKS)[number];
export const SEND_BACK_REASONS = ['people', 'numbers', 'notClear', 'notAnimal'] as const;
export type SendBackReason = (typeof SEND_BACK_REASONS)[number];

export type RequestStatus = 'waiting' | 'photoOk' | 'sentBack' | 'made' | 'cancelled' | 'expired';
export type PortraitConsent = { at: string; version: string; service: string };
export type PortraitRequest = {
  id: string;
  petId: string;
  /** No pet name: the portrait maker needs only the photo and the kind of animal (block 5 review). */
  kind: PetKind;
  requestedAt: string;
  status: RequestStatus;
  sentBackReason?: SendBackReason;
  tries: number;
  consent: PortraitConsent;
  redo: boolean;
  mine: boolean;
  sample: boolean;
};

export const isOpen = (r: PortraitRequest) => r.status === 'waiting' || r.status === 'photoOk' || r.status === 'sentBack';

/**
 * While a request is open, the photo the portrait maker checks must be the photo
 * that goes out. So the family can change or remove the photo only when there is
 * no open request, or when the portrait maker sent it back for a new one
 * (block 5 review: a photo could be swapped after it passed the check).
 */
export const canChangePhoto = (open: PortraitRequest | undefined) => !open || !isOpen(open) || open.status === 'sentBack';

export type RequestProblem = 'notFamily' | 'noPhoto' | 'notAgreed' | 'alreadyOpen' | 'householdLimit' | 'redoLimit' | 'serviceNotApproved';

/** Why a family cannot ask for a portrait right now. An empty list means they can. */
export function requestProblems(input: {
  isFamily: boolean;
  hasPhoto: boolean;
  agreed: boolean;
  petId: string;
  requests: readonly PortraitRequest[];
  /** True in the draft, where nothing leaves the phone. Never true in a store build. */
  demo: boolean;
  service?: PortraitService;
}): RequestProblem[] {
  const service = input.service ?? PORTRAIT_SERVICE;
  const problems: RequestProblem[] = [];
  if (!input.isFamily) problems.push('notFamily');
  if (!input.hasPhoto) problems.push('noPhoto');
  if (!input.agreed) problems.push('notAgreed');
  const mine = input.requests.filter((r) => r.mine);
  if (mine.some((r) => r.petId === input.petId && isOpen(r))) problems.push('alreadyOpen');
  else if (mine.filter(isOpen).length >= PORTRAIT.openPerHousehold) problems.push('householdLimit');
  const made = mine.filter((r) => r.petId === input.petId && r.status === 'made').length;
  if (made > PORTRAIT.redosPerPet) problems.push('redoLimit');
  if (!input.demo && !service.approved) problems.push('serviceNotApproved');
  return problems;
}

export type SpendRow = { at: string; tries: number };

export function spendCents(log: readonly SpendRow[], now: Date, span: 'month' | 'year'): number {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  return log
    .filter((row) => {
      const d = new Date(row.at);
      return d.getUTCFullYear() === y && (span === 'year' || d.getUTCMonth() === m);
    })
    .reduce((sum, row) => sum + row.tries * PORTRAIT.centsPerTry, 0);
}

/** How many more tries the portrait maker can use right now without passing a limit. */
export function triesLeft(log: readonly SpendRow[], now: Date): number {
  const room = Math.min(PORTRAIT.monthlyCapCents - spendCents(log, now, 'month'), PORTRAIT.yearlyCapCents - spendCents(log, now, 'year'));
  return Math.max(0, Math.floor(room / PORTRAIT.centsPerTry));
}

export function photoCheckPassed(checks: readonly PhotoCheck[]): boolean {
  return PHOTO_CHECKS.every((c) => checks.includes(c));
}

export type RequestAction =
  | { type: 'photoOk'; by: 'maker'; checks: readonly PhotoCheck[] }
  | { type: 'sendBack'; by: 'maker'; reason: SendBackReason }
  | { type: 'finish'; by: 'maker'; tries: number; triesLeft: number }
  | { type: 'newPhoto'; by: 'family' }
  | { type: 'cancel'; by: 'family' };

/** Moves a request to its next step, or returns undefined when the step is not allowed. */
export function advance(request: PortraitRequest, action: RequestAction): PortraitRequest | undefined {
  switch (action.type) {
    case 'photoOk':
      if (request.status !== 'waiting' || !photoCheckPassed(action.checks)) return undefined;
      return { ...request, status: 'photoOk', sentBackReason: undefined };
    case 'sendBack':
      if (request.status !== 'waiting') return undefined;
      return { ...request, status: 'sentBack', sentBackReason: action.reason };
    case 'finish': {
      if (request.status !== 'photoOk') return undefined;
      const tries = Math.round(action.tries);
      if (!(tries >= 1 && tries <= PORTRAIT.triesPerRequest) || tries > action.triesLeft) return undefined;
      return { ...request, status: 'made', tries };
    }
    case 'newPhoto':
      if (request.status !== 'sentBack') return undefined;
      return { ...request, status: 'waiting', sentBackReason: undefined };
    case 'cancel':
      if (!isOpen(request)) return undefined;
      return { ...request, status: 'cancelled' };
  }
}

/** The photo may be kept only while its request is open. */
/** A photo sent back (for example because it shows people) is not kept while the family finds a new one (block 5 review, S-13). */
export const mustDeletePhoto = (r: PortraitRequest) => !isOpen(r) || r.status === 'sentBack';
/** The portrait maker sees the photo only while it waits for a check or a portrait, never after sending it back. */
export const makerMaySeePhoto = (r: PortraitRequest) => r.status === 'waiting' || r.status === 'photoOk';

export function isExpired(request: PortraitRequest, now: Date): boolean {
  return isOpen(request) && now.getTime() - new Date(request.requestedAt).getTime() > PORTRAIT.keepPhotoDays * 86_400_000;
}

/** Oldest first, so no one is skipped. */
export function queueOrder(requests: readonly PortraitRequest[]): PortraitRequest[] {
  return requests.filter(isOpen).sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
}

/** The next weekly batch day on or after today. */
export function nextBatchDay(now: Date): Date {
  const day = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const ahead = (PORTRAIT.batchWeekday - day.getUTCDay() + 7) % 7;
  day.setUTCDate(day.getUTCDate() + ahead);
  return day;
}

/**
 * Everything that goes to the image service with a photo. No pet name, no
 * family, no place: only a random file name and the kind of animal.
 */
export function outbound(request: PortraitRequest): { fileName: string; kind: PetKind } {
  let h = 2166136261;
  for (const ch of request.id + request.requestedAt) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return { fileName: 'portrait-' + (h >>> 0).toString(36).padStart(6, '0').slice(0, 6) + '.jpg', kind: request.kind };
}
