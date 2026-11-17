/**
 * Sample-data store for pet character cards. Used by SampleRepository.
 *
 * What is saved on the device: card details, the person's own stickers, paw
 * notes and suggestions. What is kept in memory only and forgotten when the
 * app closes: photos, uploaded portraits and portrait requests. Nothing is
 * sent anywhere.
 */
import {
  advance,
  CONSENT_VERSION,
  decideNote,
  decideRegular,
  defaultCard,
  isDelivered,
  isExpired,
  isOpen,
  mustDeletePhoto,
  noteProblems,
  queueOrder,
  regularProblems,
  requestProblems,
  shownNotes,
  spendCents,
  stickerCounts,
  toggleSticker,
  triesLeft,
  visibleRegulars,
  waitingNotes,
  cleanStats,
  MAX_FAVORITES,
  type NoteProblem,
  type PawNote,
  type PetCard,
  type PhotoCheck,
  type PortraitRequest,
  type Regular,
  type RegularProblem,
  type RequestProblem,
  type SendBackReason,
  type SpendRow,
  type StickerCounts,
  type StickerId,
} from '../petcards';
import { canSeePhoto } from '../petcards';
import type { Critter, Pet } from './game-types';
import type { CardInput, PetCardsRepository, Portrait, RegularInput } from './petcard-repository';
import type { DemoRole } from './types';
import * as samples from './petcard-content';

const ME = 'me';

/** The part that is saved on the device. */
export type PetCardState = {
  cards: Record<string, PetCard>;
  stickers: Record<string, StickerId[]>;
  notes: PawNote[];
  noteDecisions: Record<string, 'shown' | 'declined'>;
  blocks: { petId: string; authorId: string }[];
  regulars: Regular[];
  regularDecisions: Record<string, 'approved' | 'declined'>;
  samplePortraits: string[];
  spend: SpendRow[];
  /** Request records only: who asked, when, the agreement, the status. Never the photo. Unset until first used. */
  requests?: PortraitRequest[];
};

export const emptyPetCards = (): PetCardState => ({
  cards: {},
  stickers: {},
  notes: [],
  noteDecisions: {},
  blocks: [],
  regulars: [],
  regularDecisions: {},
  samplePortraits: [],
  spend: [],
});


export type PetCardContext = {
  read: () => PetCardState;
  write: (next: PetCardState) => Promise<void>;
  notify: () => void;
  role: () => DemoRole;
  findPet: (id: string) => Pet | undefined;
  findCritter: (id: string) => Critter | undefined;
};

export class PetCardStore implements PetCardsRepository {
  /** Memory only: never saved, never sent. */
  private photos = new Map<string, string>();
  private portraits = new Map<string, string>();

  constructor(private ctx: PetCardContext) {}

  private read = () => this.ctx.read();
  private write = (next: PetCardState) => this.ctx.write(next);
  private notify = () => this.ctx.notify();
  private signedIn = () => this.ctx.role() !== 'visitor';
  /** In the draft, anyone with the Board level stands in for the portrait maker and moderators. */
  private isMaker = () => this.ctx.role() === 'board';
  /** A signed-out person is never treated as a pet's family, even on the family's phone. */
  private isFamily = (petId: string) => this.signedIn() && !!this.ctx.findPet(petId)?.mine;

  /** Called when a person deletes their information. */
  clearMemory() {
    this.photos.clear();
    this.portraits.clear();
  }

  /** The first time, the queue holds one pretend request so the portrait maker's page is not empty. */
  private get requests(): PortraitRequest[] {
    return this.read().requests ?? [samples.sampleRequest(new Date())];
  }
  private set requests(next: PortraitRequest[]) {
    // commit() updates the state at once; saving to the phone finishes in the background.
    void this.write({ ...this.read(), requests: next });
  }

