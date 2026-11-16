/**
 * Sample-data adapter for the first draft.
 * Everything stays on the device. Nothing is sent anywhere.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { appendEntry, verifyChain, type RecordEntry, type VerifyResult } from '../audit';
import { canApprove, isHiddenByReports, type Audience, type ConsentField, type ConsentRow, type Report } from '../rules';
import { emptyGame } from '../game';
import * as content from './content';
import * as game from './game-content';
import type { GameState, Pet, PetKind, Zone } from './game-types';
import type { AlertDraft, FlowersState, PendingAlert, Repository, RsvpAnswer } from './repository';
import type {
  Alert,
  DecisionContent,
  DemoRole,
  GardenInterest,
  InviteAnswer,
  ShareCategory,
  ShareItem,
  ShareRequestState,
} from './types';

const STORAGE_KEY = 'hh.sample.state.v1';
const ME = 'me';

type State = {
  role: DemoRole;
  rsvps: Record<string, RsvpAnswer>;
  signups: string[];
  garden?: GardenInterest;
  shareRequests: Record<string, ShareRequestState>;
  myItems: ShareItem[];
  reports: Report[];
  inviteAnswers: Record<string, InviteAnswer>;
  flowers: FlowersState;
  pollVotes: Record<string, number>;
  consent: ConsentRow[];
  pendingAlert?: PendingAlert;
  postedAlerts: Alert[];
  game: GameState;
  myPets: Pet[];
  pendingStories: Record<string, number>;
};

const emptyState = (): State => ({
  role: 'visitor',
  rsvps: {},
  signups: [],
  shareRequests: {},
  myItems: [],
  reports: [],
  inviteAnswers: {},
  flowers: { receiving: false, paused: false, delivering: false },
  pollVotes: {},
  consent: [],
  postedAlerts: [],
  game: emptyGame(),
  myPets: [],
  pendingStories: {},
});

/** Simulates other neighbors' reports so the "two reports hide an item" rule can be seen. */
const OTHER_REPORTER = 'another-neighbor';

export class SampleRepository implements Repository {
  private state: State = emptyState();
  private listeners = new Set<() => void>();
  private loaded: Promise<void> | undefined;
  private decisions: RecordEntry<DecisionContent>[] = [];
  private readonly startedAt = new Date();
  /** Photos are kept in memory only: never saved, never sent. */
  private photos = new Map<string, string>();

  constructor() {
    let chain: RecordEntry<DecisionContent>[] = [];
    for (const d of content.sampleDecisions) {
      chain = appendEntry(chain, d.content, content.fromNow(-d.daysAgo, 19, 0, this.startedAt));
    }
    this.decisions = chain;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  ready(): Promise<void> {
    if (!this.loaded) {
      this.loaded = AsyncStorage.getItem(STORAGE_KEY)
        .then((raw) => {
          if (raw) {
            const saved = JSON.parse(raw) as Partial<State>;
            this.state = { ...emptyState(), ...saved, game: { ...emptyGame(), ...saved.game } };
          }
        })
        .catch(() => {
          // Storage can be unavailable (private browsing, previews). Keep working in memory.
        })
        .then(() => {
          // Screens that read saved choices directly (role, RSVPs) need to redraw once they load.
          this.listeners.forEach((l) => l());
        });
    }
    return this.loaded;
  }

  private async commit(next: State): Promise<void> {
    this.state = next;
    this.listeners.forEach((l) => l());
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // In-memory only.
    }
  }

  // ---- Public content ----
  async listAlerts() {
    const now = Date.now();
    return [...this.state.postedAlerts, ...content.buildAlerts(this.startedAt)]
      .filter((a) => new Date(a.expiresAt).getTime() > now)
      .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  }
  async listEvents() {
    return content
      .buildEvents(this.startedAt)
      .map((e) => ({ ...e, goingCount: e.goingCount + (this.state.rsvps[e.id] === 'going' ? 1 : 0) }))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }
  async getEvent(id: string) {
    return (await this.listEvents()).find((e) => e.id === id);
  }
  async listArticles() {
    return content.articles;
  }
  async getArticle(id: string) {
    return content.articles.find((a) => a.id === id);
  }
  async listMonthTips(month: number) {
    return content.monthTips.filter((t) => t.month === month);
  }
  async listResources() {
    return content.resources;
  }
  async listHelpIdeas() {
    return content.helpIdeas;
  }
  async listStatMeasures() {
    return content.statMeasures;
  }
  async listCapitalMeasures() {
    return content.capitalMeasures;
  }
  async getGarden() {
    return { facts: content.gardenFacts, steps: content.gardenSteps, interestCount: 31 + (this.state.garden ? 1 : 0) };
  }
  async listOffices() {
    return content.offices;
  }
  async listDocs() {
    return content.associationDocs;
  }
  async listDecisions() {
    return this.decisions;
  }
  async verifyDecisions(): Promise<VerifyResult> {
    return verifyChain(this.decisions);
  }
  async listPolls() {
    return content.buildPolls(this.startedAt).map((p) => {
      const vote = this.state.pollVotes[p.id];
      return vote === undefined ? p : { ...p, counts: p.counts.map((c, i) => (i === vote ? c + 1 : c)) };
    });
  }

