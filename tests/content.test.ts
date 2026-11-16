import assert from 'node:assert/strict';
import { test } from 'node:test';

import * as content from '../src/lib/data/content';
import * as game from '../src/lib/data/game-content';
import type { L } from '../src/lib/data/types';
import { en } from '../src/lib/i18n/en';
import { es } from '../src/lib/i18n/es';

test('Spanish has exactly the same interface keys as English', () => {
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
});

test('no interface text is empty', () => {
  for (const [key, value] of [...Object.entries(en), ...Object.entries(es)]) {
    assert.ok(value.trim().length > 0, `empty text for ${key}`);
  }
});

test('placeholders like {count} match between languages', () => {
  const holes = (text: string) => (text.match(/\{[a-z]+\}/g) ?? []).sort().join(',');
  for (const key of Object.keys(en) as (keyof typeof en)[]) {
    assert.equal(holes(es[key]), holes(en[key]), `placeholders differ for ${key}`);
  }
});

/** Walks any value and collects every bilingual text object. */
function collect(value: unknown, path: string, out: { path: string; text: L }[]) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((v, i) => collect(v, `${path}[${i}]`, out));
    return;
  }
  const obj = value as Record<string, unknown>;
  if (typeof obj.en === 'string' && 'es' in obj) {
    out.push({ path, text: obj as unknown as L });
    return;
  }
  for (const [k, v] of Object.entries(obj)) collect(v, `${path}.${k}`, out);
}

test('every piece of content has English and Spanish', () => {
  const now = new Date('2026-11-16T12:00:00.000Z');
  const all = {
    alerts: content.buildAlerts(now),
    events: content.buildEvents(now),
    invites: content.buildInvites(now),
    polls: content.buildPolls(now),
    articles: content.articles,
    monthTips: content.monthTips,
    resources: content.resources,
    helpIdeas: content.helpIdeas,
    shareItems: content.shareItems,
    opportunities: content.opportunities,
    decisions: content.sampleDecisions,
    stats: content.statMeasures,
    capital: content.capitalMeasures,
    gardenFacts: content.gardenFacts,
    gardenSteps: content.gardenSteps,
    offices: content.offices,
    docs: content.associationDocs,
    critters: game.critters,
    pets: game.samplePets,
    mysteries: game.mysteries,
    bingo: game.bingoCards,
  };
  const found: { path: string; text: L }[] = [];
  collect(all, 'content', found);
  assert.ok(found.length > 200, 'expected plenty of content');
  for (const { path, text } of found) {
    assert.ok(text.en.trim().length > 0, `missing English at ${path}`);
    assert.ok(typeof text.es === 'string' && text.es.trim().length > 0, `missing Spanish at ${path}`);
  }
});

test('every month has stewardship tips', () => {
  for (let month = 1; month <= 12; month++) {
    assert.ok(content.monthTips.filter((t) => t.month === month).length >= 3, `month ${month}`);
  }
});

test('every resource has a secure official link and a checked date', () => {
  for (const r of content.resources) {
    assert.match(r.url, /^https:\/\//, r.id);
    assert.match(r.verifiedOn, /^\d{4}-\d{2}(-\d{2})?$/, r.id);
  }
});

test('invented items are labeled as samples', () => {
  const now = new Date();
  for (const item of [...content.buildAlerts(now), ...content.buildEvents(now), ...content.buildInvites(now), ...content.buildPolls(now), ...content.shareItems, ...content.opportunities, ...content.capitalMeasures]) {
    assert.equal(item.sample, true, `${item.id} must be labeled sample`);
  }
});

test('ecosystem articles stay drafts until someone records a check date', () => {
  for (const a of content.articles) {
    if (a.status === 'verified') assert.ok(a.verifiedOn && a.sourceUrl, `${a.id} is marked verified without a source and date`);
  }
});

test('sample content never uses a real-looking phone number', () => {
  for (const e of content.buildEvents(new Date())) {
    if (e.phone) assert.match(e.phone, /^\d{3}-555-01\d{2}$/, 'sample phone numbers must use the reserved 555-01xx range');
  }
});
