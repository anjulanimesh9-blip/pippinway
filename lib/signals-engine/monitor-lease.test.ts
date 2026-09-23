import { describe, expect, it, beforeEach } from 'vitest';
import { overlapCount, releaseLease, resetLease, tryAcquireLease } from './monitor-lease';

describe('monitor lease', () => {
  beforeEach(() => resetLease());

  it('prevents overlapping cycles from a second owner', () => {
    const first = tryAcquireLease('worker-a', 5_000, 1_000);
    expect(first.acquired).toBe(true);
    const second = tryAcquireLease('worker-b', 5_000, 1_100);
    expect(second.acquired).toBe(false);
    if (!second.acquired) expect(second.reason).toBe('overlap');
    expect(overlapCount()).toBe(1);
    expect(releaseLease('worker-a')).toBe(true);
    const third = tryAcquireLease('worker-b', 5_000, 1_200);
    expect(third.acquired).toBe(true);
  });

  it('recovers after the lease expires so a restarted worker can continue', () => {
    expect(tryAcquireLease('old', 1_000, 10_000).acquired).toBe(true);
    const recovered = tryAcquireLease('new', 1_000, 11_001);
    expect(recovered.acquired).toBe(true);
    if (recovered.acquired) expect(recovered.state.owner).toBe('new');
  });

  it('does not let the same owner start a second in-flight cycle', () => {
    expect(tryAcquireLease('solo', 5_000, 1_000).acquired).toBe(true);
    expect(tryAcquireLease('solo', 5_000, 1_100).acquired).toBe(false);
  });
});
