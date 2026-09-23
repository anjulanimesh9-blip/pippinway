import { promises as fs } from "fs";
import path from "path";
import type { PublishedSignal } from "@/lib/signals-engine/lifecycle";
import { SIGNAL_TTL_MS } from "@/lib/signals-engine/lifecycle";
import type { CoinScan, SignalLifecycleStatus } from "@/lib/signals-engine/types";
import {
  loadRemoteSnapshot,
  mergeOfficialSnapshots,
  resolveOfficialRemote,
  type OfficialRemote,
} from "@/lib/signals/firestore-official";
import {
  CALCULATION_VERSION,
  TERMINAL_OFFICIAL,
  emptyHealth,
  eventId,
  officialSignalId,
  type LifecycleEvent,
  type ObservedOutcome,
  type OfficialSignal,
  type OfficialStoreSnapshot,
  type ScannerHealth,
} from "@/lib/signals/official-types";

const FROZEN: Array<keyof OfficialSignal> = [
  "id",
  "symbol",
  "direction",
  "interval",
  "originalEntry",
  "stop",
  "target",
  "openedAt",
  "quantity",
  "marginUSDT",
  "leverage",
  "marginMode",
  "totalFeesUSDT",
  "notionalUSDT",
  "requiredMarginUSDT",
  "calculationVersion",
  "snapshotFrozen",
  "fillConfirmed",
  "brokerageVerified",
];

function defaultPath() {
  return path.join(process.cwd(), "data", "signals-official.json");
}

function emptySnapshot(backend: ScannerHealth["backend"] = "file"): OfficialStoreSnapshot {
  return { signals: [], events: [], outcomes: [], health: emptyHealth(backend) };
}

export class OfficialSignalStore {
  private filePath: string;
  private memory: OfficialStoreSnapshot | null = null;
  private writeQueue: Promise<void> = Promise.resolve();
  private remoteOption: OfficialRemote | null | undefined;
  writeErrors = 0;
  lastWriteError: string | null = null;

  constructor(filePath = defaultPath(), remote: OfficialRemote | null | undefined = undefined) {
    this.filePath = filePath;
    this.remoteOption = remote;
  }

  private remote(): OfficialRemote | null {
    if (this.remoteOption === undefined) this.remoteOption = resolveOfficialRemote();
    return this.remoteOption;
  }

  private backendLabel(): ScannerHealth["backend"] {
    return this.remote() ? "hybrid" : "file";
  }

  private async withRemote<T>(work: (remote: OfficialRemote) => Promise<T>): Promise<T | undefined> {
    const remote = this.remote();
    if (!remote) return undefined;
    try {
      return await work(remote);
    } catch (error) {
      this.writeErrors += 1;
      this.lastWriteError = error instanceof Error ? error.message : "Firestore write failed";
      return undefined;
    }
  }

