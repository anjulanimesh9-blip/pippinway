import { buildSetup, isRrPublicationReject } from "./trading";
import type { CoinScan, PatternStatus, SignalLifecycle, SignalLifecycleStatus, TradeSetup } from "./types";

export const SIGNAL_TTL_MS = 4 * 60 * 60 * 1000;
export const ENTRY_ZONE_PCT = 0.0015;
export const MISS_PROGRESS = 0.35;
export const STILL_ACTIONABLE_PROGRESS = 0.15;

export const TERMINAL_STATUSES: SignalLifecycleStatus[] = [
  "TARGET_HIT",
  "STOP_HIT",
  "AMBIGUOUS",
  "EXPIRED",
  "INVALIDATED",
  "MISSED_ENTRY",
];

/** Outcomes that count toward official TARGET vs STOP win rate. */
export const RESOLVED_HIT_STATUSES: SignalLifecycleStatus[] = ["TARGET_HIT", "STOP_HIT"];

export function isTerminal(status: SignalLifecycleStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function isTriggeredOrActive(status: SignalLifecycleStatus): boolean {
  return status === "TRIGGERED" || status === "ACTIVE";
}

export function lifecycleLabel(status: SignalLifecycleStatus): string {
  switch (status) {
    case "WAITING_FOR_ENTRY":
      return "WAITING FOR ENTRY";
    case "TRIGGERED":
      return "TRIGGERED";
    case "ACTIVE":
      return "ACTIVE";
    case "TARGET_HIT":
      return "TARGET HIT";
    case "STOP_HIT":
      return "STOP HIT";
    case "AMBIGUOUS":
      return "AMBIGUOUS";
    case "EXPIRED":
      return "EXPIRED";
    case "INVALIDATED":
      return "INVALIDATED";
    case "MISSED_ENTRY":
      return "MISSED ENTRY";
    default:
      return status;
  }
}

export function inEntryZone(entry: number, price: number, tickSize = 0): boolean {
  const tolerance = Math.max(tickSize * 2, Math.abs(entry) * ENTRY_ZONE_PCT);
  return Math.abs(price - entry) <= tolerance;
}

export function progressToTarget(direction: "LONG" | "SHORT", entry: number, target: number, price: number): number {
  const span = Math.abs(target - entry);
  if (span <= 0) return 0;
  return direction === "LONG" ? (price - entry) / span : (entry - price) / span;
}

export function hitStop(direction: "LONG" | "SHORT", stop: number, price: number): boolean {
  return direction === "LONG" ? price <= stop : price >= stop;
}

export function hitTarget(direction: "LONG" | "SHORT", target: number, price: number): boolean {
  return direction === "LONG" ? price >= target : price <= target;
}

/**
 * Resolve TP/SL from a candle's high/low range.
 * If both are touched and order cannot be established → AMBIGUOUS.
 */
export function resolveOutcomeFromCandle(
  direction: "LONG" | "SHORT",
  stop: number,
  target: number,
  high: number,
  low: number,
): "TARGET_HIT" | "STOP_HIT" | "AMBIGUOUS" | null {
  if (!(Number.isFinite(high) && Number.isFinite(low))) return null;
  const stopHit = direction === "LONG" ? low <= stop : high >= stop;
  const targetHit = direction === "LONG" ? high >= target : low <= target;
  if (stopHit && targetHit) return "AMBIGUOUS";
  if (stopHit) return "STOP_HIT";
  if (targetHit) return "TARGET_HIT";
  return null;
}

export function createLifecycle(input: {
  originalEntry: number;
  openedAt: string;
  lastCandleCloseAt: string | null;
  entryConditions: string;
}): SignalLifecycle {
  const opened = Date.parse(input.openedAt);
  return {
    status: "WAITING_FOR_ENTRY",
    fillConfirmed: false,
    observedTrigger: false,
    seenAwayFromEntry: false,
    originalEntry: input.originalEntry,
    openedAt: input.openedAt,
    expiresAt: new Date(opened + SIGNAL_TTL_MS).toISOString(),
    lastCandleCloseAt: input.lastCandleCloseAt,
    triggerObservedAt: null,
    closedAt: null,
    note: "Manual signal. A price touch is an observed opportunity, not a confirmed fill.",
    nextStep: input.entryConditions,
  };
}

function close(lifecycle: SignalLifecycle, status: SignalLifecycleStatus, now: string, note: string, nextStep: string): SignalLifecycle {
  return {
    ...lifecycle,
    status,
    fillConfirmed: false,
    closedAt: now,
    note,
    nextStep,
  };
}

function closeHit(
  lifecycle: SignalLifecycle,
  status: "TARGET_HIT" | "STOP_HIT" | "AMBIGUOUS",
  now: string,
  extras?: Partial<Pick<SignalLifecycle, "observedTrigger" | "seenAwayFromEntry" | "triggerObservedAt">>,
): SignalLifecycle {
  const notes: Record<typeof status, { note: string; nextStep: string }> = {
    STOP_HIT: {
      note: "Stop level traded after an observed, unconfirmed entry. This is a price-path observation, not a brokerage fill.",
      nextStep: "Record as observed stop path only. Fill is unconfirmed.",
    },
    TARGET_HIT: {
      note: "Target level traded after an observed, unconfirmed entry. This is a price-path observation, not a brokerage fill.",
      nextStep: "Record as observed target path only. Fill is unconfirmed.",
    },
    AMBIGUOUS: {
      note: "Both stop and target traded inside the same candle; execution order cannot be established.",
      nextStep: "Do not count as a win or loss. Record as ambiguous only.",
    },
  };
  return close({ ...lifecycle, ...extras }, status, now, notes[status].note, notes[status].nextStep);
}

export function advanceLifecycle(input: {
  lifecycle: SignalLifecycle;
  direction: "LONG" | "SHORT";
  entry: number;
  stop: number;
  target: number;
  livePrice: number;
  now: string;
  /** Delisting / contract unavailable only — later WAIT/pattern scans must NOT invalidate. */
  delisted?: boolean;
  /** @deprecated Prefer delisted. Kept for call-site compatibility; ignored for pattern WAIT. */
  conditionsHold?: boolean;
  tickSize?: number;
  candleHigh?: number | null;
  candleLow?: number | null;
}): SignalLifecycle {
  const { lifecycle, direction, entry, stop, target, livePrice, now } = input;
  if (isTerminal(lifecycle.status)) return lifecycle;

  if (input.delisted) {
    return close(
      lifecycle,
      "INVALIDATED",
      now,
      "Contract is no longer an eligible TRADING USDT-M perpetual. Frozen entry/SL/TP were not rewritten.",
      "Stay flat. This is not a fresh executable trade.",
    );
  }

  // TRIGGERED / ACTIVE: never TTL-expire — wait for TARGET / STOP / AMBIGUOUS only.
  if (!isTriggeredOrActive(lifecycle.status) && Date.parse(now) >= Date.parse(lifecycle.expiresAt)) {
    return close(
      lifecycle,
      "EXPIRED",
      now,
      lifecycle.observedTrigger
        ? "Signal expired. An entry touch was observed, but no brokerage fill was confirmed."
        : "Signal expired before a usable entry opportunity was observed.",
      "Do not treat this as a live entry. Wait for a new closed-candle signal.",
    );
  }

  const nearEntry = inEntryZone(entry, livePrice, input.tickSize);
  const progress = progressToTarget(direction, entry, target, livePrice);
  let seenAway = lifecycle.seenAwayFromEntry || !nearEntry;
  let status = lifecycle.status;
  let observedTrigger = lifecycle.observedTrigger;
  let triggerObservedAt = lifecycle.triggerObservedAt;
  let note = lifecycle.note;
  let nextStep = lifecycle.nextStep;

  if (status === "WAITING_FOR_ENTRY") {
    if (progress >= MISS_PROGRESS && !nearEntry) {
      return close(
        lifecycle,
        "MISSED_ENTRY",
        now,
        "Price already moved too far beyond the original entry. This is a missed opportunity, not a filled trade.",
        "Do not chase. The original entry stands; it was not updated to the current price.",
      );
    }
    if (seenAway && nearEntry) {
      status = "TRIGGERED";
      observedTrigger = true;
      triggerObservedAt = now;
      note = "Price traded back through the original entry. This is an observed opportunity, not a confirmed order fill.";
      nextStep = "Manual entry only if the original conditions still hold. No order is sent.";
    } else {
      note = "Waiting for price to trade the original entry. Current ticker is not a new entry price.";
      nextStep = "Do not use the live price as a replacement entry.";
    }
  }

  if (status === "TRIGGERED" || status === "ACTIVE") {
    const high = input.candleHigh;
    const low = input.candleLow;
    if (high != null && low != null && Number.isFinite(high) && Number.isFinite(low)) {
      const fromCandle = resolveOutcomeFromCandle(direction, stop, target, high, low);
      if (fromCandle) {
        return closeHit(
          lifecycle,
          fromCandle,
          now,
          { observedTrigger, seenAwayFromEntry: seenAway, triggerObservedAt },
        );
      }
    } else {
      // Snapshot fallback when candle range is unavailable.
      const stopNow = hitStop(direction, stop, livePrice);
      const targetNow = hitTarget(direction, target, livePrice);
      if (stopNow && targetNow) {
        return closeHit(lifecycle, "AMBIGUOUS", now, { observedTrigger, seenAwayFromEntry: seenAway, triggerObservedAt });
      }
      if (stopNow) {
        return closeHit(lifecycle, "STOP_HIT", now, { observedTrigger, seenAwayFromEntry: seenAway, triggerObservedAt });
      }
      if (targetNow) {
        return closeHit(lifecycle, "TARGET_HIT", now, { observedTrigger, seenAwayFromEntry: seenAway, triggerObservedAt });
      }
    }
    if (status === "TRIGGERED" && nearEntry) {
      note = "Price traded back through the original entry. This is an observed opportunity, not a confirmed order fill.";
      nextStep = "Manual entry only if the original conditions still hold. No order is sent.";
    } else {
      status = "ACTIVE";
      note = "Price is between the original stop and target. Fill remains unconfirmed because no order was sent.";
      nextStep = "Manage only if you actually filled. Otherwise treat this as an observed path.";
    }
  }

  return {
    ...lifecycle,
    status,
    observedTrigger,
    seenAwayFromEntry: seenAway,
    triggerObservedAt,
    note,
    nextStep,
    fillConfirmed: false,
  };
}

export function lifecycleAllowsFreshEntry(lifecycle: SignalLifecycle | null | undefined, livePrice: number, setup: TradeSetup | null): boolean {
  if (!lifecycle || !setup) return false;
  if (isTerminal(lifecycle.status)) return false;
  if (lifecycle.status === "ACTIVE") return false;
  if (lifecycle.status === "WAITING_FOR_ENTRY") return true;
  if (lifecycle.status === "TRIGGERED") {
    return progressToTarget(setup.direction === "SHORT" ? "SHORT" : "LONG", setup.entry, setup.target, livePrice) <= STILL_ACTIONABLE_PROGRESS;
  }
  return false;
}

export type PublishedSignal = {
  symbol: string;
  direction: "LONG" | "SHORT";
  entry: number;
  stop: number;
  target: number;
  lifecycle: SignalLifecycle;
  lastCandleCloseAt: string | null;
  pattern: string;
  patternStatus: PatternStatus;
  entryConditions: string;
  reason: string;
  nextStep: string;
};

export function publishedFromCoin(coin: CoinScan): PublishedSignal | null {
  if (coin.direction === "WAIT" || !coin.setup) return null;
  return {
    symbol: coin.symbol,
    direction: coin.direction,
    entry: coin.setup.entry,
    stop: coin.setup.stop,
    target: coin.setup.target,
    lifecycle: coin.lifecycle || createLifecycle({
      originalEntry: coin.setup.entry,
      openedAt: coin.analyzedAt,
      lastCandleCloseAt: coin.lastCandleCloseAt,
      entryConditions: coin.entryConditions,
    }),
    lastCandleCloseAt: coin.lastCandleCloseAt,
    pattern: coin.pattern,
    patternStatus: coin.patternStatus,
    entryConditions: coin.entryConditions,
    reason: coin.reason,
    nextStep: coin.nextStep,
  };
}

function applyLifecycleFinance(_coin: CoinScan, setup: TradeSetup, lifecycle: SignalLifecycle, livePrice: number): TradeSetup {
  const allows = lifecycleAllowsFreshEntry(lifecycle, livePrice, setup);
  const financeOk = setup.validationReasons.length === 0;
  const nextExecutable = Boolean(allows && financeOk);
  const reasons = [...setup.validationReasons];
  if (!allows) {
    reasons.unshift(
      isTerminal(lifecycle.status)
        ? `${lifecycleLabel(lifecycle.status)}: not a fresh executable trade.`
        : "Entry is no longer actionable at the original price. Fill was never confirmed.",
    );
  }
  return {
    ...setup,
    executable: nextExecutable,
    executableReason: nextExecutable
      ? setup.executableReason
      : `NOT EXECUTABLE: ${reasons[0] || lifecycle.note}`,
    validationReasons: nextExecutable ? setup.validationReasons : reasons,
  };
}

function sameFrozenSetup(fresh: CoinScan, previous: PublishedSignal): boolean {
  if (fresh.direction === "WAIT" || !fresh.setup) return false;
  return (
    fresh.direction === previous.direction
    && fresh.setup.entry === previous.entry
    && fresh.setup.stop === previous.stop
    && fresh.setup.target === previous.target
  );
}

export function reconcilePublishedSignal(
  fresh: CoinScan,
  previous: PublishedSignal | null,
  now = new Date().toISOString(),
): { coin: CoinScan; published: PublishedSignal | null } {
  if (!fresh.available || fresh.error || fresh.price == null) {
    return { coin: { ...fresh, lifecycle: previous?.lifecycle }, published: previous };
  }

  if (previous) {
    // Terminal official signal: never overwrite outcome. Allow a genuinely NEW setup only.
    if (isTerminal(previous.lifecycle.status)) {
      if (sameFrozenSetup(fresh, previous)) {
        const rebuilt = fresh.filters
          ? buildSetup({
              direction: previous.direction,
              entry: previous.entry,
              stop: previous.stop,
              target: previous.target,
              filters: fresh.filters,
            })
          : fresh.setup;
        const setup = rebuilt
          ? applyLifecycleFinance({ ...fresh, direction: previous.direction, setup: rebuilt }, rebuilt, previous.lifecycle, fresh.price)
          : null;
        return {
          coin: {
            ...fresh,
            direction: previous.direction,
            pattern: previous.pattern,
            patternStatus: previous.patternStatus,
            setup,
            originalEntry: previous.entry,
            lifecycle: previous.lifecycle,
            entryConditions: previous.entryConditions,
            reason: previous.lifecycle.note,
            nextStep: previous.lifecycle.nextStep,
            analyzedAt: previous.lifecycle.openedAt,
          },
          published: null,
        };
      }
      // Fall through to publish a new signal only when levels/direction differ.
    } else {
      // Keep advancing the frozen published signal. Later WAIT / opposite pattern does NOT invalidate.
      const advanced = advanceLifecycle({
        lifecycle: previous.lifecycle,
        direction: previous.direction,
        entry: previous.entry,
        stop: previous.stop,
        target: previous.target,
        livePrice: fresh.price,
        now,
        delisted: false,
        tickSize: fresh.setup?.tickSize || fresh.filters?.tickSize,
      });
      const rebuilt = fresh.filters
        ? buildSetup({
            direction: previous.direction,
            entry: previous.entry,
            stop: previous.stop,
            target: previous.target,
            filters: fresh.filters,
          })
        : fresh.setup;
      const setup = rebuilt
        ? applyLifecycleFinance({ ...fresh, direction: previous.direction, setup: rebuilt }, rebuilt, advanced, fresh.price)
        : null;
      const published: PublishedSignal = {
        ...previous,
        lifecycle: advanced,
        nextStep: advanced.nextStep,
      };
      return {
        coin: {
          ...fresh,
          direction: previous.direction,
          pattern: previous.pattern,
          patternStatus: previous.patternStatus,
          setup,
          originalEntry: previous.entry,
          lifecycle: advanced,
          entryConditions: previous.entryConditions,
          reason: isTerminal(advanced.status) ? advanced.note : (isRrPublicationReject(fresh.reason) ? previous.reason : fresh.reason),
          nextStep: advanced.nextStep,
          analyzedAt: previous.lifecycle.openedAt,
        },
        // Always return published through terminal so persistReconcile can store the outcome.
        published,
      };
    }
  }

  if (fresh.direction === "WAIT" || !fresh.setup) {
    return { coin: { ...fresh, lifecycle: undefined, originalEntry: undefined }, published: null };
  }

  const opened = createLifecycle({
    originalEntry: fresh.setup.entry,
    openedAt: fresh.analyzedAt,
    lastCandleCloseAt: fresh.lastCandleCloseAt,
    entryConditions: fresh.entryConditions,
  });
  const started = advanceLifecycle({
    lifecycle: opened,
    direction: fresh.direction,
    entry: fresh.setup.entry,
    stop: fresh.setup.stop,
    target: fresh.setup.target,
    livePrice: fresh.price,
    now,
    delisted: false,
    tickSize: fresh.setup.tickSize,
  });
  const setup = applyLifecycleFinance(fresh, fresh.setup, started, fresh.price);
  const published = publishedFromCoin({
    ...fresh,
    setup,
    lifecycle: started,
    originalEntry: fresh.setup.entry,
  });
  return {
    coin: {
      ...fresh,
      setup,
      lifecycle: started,
      originalEntry: fresh.setup.entry,
      nextStep: started.nextStep,
    },
    published,
  };
}