  // ---- Session ----
  getRole() {
    return this.state.role;
  }
  setRole(role: DemoRole) {
    return this.commit({ ...this.state, role });
  }

  // ---- Share shelf ----
  async listShareItems() {
    return [...this.state.myItems, ...content.shareItems].filter(
      (item) => item.mine || !isHiddenByReports(item.id, this.state.reports),
    );
  }
  async getShareItem(id: string) {
    return [...this.state.myItems, ...content.shareItems].find((i) => i.id === id);
  }
  addShareItem(input: { category: ShareCategory; title: string; condition: string }) {
    const item: ShareItem = {
      id: 'mine-' + Date.now().toString(36),
      category: input.category,
      // A neighbor's own words are shown as written, in every language.
      title: { en: input.title, es: input.title },
      condition: { en: input.condition, es: input.condition },
      status: 'available',
      mine: true,
      sample: false,
    };
    return this.commit({ ...this.state, myItems: [item, ...this.state.myItems] });
  }
  removeShareItem(id: string) {
    return this.commit({ ...this.state, myItems: this.state.myItems.filter((i) => i.id !== id) });
  }
  getShareRequest(itemId: string): ShareRequestState {
    return this.state.shareRequests[itemId] ?? 'none';
  }
  async requestShareItem(itemId: string) {
    await this.commit({ ...this.state, shareRequests: { ...this.state.shareRequests, [itemId]: 'sent' } });
    // The draft pretends the owner accepts a moment later.
    setTimeout(() => {
      if (this.state.shareRequests[itemId] === 'sent') {
        void this.commit({ ...this.state, shareRequests: { ...this.state.shareRequests, [itemId]: 'accepted' } });
      }
    }, 2500);
  }
  cancelShareRequest(itemId: string) {
    const next = { ...this.state.shareRequests };
    delete next[itemId];
    return this.commit({ ...this.state, shareRequests: next });
  }
  reportItem(itemId: string) {
    if (this.hasReported(itemId)) return Promise.resolve();
    // The draft adds a second, simulated report so the hiding rule is visible.
    return this.commit({
      ...this.state,
      reports: [...this.state.reports, { itemId, reporterId: ME }, { itemId, reporterId: OTHER_REPORTER }],
    });
  }
  hasReported(itemId: string) {
    return this.state.reports.some((r) => r.itemId === itemId && r.reporterId === ME);
  }

  // ---- Events ----
  getRsvp(eventId: string) {
    return this.state.rsvps[eventId];
  }
  setRsvp(eventId: string, answer: RsvpAnswer | undefined) {
    const next = { ...this.state.rsvps };
    if (answer) next[eventId] = answer;
    else delete next[eventId];
    return this.commit({ ...this.state, rsvps: next });
  }

  // ---- Volunteering ----
  async listOpportunities() {
    return content.opportunities;
  }
  isSignedUp(id: string) {
    return this.state.signups.includes(id);
  }
  setSignedUp(id: string, value: boolean) {
    const without = this.state.signups.filter((s) => s !== id);
    return this.commit({ ...this.state, signups: value ? [...without, id] : without });
  }

  // ---- Garden ----
  getGardenInterest() {
    return this.state.garden;
  }
  setGardenInterest(value: GardenInterest | undefined) {
    return this.commit({ ...this.state, garden: value });
  }

  // ---- Invites ----
  async listInvites() {
    return content.buildInvites(this.startedAt);
  }
  getInviteAnswer(id: string) {
    return this.state.inviteAnswers[id];
  }
  setInviteAnswer(id: string, answer: InviteAnswer) {
    return this.commit({ ...this.state, inviteAnswers: { ...this.state.inviteAnswers, [id]: answer } });
  }

  // ---- Flowers for Neighbors ----
  getFlowers() {
    return this.state.flowers;
  }
  setFlowers(value: FlowersState) {
    return this.commit({ ...this.state, flowers: value });
  }

  // ---- Polls ----
  getPollVote(pollId: string) {
    return this.state.pollVotes[pollId];
  }
  votePoll(pollId: string, optionIndex: number) {
    if (this.state.pollVotes[pollId] !== undefined) return Promise.resolve();
    return this.commit({ ...this.state, pollVotes: { ...this.state.pollVotes, [pollId]: optionIndex } });
  }

  // ---- Privacy ----
  getConsentLedger() {
    return this.state.consent;
  }
  setConsent(field: ConsentField, audience: Audience) {
    const row: ConsentRow = { field, audience, at: new Date().toISOString() };
    return this.commit({ ...this.state, consent: [...this.state.consent, row] });
  }
  async exportMyData() {
    const { role, postedAlerts: _posted, pendingAlert: _pending, ...mine } = this.state;
    return { accessLevel: role, ...mine };
  }
  deleteMyData() {
    this.photos.clear();
    return this.commit({ ...emptyState(), postedAlerts: this.state.postedAlerts });
  }