  async load(): Promise<OfficialStoreSnapshot> {
    if (this.memory) return this.memory;
    let local = emptySnapshot();
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as OfficialStoreSnapshot;
      local = {
        signals: parsed.signals || [],
        events: parsed.events || [],
        outcomes: parsed.outcomes || [],
        health: parsed.health || emptyHealth("file"),
      };
    } catch {
      local = emptySnapshot();
    }
    const remote = this.remote();
    if (remote) {
      try {
        const snapshot = await loadRemoteSnapshot(remote);
        local = mergeOfficialSnapshots(local, snapshot);
        local.health = { ...local.health, backend: "hybrid" };
      } catch (error) {
        this.writeErrors += 1;
        this.lastWriteError = error instanceof Error ? error.message : "Firestore hydrate failed";
        local.health = { ...local.health, backend: "file", lastWriteError: this.lastWriteError, writeErrors: this.writeErrors };
      }
    }
    this.memory = local;
    return this.memory;
  }

  async save(): Promise<void> {
    const data = await this.load();
    this.writeQueue = this.writeQueue.then(async () => {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
    });
    try {
      await this.writeQueue;
    } catch (error) {
      this.writeErrors += 1;
      this.lastWriteError = error instanceof Error ? error.message : "Write failed";
      throw error;
    }
  }

  resetMemory() {
    this.memory = null;
  }

  async listSignals(): Promise<OfficialSignal[]> {
    return (await this.load()).signals;
  }

  async listActive(): Promise<OfficialSignal[]> {
    return (await this.listSignals()).filter((item) => !TERMINAL_OFFICIAL.includes(item.lifecycleStatus));
  }

  async get(id: string): Promise<OfficialSignal | undefined> {
    return (await this.listSignals()).find((item) => item.id === id);
  }

  async eventsFor(signalId: string): Promise<LifecycleEvent[]> {
    return (await this.load()).events.filter((item) => item.signalId === signalId);
  }

  async outcomes(): Promise<ObservedOutcome[]> {
    return (await this.load()).outcomes;
  }

  async health(): Promise<ScannerHealth> {
    return (await this.load()).health;
  }

  async upsertCreate(record: OfficialSignal): Promise<{ created: boolean; record: OfficialSignal }> {
    const store = await this.load();
    const existing = store.signals.find((item) => item.id === record.id);
    if (existing) return { created: false, record: existing };
    const remoteRecord = await this.withRemote((remote) => remote.createSignal(record));
    const kept = remoteRecord || record;
    if (store.signals.some((item) => item.id === kept.id)) {
      return { created: false, record: store.signals.find((item) => item.id === kept.id)! };
    }
    store.signals.unshift(kept);
    store.signals = store.signals.slice(0, 2000);
    await this.save();
    return { created: true, record: kept };
  }

  async updateLifecycle(input: {
    id: string;
    status: SignalLifecycleStatus;
    observedTrigger: boolean;
    lastPrice: number | null;
    lastPriceAt: string | null;
    closedAt?: string | null;
    note: string;
  }): Promise<{ changed: boolean; record: OfficialSignal | undefined; event?: LifecycleEvent }> {
    const store = await this.load();
    const current = store.signals.find((item) => item.id === input.id);
    if (!current) return { changed: false, record: undefined };
    if (current.lifecycleStatus === input.status && current.lastPrice === input.lastPrice) {
      current.lastPriceAt = input.lastPriceAt;
      current.updatedAt = new Date().toISOString();
      await this.save();
      return { changed: false, record: current };
    }
    const fromStatus = current.lifecycleStatus;
    current.lifecycleStatus = input.status;
    current.observedTrigger = input.observedTrigger;
    current.lastPrice = input.lastPrice;
    current.lastPriceAt = input.lastPriceAt;
    current.closedAt = input.closedAt ?? current.closedAt;
    current.updatedAt = new Date().toISOString();
    current.fillConfirmed = false;
    current.brokerageVerified = false;
    let event: LifecycleEvent | undefined;
    if (fromStatus !== input.status) {
      event = {
        id: eventId(current.id, input.status, current.updatedAt),
        signalId: current.id,
        fromStatus,
        toStatus: input.status,
        at: current.updatedAt,
        price: input.lastPrice,
        priceUpdatedAt: input.lastPriceAt,
        note: input.note,
        fillConfirmed: false,
      };
      if (!store.events.some((item) => item.id === event!.id)) {
        store.events.unshift(event);
        store.events = store.events.slice(0, 8000);
        await this.withRemote((remote) => remote.createEvent(event!));
      }
    }
    await this.withRemote((remote) =>
      remote.patchSignal(current.id, {
        lifecycleStatus: current.lifecycleStatus,
        observedTrigger: current.observedTrigger,
        lastPrice: current.lastPrice,
        lastPriceAt: current.lastPriceAt,
        closedAt: current.closedAt,
        updatedAt: current.updatedAt,
      }),
    );
    await this.save();
    return { changed: fromStatus !== input.status, record: current, event };
  }

  async recordOutcome(outcome: ObservedOutcome): Promise<{ created: boolean }> {
    const store = await this.load();
    if (store.outcomes.some((item) => item.signalId === outcome.signalId && item.kind === outcome.kind)) {
      return { created: false };
    }
    store.outcomes.unshift(outcome);
    store.outcomes = store.outcomes.slice(0, 2000);
    await this.withRemote((remote) => remote.createOutcome(outcome));
    await this.save();
    return { created: true };
  }

  async setHealth(patch: Partial<ScannerHealth>): Promise<ScannerHealth> {
    const store = await this.load();
    store.health = {
      ...store.health,
      ...patch,
      writeErrors: this.writeErrors,
      lastWriteError: this.lastWriteError,
      backend: this.backendLabel(),
      updatedAt: new Date().toISOString(),
    };
    await this.withRemote((remote) => remote.setHealth(store.health));
    await this.save();
    return store.health;
  }

  frozenFieldsIntact(original: OfficialSignal, next: OfficialSignal): boolean {
    return FROZEN.every((key) => original[key] === next[key]);
  }
}

const defaultStore = new OfficialSignalStore();

export function getOfficialStore() {
  return defaultStore;
}