  // ---- Cards ----
  getCard(petId: string): PetCard | undefined {
    const pet = this.ctx.findPet(petId);
    if (!pet) return undefined;
    return this.read().cards[petId] ?? samples.sampleCards.find((c) => c.petId === petId) ?? defaultCard(petId, pet.kind);
  }
  hasCard(petId: string): boolean {
    return !!this.read().cards[petId] || samples.sampleCards.some((c) => c.petId === petId);
  }
  saveCard(input: CardInput): Promise<void> {
    const pet = this.ctx.findPet(input.petId);
    if (!pet || !this.isFamily(pet.id)) return Promise.resolve();
    const s = this.read();
    const first = !s.cards[input.petId];
    const card: PetCard = {
      petId: input.petId,
      classId: input.classId,
      stats: cleanStats(input.stats),
      favorites: input.favorites.slice(0, MAX_FAVORITES),
      // A family's own words are shown as written, in every language.
      mannerisms: { en: input.mannerisms.trim(), es: input.mannerisms.trim() },
      specialMove: { en: input.specialMove.trim(), es: input.specialMove.trim() },
      photoAudience: input.photoAudience,
      sample: false,
    };
    // The first time a card is saved, two pretend notes arrive so the approve step can be tried.
    const arrivals: PawNote[] = first
      ? samples.sampleIncoming.map((text, i) => ({
          id: `in-${input.petId}-${i}`,
          petId: input.petId,
          text: text.split('{name}').join(pet.name),
          authorId: 'sample-neighbor-in-' + i,
          at: new Date(Date.now() - (i + 1) * 3_600_000).toISOString(),
          status: 'waiting',
          sample: true,
        }))
      : [];
    // A photo shown to neighbors by choice goes back to private when the choice is undone and no request needs it.
    return this.write({ ...s, cards: { ...s.cards, [input.petId]: card }, notes: [...arrivals, ...s.notes] });
  }
  /** Removes everything about a pet when its family removes the pet. */
  forgetPet(petId: string): PetCardState {
    const s = this.read();
    this.photos.delete(petId);
    this.portraits.delete(petId);
    const requests = this.requests.filter((r) => r.petId !== petId);
    const { [petId]: _card, ...cards } = s.cards;
    const { [petId]: _stickers, ...stickers } = s.stickers;
    return { ...s, cards, stickers, requests, notes: s.notes.filter((n) => n.petId !== petId), blocks: s.blocks.filter((b) => b.petId !== petId), samplePortraits: s.samplePortraits.filter((id) => id !== petId) };
  }

  // ---- Stickers ----
  getStickers(subjectId: string): { counts: StickerCounts; mine: StickerId[] } {
    const mine = this.read().stickers[subjectId] ?? [];
    return { counts: stickerCounts(samples.sampleStickerBase[subjectId], mine), mine };
  }
  toggleSticker(subjectId: string, sticker: StickerId): Promise<void> {
    if (!this.signedIn() || this.isFamily(subjectId)) return Promise.resolve();
    const s = this.read();
    return this.write({ ...s, stickers: { ...s.stickers, [subjectId]: toggleSticker(s.stickers[subjectId] ?? [], sticker) } });
  }

  // ---- Paw notes ----
  private allNotes(): PawNote[] {
    const s = this.read();
    const decided = (n: PawNote): PawNote => (s.noteDecisions[n.id] ? { ...n, status: s.noteDecisions[n.id] } : n);
    return [...s.notes, ...samples.sampleNotes].map(decided);
  }
  getNotes(petId: string): { shown: PawNote[]; waiting: PawNote[]; mineWaiting: number } {
    const all = this.allNotes();
    const s = this.read();
    const delivered = all.filter((n) => isDelivered(n.authorId, n.petId, s.blocks));
    return {
      shown: shownNotes(all, petId),
      waiting: this.isFamily(petId) ? waitingNotes(delivered, petId) : [],
      mineWaiting: all.filter((n) => n.petId === petId && n.authorId === ME && n.status === 'waiting').length,
    };
  }
  noteProblems(petId: string, text: string): NoteProblem[] {
    return noteProblems({ text, petId, authorId: ME, isOwnPet: this.isFamily(petId), notes: this.allNotes(), now: new Date() });
  }
  async sendNote(petId: string, text: string): Promise<NoteProblem[]> {
    if (!this.signedIn() || !this.ctx.findPet(petId)) return ['ownPet'];
    const problems = this.noteProblems(petId, text);
    if (problems.length > 0) return problems;
    const s = this.read();
    const note: PawNote = { id: 'note-' + Date.now().toString(36), petId, text: text.trim(), authorId: ME, at: new Date().toISOString(), status: 'waiting', sample: false };
    await this.write({ ...s, notes: [note, ...s.notes] });
    return [];
  }
  decideNote(noteId: string, show: boolean): Promise<void> {
    const note = this.allNotes().find((n) => n.id === noteId);
    const next = note ? decideNote(note, show, this.isFamily(note.petId)) : undefined;
    if (!next || next.status === 'waiting') return Promise.resolve();
    const s = this.read();
    return this.write({ ...s, noteDecisions: { ...s.noteDecisions, [noteId]: next.status } });
  }
  removeNote(noteId: string): Promise<void> {
    const note = this.allNotes().find((n) => n.id === noteId);
    if (!note || note.status !== 'shown' || !this.isFamily(note.petId)) return Promise.resolve();
    const s = this.read();
    return this.write({ ...s, noteDecisions: { ...s.noteDecisions, [noteId]: 'declined' } });
  }
  /** Declines the note and quietly stops later notes from the same sender to this pet. */
  blockSender(noteId: string): Promise<void> {
    const note = this.allNotes().find((n) => n.id === noteId);
    if (!note || !this.isFamily(note.petId)) return Promise.resolve();
    const s = this.read();
    return this.write({ ...s, noteDecisions: { ...s.noteDecisions, [noteId]: 'declined' }, blocks: [...s.blocks, { petId: note.petId, authorId: note.authorId }] });
  }

