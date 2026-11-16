/**
 * Small, testable safety rules. The real backend must enforce the same rules
 * in the database (docs/SECURITY.md); these are the reference versions.
 */

/** An item is hidden once this many different neighbors have reported it. */
export const REPORTS_TO_HIDE = 2;

export type Report = { itemId: string; reporterId: string };

export function isHiddenByReports(itemId: string, reports: readonly Report[]): boolean {
  const reporters = new Set(reports.filter((r) => r.itemId === itemId).map((r) => r.reporterId));
  return reporters.size >= REPORTS_TO_HIDE;
}

/** Two-approver rule: the second approver must be a different person with an eligible role. */
export type PendingAction = {
  id: string;
  kind: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
};

export const PENDING_HOURS = 72;

export function canApprove(action: PendingAction, approverId: string, approverHasRole: boolean, now: Date): boolean {
  if (!approverHasRole) return false;
  if (action.approvedBy) return false;
  if (approverId === action.requestedBy) return false;
  const ageHours = (now.getTime() - new Date(action.requestedAt).getTime()) / 3_600_000;
  return ageHours >= 0 && ageHours <= PENDING_HOURS;
}

/** Consent ledger: append-only. The latest row for a field decides who can see it. */
export type Audience = 'nobody' | 'coordinator' | 'neighbors';
export type ConsentField = 'firstName' | 'block' | 'contact' | 'rsvpName';
export type ConsentRow = { field: ConsentField; audience: Audience; at: string };

export const DEFAULT_AUDIENCE: Audience = 'nobody';

export function currentAudience(ledger: readonly ConsentRow[], field: ConsentField): Audience {
  let latest: ConsentRow | undefined;
  for (const row of ledger) {
    if (row.field === field && (!latest || row.at >= latest.at)) latest = row;
  }
  return latest ? latest.audience : DEFAULT_AUDIENCE;
}

export function canSee(ledger: readonly ConsentRow[], field: ConsentField, viewer: 'visitor' | 'neighbor' | 'coordinator'): boolean {
  const audience = currentAudience(ledger, field);
  if (audience === 'nobody') return false;
  if (audience === 'coordinator') return viewer === 'coordinator';
  return viewer === 'neighbor' || viewer === 'coordinator';
}

/** Totals with small numbers hidden, so no one can be picked out. */
export const SMALL_COUNT = 3;
export function safeCount(n: number): number | null {
  return n > 0 && n < SMALL_COUNT ? null : n;
}