export function officialFromPublished(coin: CoinScan, published: PublishedSignal): OfficialSignal {
  const openedAt = published.lifecycle.openedAt;
  const setup = coin.setup;
  return {
    id: officialSignalId({
      symbol: published.symbol,
      interval: "15m",
      direction: published.direction,
      entry: published.entry,
      openedAt,
    }),
    symbol: published.symbol,
    direction: published.direction,
    interval: "15m",
    pattern: published.pattern,
    patternStatus: published.patternStatus,
    originalEntry: published.entry,
    stop: published.stop,
    target: published.target,
    openedAt,
    expiresAt: published.lifecycle.expiresAt || new Date(Date.parse(openedAt) + SIGNAL_TTL_MS).toISOString(),
    lastCandleCloseAt: published.lastCandleCloseAt,
    entryConditions: published.entryConditions,
    quantity: setup?.quantity ?? 0,
    marginUSDT: setup?.allocatedMarginUSDT ?? setup?.marginUSDT ?? 0,
    leverage: setup?.leverage ?? 20,
    marginMode: setup?.marginMode ?? "ISOLATED",
    totalFeesUSDT: setup?.totalFeesUSDT ?? setup?.estimatedFeesUSDT ?? 0,
    notionalUSDT: setup?.notionalUSDT ?? 0,
    requiredMarginUSDT: setup?.requiredMarginUSDT ?? 0,
    calculationVersion: CALCULATION_VERSION,
    lifecycleStatus: published.lifecycle.status,
    fillConfirmed: false,
    brokerageVerified: false,
    observedTrigger: published.lifecycle.observedTrigger,
    snapshotFrozen: true,
    lastPrice: coin.price,
    lastPriceAt: coin.priceUpdatedAt,
    closedAt: published.lifecycle.closedAt,
    createdAt: openedAt,
    updatedAt: new Date().toISOString(),
    investigation: {
      interval: "15m",
      qualityLabel: coin.quality?.label,
      supporting: coin.quality?.supporting || [],
      contradictory: coin.quality?.contradictory || [],
      marketAtPublication: {
        price: coin.price,
        volumeRatio: coin.timeframes.find((item) => item.interval === "15m")?.volumeRatio ?? null,
        btcTrend: coin.context?.btcTrend ?? null,
        fundingRate: coin.context?.fundingRate ?? null,
        openInterest: coin.context?.openInterest ?? null,
      },
    },
  };
}

export function publishedFromOfficial(record: OfficialSignal): PublishedSignal {
  return {
    symbol: record.symbol,
    direction: record.direction,
    entry: record.originalEntry,
    stop: record.stop,
    target: record.target,
    lastCandleCloseAt: record.lastCandleCloseAt,
    pattern: record.pattern,
    patternStatus: record.patternStatus as PublishedSignal["patternStatus"],
    entryConditions: record.entryConditions,
    reason: "Restored official signal. Original entry was not rewritten.",
    nextStep: "Observe the published levels. Fill is unconfirmed.",
    lifecycle: {
      status: record.lifecycleStatus,
      fillConfirmed: false,
      observedTrigger: record.observedTrigger,
      seenAwayFromEntry: record.observedTrigger || record.lifecycleStatus !== "WAITING_FOR_ENTRY",
      originalEntry: record.originalEntry,
      openedAt: record.openedAt,
      expiresAt: record.expiresAt,
      lastCandleCloseAt: record.lastCandleCloseAt,
      triggerObservedAt: record.observedTrigger ? record.updatedAt : null,
      closedAt: record.closedAt,
      note: "Restored from persistent official storage after process start.",
      nextStep: "Do not treat a price touch as a brokerage fill.",
    },
  };
}

export async function persistReconcile(coin: CoinScan, published: PublishedSignal | null, previousStatus?: SignalLifecycleStatus) {
  if (!published) return;
  const store = getOfficialStore();
  const record = officialFromPublished(coin, published);
  const created = await store.upsertCreate(record);
  if (!created.created) {
    await store.updateLifecycle({
      id: record.id,
      status: published.lifecycle.status,
      observedTrigger: published.lifecycle.observedTrigger,
      lastPrice: coin.price,
      lastPriceAt: coin.priceUpdatedAt,
      closedAt: published.lifecycle.closedAt,
      note: published.lifecycle.note,
    });
  }
  if (TERMINAL_OFFICIAL.includes(published.lifecycle.status)) {
    const qty = record.quantity;
    const fees = record.totalFeesUSDT;
    const exit = published.lifecycle.status === "STOP_HIT" ? record.stop : published.lifecycle.status === "TARGET_HIT" ? record.target : coin.price;
    const gross =
      exit == null
        ? null
        : record.direction === "LONG"
          ? (exit - record.originalEntry) * qty
          : (record.originalEntry - exit) * qty;
    await store.recordOutcome({
      signalId: record.id,
      kind: published.lifecycle.status,
      at: new Date().toISOString(),
      price: coin.price,
      fillConfirmed: false,
      brokerageVerified: false,
      hypotheticalGrossPnl: gross == null ? null : Number(gross.toFixed(4)),
      hypotheticalNetPnl: gross == null ? null : Number((gross - fees).toFixed(4)),
    });
  }
}
