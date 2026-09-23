import { promises as fs } from 'fs';
import path from 'path';
import { PROCESS_ID } from './scan-job-persist';

export const DEFAULT_LEASE_TTL_MS = 55_000;

export type LeaseState = {
  owner: string;
  cycleId: string;
  acquiredAt: string;
  expiresAt: number;
};

export type AcquireResult =
  | { acquired: true; state: LeaseState }
  | { acquired: false; reason: 'overlap'; state: LeaseState };

let current: LeaseState | null = null;
let overlapsBlocked = 0;

function leasePath() {
  return path.join(process.cwd(), 'data', 'monitor-lease.json');
}

export function resetLease() {
  current = null;
  overlapsBlocked = 0;
}

export function leaseSnapshot() {
  return current ? { ...current } : null;
}

export function overlapCount() {
  return overlapsBlocked;
}

export function tryAcquireLease(owner = PROCESS_ID, ttlMs = DEFAULT_LEASE_TTL_MS, now = Date.now()): AcquireResult {
  if (current && current.expiresAt > now && current.owner !== owner) {
    overlapsBlocked += 1;
    return { acquired: false, reason: 'overlap', state: current };
  }
  if (current && current.expiresAt > now && current.owner === owner) {
    overlapsBlocked += 1;
    return { acquired: false, reason: 'overlap', state: current };
  }
  current = {
    owner,
    cycleId: `${owner}-${now}`,
    acquiredAt: new Date(now).toISOString(),
    expiresAt: now + ttlMs,
  };
  return { acquired: true, state: current };
}

export function renewLease(owner: string, ttlMs = DEFAULT_LEASE_TTL_MS, now = Date.now()): boolean {
  if (!current || current.owner !== owner) return false;
  current.expiresAt = now + ttlMs;
  return true;
}

export function releaseLease(owner: string): boolean {
  if (!current || current.owner !== owner) return false;
  current = null;
  return true;
}

export async function persistLease(): Promise<void> {
  await fs.mkdir(path.dirname(leasePath()), { recursive: true });
  await fs.writeFile(leasePath(), JSON.stringify({ current, overlapsBlocked, savedAt: new Date().toISOString() }));
}

export async function restoreLease(now = Date.now()): Promise<LeaseState | null> {
  try {
    const raw = await fs.readFile(leasePath(), 'utf8');
    const parsed = JSON.parse(raw) as { current?: LeaseState | null; overlapsBlocked?: number };
    if (typeof parsed.overlapsBlocked === 'number') overlapsBlocked = parsed.overlapsBlocked;
    if (parsed.current && parsed.current.expiresAt > now) {
      current = parsed.current;
      return current;
    }
    current = null;
    return null;
  } catch {
    return null;
  }
}