  // ---- Photos and portraits ----
  getPhoto(petId: string): string | undefined {
    const pet = this.ctx.findPet(petId);
    const card = this.getCard(petId);
    if (!pet || !card) return undefined;
    const viewer = this.isFamily(petId) ? 'family' : this.signedIn() ? 'neighbor' : 'visitor';
    return canSeePhoto(card.photoAudience, viewer) ? this.photos.get(petId) : undefined;
  }
  setPhoto(petId: string, uri: string | undefined) {
    if (!this.isFamily(petId)) return;
    if (uri) this.photos.set(petId, uri);
    else this.photos.delete(petId);
    this.notify();
  }
  getPortrait(petId: string): Portrait | undefined {
    const uri = this.portraits.get(petId);
    if (uri) return { kind: 'image', uri };
    return this.read().samplePortraits.includes(petId) ? { kind: 'sample' } : undefined;
  }
  removePortrait(petId: string): Promise<void> {
    if (!this.isFamily(petId)) return Promise.resolve();
    this.portraits.delete(petId);
    const s = this.read();
    return this.write({ ...s, samplePortraits: s.samplePortraits.filter((id) => id !== petId) });
  }

  // ---- Portrait requests ----
  /** Ends requests older than 30 days and deletes their photos. Runs whenever requests are read. */
  private expireOld() {
    const now = new Date();
    if (!this.requests.some((r) => isExpired(r, now))) return;
    this.requests = this.requests.map((r) => {
      if (!isExpired(r, now)) return r;
      if (r.mine && this.getCard(r.petId)?.photoAudience !== 'neighbors') this.photos.delete(r.petId);
      return { ...r, status: 'expired' as const };
    });
  }
  listRequests(): PortraitRequest[] {
    this.expireOld();
    return this.isMaker() ? queueOrder(this.requests) : this.requests.filter((r) => r.mine);
  }
  getRequest(petId: string): PortraitRequest | undefined {
    this.expireOld();
    return this.requests.find((r) => r.petId === petId && r.mine && isOpen(r)) ?? [...this.requests].reverse().find((r) => r.petId === petId && r.mine);
  }
  /** The portrait maker sees a photo only while its request is open. */
  getRequestPhoto(requestId: string): string | undefined {
    const r = this.requests.find((x) => x.id === requestId);
    if (!r || !this.isMaker() || !isOpen(r)) return undefined;
    return this.photos.get(r.petId);
  }
  requestProblems(petId: string, agreed: boolean): RequestProblem[] {
    return requestProblems({ isFamily: this.isFamily(petId), hasPhoto: this.photos.has(petId), agreed, petId, requests: this.requests, demo: true });
  }
  requestPortrait(petId: string, agreed: boolean): RequestProblem[] {
    const pet = this.ctx.findPet(petId);
    const problems = this.requestProblems(petId, agreed);
    if (!pet || problems.length > 0) return problems.length > 0 ? problems : ['notFamily'];
    const now = new Date().toISOString();
    const made = this.requests.some((r) => r.petId === pet.id && r.mine && r.status === 'made');
    this.requests = [
      ...this.requests,
      { id: 'req-' + Date.now().toString(36), petId: pet.id, petName: pet.name, kind: pet.kind, requestedAt: now, status: 'waiting', tries: 0, consent: { at: now, version: CONSENT_VERSION, service: 'sample' }, redo: made, mine: true, sample: false },
    ];
    this.notify();
    return [];
  }
  private step(id: string, next: (r: PortraitRequest) => PortraitRequest | undefined): boolean {
    const current = this.requests.find((r) => r.id === id);
    const changed = current ? next(current) : undefined;
    if (!changed) return false;
    this.requests = this.requests.map((r) => (r.id === id ? changed : r));
    // A photo is kept only while its request is open, unless the family chose to show it to neighbors.
    if (mustDeletePhoto(changed) && changed.mine && this.getCard(changed.petId)?.photoAudience !== 'neighbors') this.photos.delete(changed.petId);
    this.notify();
    return true;
  }
  cancelRequest(id: string) {
    return this.step(id, (r) => (r.mine ? advance(r, { type: 'cancel', by: 'family' }) : undefined));
  }
  resendPhoto(id: string) {
    const r = this.requests.find((x) => x.id === id);
    if (!r || !r.mine || !this.photos.has(r.petId)) return false;
    return this.step(id, (x) => advance(x, { type: 'newPhoto', by: 'family' }));
  }
  checkPhoto(id: string, checks: readonly PhotoCheck[], sendBack?: SendBackReason) {
    if (!this.isMaker()) return false;
    return this.step(id, (r) => (sendBack ? advance(r, { type: 'sendBack', by: 'maker', reason: sendBack }) : advance(r, { type: 'photoOk', by: 'maker', checks })));
  }
  async finishPortrait(id: string, tries: number, uri?: string): Promise<boolean> {
    if (!this.isMaker()) return false;
    const s = this.read();
    const request = this.requests.find((r) => r.id === id);
    const ok = this.step(id, (r) => advance(r, { type: 'finish', by: 'maker', tries, triesLeft: triesLeft(s.spend, new Date()) }));
    if (!ok || !request) return false;
    if (uri) this.portraits.set(request.petId, uri);
    const after = this.read();
    await this.write({
      ...after,
      spend: [...after.spend, { at: new Date().toISOString(), tries }],
      samplePortraits: uri ? after.samplePortraits.filter((p) => p !== request.petId) : [...after.samplePortraits.filter((p) => p !== request.petId), request.petId],
    });
    return true;
  }
  getSpend(): { monthCents: number; yearCents: number; triesLeft: number } {
    const log = this.read().spend;
    const now = new Date();
    return { monthCents: spendCents(log, now, 'month'), yearCents: spendCents(log, now, 'year'), triesLeft: triesLeft(log, now) };
  }

