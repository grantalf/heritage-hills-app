/**
 * Tamper-evident record (see docs/SECURITY.md section 7).
 * Each entry stores a fingerprint of its own content plus the previous entry's
 * fingerprint. Changing or removing any past entry breaks the chain, and anyone
 * can check it. This gives the transparency goals of a DAO with no blockchain,
 * wallets or tokens.
 */
import { sha256 } from './sha256';

export type RecordEntry<T> = {
  index: number;
  at: string; // ISO date-time
  content: T;
  prevHash: string;
  hash: string;
};

export const GENESIS_HASH = '0'.repeat(64);

/** Stable text form: object keys are sorted so the same content always hashes the same. */
export function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const obj = value as Record<string, unknown>;
  return (
    '{' +
    Object.keys(obj)
      .filter((k) => obj[k] !== undefined)
      .sort()
      .map((k) => JSON.stringify(k) + ':' + canonical(obj[k]))
      .join(',') +
    '}'
  );
}

export function hashEntry<T>(index: number, at: string, content: T, prevHash: string): string {
  return sha256(canonical({ index, at, content, prevHash }));
}

/** Returns a new chain with the entry added. The input chain is never changed. */
export function appendEntry<T>(chain: readonly RecordEntry<T>[], content: T, at: string): RecordEntry<T>[] {
  const prevHash = chain.length ? chain[chain.length - 1].hash : GENESIS_HASH;
  const index = chain.length;
  return [...chain, { index, at, content, prevHash, hash: hashEntry(index, at, content, prevHash) }];
}

export type VerifyResult = { ok: true; count: number; head: string } | { ok: false; brokenAt: number };

export function verifyChain<T>(chain: readonly RecordEntry<T>[]): VerifyResult {
  let prev = GENESIS_HASH;
  for (let i = 0; i < chain.length; i++) {
    const e = chain[i];
    if (e.index !== i || e.prevHash !== prev || e.hash !== hashEntry(e.index, e.at, e.content, e.prevHash)) {
      return { ok: false, brokenAt: i };
    }
    prev = e.hash;
  }
  return { ok: true, count: chain.length, head: prev };
}
