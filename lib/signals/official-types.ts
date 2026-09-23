import type { MarginMode, SignalLifecycleStatus } from "@/lib/signals-engine/types";

export const CALCULATION_VERSION = "pw-signals-v2";
export const OFFICIAL_SIGNALS_COLLECTION = "signalsOfficial";
export const LIFECYCLE_EVENTS_COLLECTION = "signalsLifecycleEvents";
export const OBSERVED_OUTCOMES_COLLECTION = "signalsObserved";
export const SCANNER_HEALTH_COLLECTION = "signalsHealth";
export const SCANNER_HEALTH_ID = "scanner";

export type OfficialSignal = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  interval: string;
  pattern: string;
  patternStatus: string;
  originalEntry: number;
  stop: number;
  target: number;
  openedAt: string;
  expiresAt: string;
  lastCandleCloseAt: string | null;
  entryConditions: string;
  quantity: number;
  marginUSDT: number;
  leverage: number;
  marginMode: MarginMode;
  totalFeesUSDT: number;
  notionalUSDT: number;
  requiredMarginUSDT: number;
  calculationVersion: string;
  lifecycleStatus: SignalLifecycleStatus;
  fillConfirmed: false;
  brokerageVerified: false;
  observedTrigger: boolean;
  snapshotFrozen: true;
  lastPrice: number | null;
  lastPriceAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  investigation?: {
    interval: string;
    qualityLabel?: string;
    supporting: string[];
    contradictory: string[];
    marketAtPublication: {
      price: number | null;
      volumeRatio?: number | null;
      btcTrend?: string | null;
      fundingRate?: number | null;
      openInterest?: number | null;
    };
  };
};

export type LifecycleEvent = {
  id: string;
  signalId: string;
  fromStatus: string;
  toStatus: SignalLifecycleStatus;
  at: string;
  price: number | null;
  priceUpdatedAt: string | null;
  note: string;
  fillConfirmed: false;
};

export type ObservedOutcome = {
  signalId: string;
  kind: SignalLifecycleStatus;
  at: string;
  price: number | null;
  fillConfirmed: false;
  brokerageVerified: false;
  hypotheticalGrossPnl: number | null;
  hypotheticalNetPnl: number | null;
};

export type ScannerHealth = {
  lastSuccessAt: string | null;
  lastPriceAt: string | null;
  lastScanAt: string | null;
  stale: boolean;
  error: string | null;
  monitoring: "running" | "idle" | "error" | "offline";
  writeErrors: number;
  lastWriteError: string | null;
  availablePairs: number;
  totalPairs: number;
  activeCount: number;
  expiredCount: number;
  backend: "file" | "firestore" | "hybrid";
  updatedAt: string;
  lastCycleAt?: string | null;
  lastCycleDurationMs?: number | null;
  lastFullUniverseAt?: string | null;
  lastFullUniverseDurationMs?: number | null;
  requestWeightUsed?: number | null;
  requestWeightLimit?: number;
  queueBacklog?: number;
  workerStatus?: "running" | "idle" | "error" | "offline" | "overlapping";
  freshCount?: number;
  staleCount?: number;
  failedCount?: number;
  pendingCount?: number;
  neverScannedCount?: number;
  validatedLong?: number;
  validatedShort?: number;
  waitCount?: number;
  rejectedCount?: number;
  cycleOverlapsBlocked?: number;
  coverageNote?: string;
};

export type OfficialStoreSnapshot = {
  signals: OfficialSignal[];
  events: LifecycleEvent[];
  outcomes: ObservedOutcome[];
  health: ScannerHealth;
};

export const TERMINAL_OFFICIAL: SignalLifecycleStatus[] = [
  "TARGET_HIT",
  "STOP_HIT",
  "EXPIRED",
  "INVALIDATED",
  "MISSED_ENTRY",
];

export function officialSignalId(input: {
  symbol: string;
  interval: string;
  direction: string;
  entry: number;
  openedAt: string;
}): string {
  return `${input.symbol}-${input.interval}-${input.direction}-${input.entry.toPrecision(8)}-${input.openedAt.slice(0, 16)}`;
}

export function eventId(signalId: string, toStatus: string, at: string): string {
  return `${signalId}-${toStatus}-${at}`;
}

export function emptyHealth(backend: ScannerHealth["backend"] = "file"): ScannerHealth {
  return {
    lastSuccessAt: null,
    lastPriceAt: null,
    lastScanAt: null,
    stale: false,
    error: null,
    monitoring: "offline",
    writeErrors: 0,
    lastWriteError: null,
    availablePairs: 0,
    totalPairs: 15,
    activeCount: 0,
    expiredCount: 0,
    backend,
    updatedAt: new Date().toISOString(),
  };
}