  // ---- Regulars ----
  private allRegulars(): Regular[] {
    const s = this.read();
    return [...s.regulars, ...samples.sampleRegulars].map((r) => (s.regularDecisions[r.id] ? { ...r, status: s.regularDecisions[r.id] } : r));
  }
  listRegulars(): Regular[] {
    return visibleRegulars(this.allRegulars(), this.isMaker());
  }
  getRegular(id: string): Regular | undefined {
    return this.listRegulars().find((r) => r.id === id);
  }
  async suggestRegular(input: RegularInput): Promise<RegularProblem[]> {
    const problems = regularProblems({ critter: this.ctx.findCritter(input.critterId), name: input.name, about: input.about, zone: input.zone });
    if (problems.length > 0 || !this.signedIn()) return problems.length > 0 ? problems : ['notWildlife'];
    const s = this.read();
    const regular: Regular = {
      id: 'reg-mine-' + Date.now().toString(36),
      critterId: input.critterId,
      name: input.name.trim(),
      about: { en: input.about.trim(), es: input.about.trim() },
      zone: input.zone,
      classId: input.classId,
      stats: cleanStats(input.stats),
      status: 'suggested',
      mine: true,
      sample: false,
    };
    await this.write({ ...s, regulars: [regular, ...s.regulars] });
    return [];
  }
  decideRegular(id: string, approve: boolean): Promise<void> {
    const regular = this.allRegulars().find((r) => r.id === id);
    const next = regular ? decideRegular(regular, approve, this.isMaker()) : undefined;
    if (!next || next.status === 'suggested') return Promise.resolve();
    const s = this.read();
    return this.write({ ...s, regularDecisions: { ...s.regularDecisions, [id]: next.status } });
  }
}
