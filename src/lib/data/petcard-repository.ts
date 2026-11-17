/**
 * The doorway to pet character card data (decision D-027). Screens reach it as
 * `repo.cards`. Today the sample adapter answers. Later the real backend must
 * answer the same questions and enforce the same rules on the server.
 */
import type {
  ClassId,
  NoteProblem,
  PawNote,
  PetCard,
  PhotoCheck,
  PortraitRequest,
  PublicZone,
  Regular,
  RegularProblem,
  RequestProblem,
  SendBackReason,
  Stats,
  StickerCounts,
  StickerId,
} from '../petcards';

/** A sample portrait is drawn by the app. An image is one the portrait maker uploaded. */
export type Portrait = { kind: 'sample' } | { kind: 'image'; uri: string };
export type CardInput = { petId: string; classId: ClassId; stats: Stats; favorites: PetCard['favorites']; mannerisms: string; specialMove: string; photoAudience: PetCard['photoAudience'] };
export type RegularInput = { critterId: string; name: string; about: string; zone: PublicZone; classId: ClassId; stats: Stats };

export interface PetCardsRepository {
  // Cards. Only a pet's own family can save its card.
  getCard(petId: string): PetCard | undefined;
  hasCard(petId: string): boolean;
  saveCard(input: CardInput): Promise<void>;

  // Stickers: preset, one of each per person per card. Counts only, never who.
  getStickers(subjectId: string): { counts: StickerCounts; mine: StickerId[] };
  toggleSticker(subjectId: string, sticker: StickerId): Promise<void>;

  // Paw notes: shown only after the pet's family says yes.
  getNotes(petId: string): { shown: PawNote[]; waiting: PawNote[]; mineWaiting: number };
  noteProblems(petId: string, text: string): NoteProblem[];
  sendNote(petId: string, text: string): Promise<NoteProblem[]>;
  decideNote(noteId: string, show: boolean): Promise<void>;
  blockSender(noteId: string): Promise<void>;
  /** The family can take down a note it showed earlier. */
  removeNote(noteId: string): Promise<void>;

  // Real photos. Answers undefined unless this viewer may see the photo.
  getPhoto(petId: string): string | undefined;
  setPhoto(petId: string, uri: string | undefined): void;
  getPortrait(petId: string): Portrait | undefined;
  removePortrait(petId: string): Promise<void>;

  // Portrait requests. The portrait maker sees the open queue. A family sees its own.
  listRequests(): PortraitRequest[];
  getRequest(petId: string): PortraitRequest | undefined;
  getRequestPhoto(requestId: string): string | undefined;
  requestProblems(petId: string, agreed: boolean): RequestProblem[];
  requestPortrait(petId: string, agreed: boolean): RequestProblem[];
  cancelRequest(id: string): boolean;
  resendPhoto(id: string): boolean;
  checkPhoto(id: string, checks: readonly PhotoCheck[], sendBack?: SendBackReason): boolean;
  /** uri is the finished picture. Leave it out in the draft to use a sample portrait. */
  finishPortrait(id: string, tries: number, uri?: string): Promise<boolean>;
  getSpend(): { monthCents: number; yearCents: number; triesLeft: number };

  // Neighborhood regulars: wild animals, suggested by neighbors, approved by a moderator.
  listRegulars(): Regular[];
  getRegular(id: string): Regular | undefined;
  suggestRegular(input: RegularInput): Promise<RegularProblem[]>;
  decideRegular(id: string, approve: boolean): Promise<void>;
}