  // ---- Critter Club ----
  async listCritters() {
    return game.critters;
  }
  async getCritter(id: string) {
    return game.critters.find((c) => c.id === id);
  }
  getGame() {
    return this.state.game;
  }
  addSighting(critterId: string, zone: Zone, photoUri?: string) {
    const id = 'sight-' + Date.now().toString(36) + '-' + this.state.game.sightings.length;
    if (photoUri) this.photos.set(id, photoUri);
    const sighting = { id, critterId, zone, at: new Date().toISOString(), hasPhoto: !!photoUri };
    return this.commit({ ...this.state, game: { ...this.state.game, sightings: [sighting, ...this.state.game.sightings] } });
  }
  getSightingPhoto(sightingId: string) {
    return this.photos.get(sightingId);
  }
  async getTally() {
    const counts: Record<string, number> = { ...game.sampleTallyBase };
    for (const s of this.state.game.sightings) counts[s.critterId] = (counts[s.critterId] ?? 0) + 1;
    return { counts, goal: game.SAMPLE_TALLY_GOAL };
  }
  async listPets() {
    return [...this.state.myPets, ...game.samplePets];
  }
  async getPet(id: string) {
    return [...this.state.myPets, ...game.samplePets].find((p) => p.id === id);
  }
  addPet(input: { name: string; kind: PetKind; about: string; hello: string }) {
    const same = { en: '', es: '' };
    const pet: Pet = {
      id: 'mypet-' + Date.now().toString(36),
      kind: input.kind,
      emoji: { dog: '🐕', cat: '🐈', other: '🐾' }[input.kind],
      name: input.name,
      // A family's own words are shown as written, in every language.
      about: { en: input.about, es: input.about },
      hello: { en: input.hello, es: input.hello },
      loves: same,
      where: same,
      stories: [],
      mine: true,
      sample: false,
    };
    return this.commit({ ...this.state, myPets: [pet, ...this.state.myPets] });
  }
  removePet(id: string) {
    return this.commit({ ...this.state, myPets: this.state.myPets.filter((p) => p.id !== id) });
  }
  meetPet(id: string) {
    if (this.state.game.petsMet.includes(id)) return Promise.resolve();
    return this.commit({ ...this.state, game: { ...this.state.game, petsMet: [...this.state.game.petsMet, id] } });
  }
  submitPetStory(petId: string, _text: string) {
    // The draft does not keep the words. It only counts that a story is waiting for the family.
    return this.commit({ ...this.state, pendingStories: { ...this.state.pendingStories, [petId]: (this.state.pendingStories[petId] ?? 0) + 1 } });
  }
  pendingPetStories(petId: string) {
    return this.state.pendingStories[petId] ?? 0;
  }
  async listMysteries() {
    return game.mysteries;
  }
  async answerMystery(id: string, optionId: string, cluesUsed: number) {
    const mystery = game.mysteries.find((m) => m.id === id);
    if (!mystery || this.state.game.mysteries[id]) return false;
    const solved = mystery.answerId === optionId;
    await this.commit({ ...this.state, game: { ...this.state.game, mysteries: { ...this.state.game.mysteries, [id]: { solved, cluesUsed } } } });
    return solved;
  }
  async listBingoCards() {
    return game.bingoCards;
  }
  toggleBingo(cardId: string, squareId: string) {
    const marked = this.state.game.bingo[cardId] ?? [];
    const next = marked.includes(squareId) ? marked.filter((m) => m !== squareId) : [...marked, squareId];
    return this.commit({ ...this.state, game: { ...this.state.game, bingo: { ...this.state.game.bingo, [cardId]: next } } });
  }

  // ---- Board tools ----
  getPendingAlert() {
    return this.state.pendingAlert;
  }
  draftAlert(draft: AlertDraft) {
    const pending: PendingAlert = {
      id: 'pending-' + Date.now().toString(36),
      kind: 'send-alert',
      requestedBy: ME,
      requestedAt: new Date().toISOString(),
      draft,
    };
    return this.commit({ ...this.state, pendingAlert: pending });
  }
  async approvePendingAlert(asSecondPerson: boolean) {
    const pending = this.state.pendingAlert;
    if (!pending) return false;
    const approver = asSecondPerson ? 'second-officer' : ME;
    if (!canApprove(pending, approver, true, new Date())) return false;
    const now = new Date();
    const alert: Alert = {
      id: 'posted-' + now.getTime().toString(36),
      kind: pending.draft.kind,
      title: pending.draft.title,
      body: pending.draft.body,
      postedAt: now.toISOString(),
      expiresAt: content.fromNow(3, 18, 0, now),
      sample: true,
    };
    await this.commit({ ...this.state, pendingAlert: undefined, postedAlerts: [alert, ...this.state.postedAlerts] });
    return true;
  }
  cancelPendingAlert() {
    return this.commit({ ...this.state, pendingAlert: undefined });
  }
}
