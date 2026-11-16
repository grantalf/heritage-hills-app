/**
 * The one doorway to data (decision D-027).
 * Screens only talk to this interface. Today it is backed by sample data on the
 * device. Later a real backend adapter implements the same methods, and no
 * screen has to change.
 */
import type { RecordEntry, VerifyResult } from '../audit';
import type { Audience, ConsentField, ConsentRow, PendingAction } from '../rules';
import type { BingoCard, Critter, GameState, Mystery, Pet, PetKind, Zone } from './game-types';
import type {
  Alert,
  AlertKind,
  Article,
  AssociationDoc,
  CapitalMeasure,
  CommunityEvent,
  DecisionContent,
  DemoRole,
  GardenFact,
  GardenInterest,
  GardenStep,
  HelpIdea,
  Invite,
  InviteAnswer,
  L,
  MonthTip,
  Office,
  Opportunity,
  Poll,
  Resource,
  ShareCategory,
  ShareItem,
  ShareRequestState,
  StatMeasure,
} from './types';

export type RsvpAnswer = 'going' | 'maybe';

export type AlertDraft = { kind: AlertKind; title: L; body: L };
export type PendingAlert = PendingAction & { draft: AlertDraft };

export type FlowersState = { receiving: boolean; paused: boolean; delivering: boolean };

export interface Repository {
  /** Call the listener whenever anything changes. Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
  ready(): Promise<void>;

  // Public content: readable by anyone.
  listAlerts(): Promise<Alert[]>;
  listEvents(): Promise<CommunityEvent[]>;
  getEvent(id: string): Promise<CommunityEvent | undefined>;
  listArticles(): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  listMonthTips(month: number): Promise<MonthTip[]>;
  listResources(): Promise<Resource[]>;
  listHelpIdeas(): Promise<HelpIdea[]>;
  listStatMeasures(): Promise<StatMeasure[]>;
  listCapitalMeasures(): Promise<CapitalMeasure[]>;
  getGarden(): Promise<{ facts: GardenFact[]; steps: GardenStep[]; interestCount: number }>;
  listOffices(): Promise<Office[]>;
  listDocs(): Promise<AssociationDoc[]>;
  listDecisions(): Promise<RecordEntry<DecisionContent>[]>;
  verifyDecisions(): Promise<VerifyResult>;
  listPolls(): Promise<Poll[]>;

  // Session (simulated in the first draft).
  getRole(): DemoRole;
  setRole(role: DemoRole): Promise<void>;

  // Neighbor features.
  listShareItems(): Promise<ShareItem[]>;
  getShareItem(id: string): Promise<ShareItem | undefined>;
  addShareItem(input: { category: ShareCategory; title: string; condition: string }): Promise<void>;
  removeShareItem(id: string): Promise<void>;
  getShareRequest(itemId: string): ShareRequestState;
  requestShareItem(itemId: string): Promise<void>;
  cancelShareRequest(itemId: string): Promise<void>;
  reportItem(itemId: string): Promise<void>;
  hasReported(itemId: string): boolean;

  getRsvp(eventId: string): RsvpAnswer | undefined;
  setRsvp(eventId: string, answer: RsvpAnswer | undefined): Promise<void>;

  listOpportunities(): Promise<Opportunity[]>;
  isSignedUp(opportunityId: string): boolean;
  setSignedUp(opportunityId: string, value: boolean): Promise<void>;

  getGardenInterest(): GardenInterest | undefined;
  setGardenInterest(value: GardenInterest | undefined): Promise<void>;

  listInvites(): Promise<Invite[]>;
  getInviteAnswer(inviteId: string): InviteAnswer | undefined;
  setInviteAnswer(inviteId: string, answer: InviteAnswer): Promise<void>;

  getFlowers(): FlowersState;
  setFlowers(value: FlowersState): Promise<void>;

  getPollVote(pollId: string): number | undefined;
  votePoll(pollId: string, optionIndex: number): Promise<void>;

  // Privacy.
  getConsentLedger(): ConsentRow[];
  setConsent(field: ConsentField, audience: Audience): Promise<void>;
  /** Everything this device holds about the person, in plain form. */
  exportMyData(): Promise<Record<string, unknown>>;
  deleteMyData(): Promise<void>;

  // Critter Club (docs/GAME.md). Progress is the player's own. Only counts are shared.
  listCritters(): Promise<Critter[]>;
  getCritter(id: string): Promise<Critter | undefined>;
  getGame(): GameState;
  /** photoUri stays on the device in the first draft. Later it goes to a review queue first. */
  addSighting(critterId: string, zone: Zone, photoUri?: string): Promise<void>;
  getSightingPhoto(sightingId: string): string | undefined;
  /** Neighborhood counts per animal, and the shared goal. Never who or exactly where. */
  getTally(): Promise<{ counts: Record<string, number>; goal: number }>;
  listPets(): Promise<Pet[]>;
  getPet(id: string): Promise<Pet | undefined>;
  /** Only a pet's own family adds a pet. */
  addPet(input: { name: string; kind: PetKind; about: string; hello: string }): Promise<void>;
  removePet(id: string): Promise<void>;
  meetPet(id: string): Promise<void>;
  /** A story goes to the pet's family to approve. It is not shown until they do. */
  submitPetStory(petId: string, text: string): Promise<void>;
  pendingPetStories(petId: string): number;
  listMysteries(): Promise<Mystery[]>;
  answerMystery(id: string, optionId: string, cluesUsed: number): Promise<boolean>;
  listBingoCards(): Promise<BingoCard[]>;
  toggleBingo(cardId: string, squareId: string): Promise<void>;

  // Board tools (two-approver rule).
  getPendingAlert(): PendingAlert | undefined;
  draftAlert(draft: AlertDraft): Promise<void>;
  /** In the draft, "second approver" is simulated as a different person. */
  approvePendingAlert(asSecondPerson: boolean): Promise<boolean>;
  cancelPendingAlert(): Promise<void>;
}
