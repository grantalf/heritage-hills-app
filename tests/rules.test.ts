import assert from 'node:assert/strict';
import { test } from 'node:test';

import { canApprove, canSee, currentAudience, isHiddenByReports, safeCount, type ConsentRow, type PendingAction } from '../src/lib/rules';

test('one report does not hide an item, two different reporters do', () => {
  assert.equal(isHiddenByReports('x', [{ itemId: 'x', reporterId: 'a' }]), false);
  assert.equal(
    isHiddenByReports('x', [
      { itemId: 'x', reporterId: 'a' },
      { itemId: 'x', reporterId: 'b' },
    ]),
    true,
  );
});

test('the same person reporting twice counts once', () => {
  assert.equal(
    isHiddenByReports('x', [
      { itemId: 'x', reporterId: 'a' },
      { itemId: 'x', reporterId: 'a' },
    ]),
    false,
  );
});

test('reports on other items do not count', () => {
  assert.equal(
    isHiddenByReports('x', [
      { itemId: 'x', reporterId: 'a' },
      { itemId: 'y', reporterId: 'b' },
    ]),
    false,
  );
});

const action: PendingAction = { id: '1', kind: 'send-alert', requestedBy: 'pat', requestedAt: '2026-11-16T10:00:00.000Z' };
const soon = new Date('2026-11-16T12:00:00.000Z');

test('the requester cannot approve their own action', () => {
  assert.equal(canApprove(action, 'pat', true, soon), false);
});

test('a different person with a role can approve', () => {
  assert.equal(canApprove(action, 'sam', true, soon), true);
});

test('a person without a role cannot approve', () => {
  assert.equal(canApprove(action, 'sam', false, soon), false);
});

test('an action cannot be approved twice', () => {
  assert.equal(canApprove({ ...action, approvedBy: 'sam' }, 'lee', true, soon), false);
});

test('a pending action expires after 72 hours', () => {
  assert.equal(canApprove(action, 'sam', true, new Date('2026-11-19T09:59:00.000Z')), true);
  assert.equal(canApprove(action, 'sam', true, new Date('2026-11-19T10:01:00.000Z')), false);
});

test('nothing is shared by default', () => {
  assert.equal(currentAudience([], 'firstName'), 'nobody');
  assert.equal(canSee([], 'firstName', 'neighbor'), false);
  assert.equal(canSee([], 'contact', 'coordinator'), false);
});

test('the latest consent choice wins and can be turned off again', () => {
  const ledger: ConsentRow[] = [
    { field: 'firstName', audience: 'neighbors', at: '2026-11-01T00:00:00.000Z' },
    { field: 'firstName', audience: 'nobody', at: '2026-11-02T00:00:00.000Z' },
    { field: 'block', audience: 'coordinator', at: '2026-11-02T00:00:00.000Z' },
  ];
  assert.equal(currentAudience(ledger, 'firstName'), 'nobody');
  assert.equal(canSee(ledger, 'firstName', 'neighbor'), false);
  assert.equal(canSee(ledger, 'block', 'coordinator'), true);
  assert.equal(canSee(ledger, 'block', 'neighbor'), false);
});

test('visitors never see personal fields', () => {
  const ledger: ConsentRow[] = [{ field: 'firstName', audience: 'neighbors', at: '2026-11-01T00:00:00.000Z' }];
  assert.equal(canSee(ledger, 'firstName', 'visitor'), false);
  assert.equal(canSee(ledger, 'firstName', 'neighbor'), true);
});

test('small counts are hidden', () => {
  assert.equal(safeCount(0), 0);
  assert.equal(safeCount(1), null);
  assert.equal(safeCount(2), null);
  assert.equal(safeCount(3), 3);
});
