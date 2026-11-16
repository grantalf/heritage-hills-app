/** Text in every supported language. Adding Arabic later means adding one key here. */
export type L = { en: string; es: string };

export type Capital = 'natural' | 'social' | 'human' | 'cultural' | 'built' | 'financial' | 'civic';

export type AlertKind = 'urgent' | 'notice' | 'good';
export type Alert = {
  id: string;
  kind: AlertKind;
  title: L;
  body: L;
  postedAt: string;
  expiresAt: string;
  sample: boolean;
};

export type EventCategory = 'community' | 'meeting' | 'nature' | 'garden' | 'family';
export type CommunityEvent = {
  id: string;
  title: L;
  summary: L;
  details: L;
  startsAt: string;
  endsAt: string;
  place: L;
  category: EventCategory;
  onlineLink?: string;
  phone?: string;
  openToAll: boolean;
  capital: Capital[];
  goingCount: number;
  sample: boolean;
};

export type EcoSection = 'creek' | 'plants' | 'trees' | 'wildlife' | 'water' | 'soil' | 'yard';
export type Article = {
  id: string;
  section: EcoSection;
  title: L;
  summary: L;
  body: L[];
  action: L;
  sourceName?: string;
  sourceUrl?: string;
  /** YYYY-MM or YYYY-MM-DD */
  verifiedOn?: string;
  status: 'draft' | 'verified';
};

export type MonthTip = { month: number; text: L };

export type ResourceKind = 'rebate' | 'free' | 'grant' | 'program';
export type Resource = {
  id: string;
  kind: ResourceKind;
  title: L;
  provider: string;
  summary: L;
  who: L;
  url: string;
  verifiedOn: string;
  capital: Capital;
};

export type HelpIdea = { id: string; time: 'minutes' | 'hour' | 'ongoing'; text: L };

export type ShareCategory = 'tool' | 'book' | 'toy';
export type ShareItem = {
  id: string;
  category: ShareCategory;
  title: L;
  condition: L;
  status: 'available' | 'lent';
  mine: boolean;
  sample: boolean;
};
export type ShareRequestState = 'none' | 'sent' | 'accepted';

export type Opportunity = {
  id: string;
  title: L;
  summary: L;
  when: L;
  duration: L;
  capital: Capital;
  sample: boolean;
};

export type InviteAnswer = 'yes' | 'no' | 'maybe';
export type Invite = {
  id: string;
  title: L;
  host: L;
  startsAt: string;
  place: L;
  note: L;
  sample: boolean;
};

export type DecisionContent = { summary: L; outcome: L };

export type Poll = {
  id: string;
  question: L;
  options: L[];
  counts: number[];
  closesAt: string;
  sample: boolean;
};

export type StatMeasure = { id: string; label: L; why: L; action: L };

export type CapitalMeasure = {
  id: string;
  capital: Capital;
  label: L;
  value: number;
  unit: L;
  how: L;
  sample: boolean;
};

export type GardenStepState = 'done' | 'now' | 'next';
export type GardenStep = { id: string; title: L; note: L; state: GardenStepState };
export type GardenFact = { id: string; text: L };

export type Office = { id: string; title: L; holder?: string };
export type AssociationDoc = { id: string; title: L; available: boolean };

export type GardenInterest = {
  plot: boolean;
  build: boolean;
  lead: boolean;
  flowers: boolean;
  materials: boolean;
};

export type DemoRole = 'visitor' | 'neighbor' | 'board';
