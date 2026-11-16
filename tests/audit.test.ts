import assert from 'node:assert/strict';
import { test } from 'node:test';

import { appendEntry, canonical, GENESIS_HASH, verifyChain, type RecordEntry } from '../src/lib/audit';
import { sha256 } from '../src/lib/sha256';

test('sha256 matches published test vectors', () => {
  assert.equal(sha256(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(
    sha256('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'),
    '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
  );
});

test('sha256 matches Node for long and non-English text', async () => {
  const { createHash } = await import('node:crypto');
  const samples = ['Reunión de la asociación — ¿Va a venir?', 'حديقة الحي', '🌻'.repeat(40), 'x'.repeat(1000)];
  for (const text of samples) {
    assert.equal(sha256(text), createHash('sha256').update(text, 'utf8').digest('hex'));
  }
});

test('canonical form ignores key order', () => {
  assert.equal(canonical({ b: 1, a: { d: 2, c: 3 } }), canonical({ a: { c: 3, d: 2 }, b: 1 }));
});

function sampleChain(): RecordEntry<{ text: string }>[] {
  let chain: RecordEntry<{ text: string }>[] = [];
  chain = appendEntry(chain, { text: 'first' }, '2026-01-01T00:00:00.000Z');
  chain = appendEntry(chain, { text: 'second' }, '2026-02-01T00:00:00.000Z');
  chain = appendEntry(chain, { text: 'third' }, '2026-03-01T00:00:00.000Z');
  return chain;
}

test('an untouched record verifies', () => {
  const chain = sampleChain();
  const result = verifyChain(chain);
  assert.equal(result.ok, true);
  assert.equal(chain[0].prevHash, GENESIS_HASH);
  if (result.ok) {
    assert.equal(result.count, 3);
    assert.equal(result.head, chain[2].hash);
  }
});

test('an empty record verifies', () => {
  assert.deepEqual(verifyChain([]), { ok: true, count: 0, head: GENESIS_HASH });
});

test('editing a past entry is detected', () => {
  const chain = sampleChain();
  const tampered = chain.map((e, i) => (i === 1 ? { ...e, content: { text: 'changed' } } : e));
  assert.deepEqual(verifyChain(tampered), { ok: false, brokenAt: 1 });
});

test('removing an entry is detected', () => {
  const chain = sampleChain();
  assert.deepEqual(verifyChain([chain[0], chain[2]]), { ok: false, brokenAt: 1 });
});

test('re-hashing one edited entry still breaks the next one', () => {
  const chain = sampleChain();
  const forged = appendEntry([chain[0]], { text: 'forged' }, chain[1].at)[1];
  assert.deepEqual(verifyChain([chain[0], forged, chain[2]]), { ok: false, brokenAt: 2 });
});

test('appending does not change the earlier chain', () => {
  const chain = sampleChain();
  const copy = JSON.stringify(chain);
  appendEntry(chain, { text: 'fourth' }, '2026-04-01T00:00:00.000Z');
  assert.equal(JSON.stringify(chain), copy);
});
