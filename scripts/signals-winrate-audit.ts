/**
 * Historical outcome audit for restored pattern-engine signals.
 * Win Rate = TARGET / (TARGET + STOP) — excludes open/expired/invalidated/ambiguous/duplicates.
 */
import { promises as fs } from "fs";
import path from "path";
import type { OfficialSignal, ObservedOutcome, OfficialStoreSnapshot } from "../lib/signals/official-types";

type HistoryRecord = {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  pattern: string;
  openedAt: string;
  closedAt?: string | null;
  entry: number;
  stop: number;
  target: number;
  outcome: "OPEN" | "WIN" | "LOSS" | "EXPIRED" | "AMBIGUOUS";
  pnlUSDT?: number | null;
  lifecycleStatus?: string | null;
};

type HistoryStore = { live: HistoryRecord[]; backtest: HistoryRecord[] };

type ResolvedRow = {
  id: string;
  source: "official" | "history-live" | "history-backtest";
  symbol: string;
  direction: "LONG" | "SHORT";
  pattern: string;
  publishedAt: string;
  entry: number;
  stop: number;
  target: number;
  outcome: "TARGET" | "STOP";
  outcomeAt: string | null;
  grossPnl: number | null;
  netPnl: number | null;
};

function dedupeKey(symbol: string, direction: string, entry: number, pattern: string) {
  const entryKey = Number.isFinite(entry) ? entry.toPrecision(8) : String(entry);
  return `${symbol}|${direction}|${entryKey}|${pattern}`;
}

function fmtRate(wins: number, resolved: number) {
  if (resolved <= 0) return "insufficient completed history (0 resolved TARGET+STOP)";
  const pct = (wins / resolved) * 100;
  return `${pct.toFixed(1)}% (${wins} wins / ${resolved} resolved signals)`;
}

function rateBucket(rows: ResolvedRow[]) {
  const wins = rows.filter((r) => r.outcome === "TARGET").length;
  const losses = rows.filter((r) => r.outcome === "STOP").length;
  const resolved = wins + losses;
  return { wins, losses, resolved, label: fmtRate(wins, resolved) };
}

async function loadJson<T>(rel: string): Promise<T | null> {
  try {
    const text = await fs.readFile(path.join(process.cwd(), rel), "utf8");
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function officialResolved(signals: OfficialSignal[], outcomes: ObservedOutcome[]): {
  resolved: ResolvedRow[];
  excluded: Record<string, number>;
  totalUnique: number;
} {
  const byId = new Map(signals.map((s) => [s.id, s]));
  const excluded: Record<string, number> = {
    ACTIVE: 0,
    WAITING_FOR_ENTRY: 0,
    TRIGGERED: 0,
    EXPIRED: 0,
    INVALIDATED: 0,
    MISSED_ENTRY: 0,
    AMBIGUOUS: 0,
    DUPLICATE: 0,
    OTHER: 0,
  };
  const seen = new Set<string>();
  const resolved: ResolvedRow[] = [];
  let totalUnique = 0;

  for (const signal of signals) {
    const entry = Number(signal.originalEntry);
    if (!Number.isFinite(entry)) {
      excluded.OTHER += 1;
      continue;
    }
    const key = dedupeKey(signal.symbol, signal.direction, entry, signal.pattern || "Unknown");
    if (seen.has(key)) {
      excluded.DUPLICATE += 1;
      continue;
    }
    seen.add(key);
    totalUnique += 1;

    if (signal.lifecycleStatus === "TARGET_HIT" || signal.lifecycleStatus === "STOP_HIT") {
      const obs = outcomes.find((o) => o.signalId === signal.id && (o.kind === "TARGET_HIT" || o.kind === "STOP_HIT"));
      resolved.push({
        id: signal.id,
        source: "official",
        symbol: signal.symbol,
        direction: signal.direction,
        pattern: signal.pattern || "Unknown",
        publishedAt: signal.openedAt,
        entry,
        stop: signal.stop,
        target: signal.target,
        outcome: signal.lifecycleStatus === "TARGET_HIT" ? "TARGET" : "STOP",
        outcomeAt: signal.closedAt || obs?.at || null,
        grossPnl: obs?.hypotheticalGrossPnl ?? null,
        netPnl: obs?.hypotheticalNetPnl ?? null,
      });
      continue;
    }

    if (signal.lifecycleStatus in excluded) {
      excluded[signal.lifecycleStatus as keyof typeof excluded] += 1;
    } else {
      excluded.OTHER += 1;
    }
  }

  return { resolved, excluded, totalUnique };
}

function historyResolved(records: HistoryRecord[], source: ResolvedRow["source"]): {
  resolved: ResolvedRow[];
  excluded: Record<string, number>;
  totalUnique: number;
} {
  const excluded: Record<string, number> = {
    OPEN: 0,
    EXPIRED: 0,
    AMBIGUOUS: 0,
    DUPLICATE: 0,
    OTHER: 0,
  };
  const seen = new Set<string>();
  const resolved: ResolvedRow[] = [];
  let totalUnique = 0;

  for (const record of records) {
    const entry = Number(record.entry);
    if (!Number.isFinite(entry)) {
      excluded.OTHER += 1;
      continue;
    }
    const key = dedupeKey(record.symbol, record.direction, entry, record.pattern || "Unknown");
    if (seen.has(key)) {
      excluded.DUPLICATE += 1;
      continue;
    }
    seen.add(key);
    totalUnique += 1;

    if (record.outcome === "WIN" || record.outcome === "LOSS") {
      resolved.push({
        id: record.id,
        source,
        symbol: record.symbol,
        direction: record.direction,
        pattern: record.pattern || "Unknown",
        publishedAt: record.openedAt,
        entry,
        stop: record.stop,
        target: record.target,
        outcome: record.outcome === "WIN" ? "TARGET" : "STOP",
        outcomeAt: record.closedAt || null,
        grossPnl: record.pnlUSDT ?? null,
        netPnl: record.pnlUSDT ?? null,
      });
      continue;
    }

    if (record.outcome in excluded) {
      excluded[record.outcome as keyof typeof excluded] += 1;
    } else {
      excluded.OTHER += 1;
    }
  }

  return { resolved, excluded, totalUnique };
}

function byDirection(rows: ResolvedRow[]) {
  return {
    LONG: rateBucket(rows.filter((r) => r.direction === "LONG")),
    SHORT: rateBucket(rows.filter((r) => r.direction === "SHORT")),
  };
}

function byPattern(rows: ResolvedRow[], minSample = 1) {
  const map = new Map<string, ResolvedRow[]>();
  for (const row of rows) {
    const list = map.get(row.pattern) || [];
    list.push(row);
    map.set(row.pattern, list);
  }
  return [...map.entries()]
    .map(([pattern, list]) => ({ pattern, ...rateBucket(list), sample: list.length }))
    .filter((row) => row.sample >= minSample)
    .sort((a, b) => b.sample - a.sample || a.pattern.localeCompare(b.pattern));
}

async function main() {
  const official = await loadJson<OfficialStoreSnapshot>("data/signals-official.json");
  const history = await loadJson<HistoryStore>("data/signal-history.json");

  const officialAudit = official
    ? officialResolved(official.signals || [], official.outcomes || [])
    : { resolved: [], excluded: {}, totalUnique: 0 };

  const liveAudit = history
    ? historyResolved(history.live || [], "history-live")
    : { resolved: [], excluded: {}, totalUnique: 0 };

  const backtestAudit = history
    ? historyResolved(history.backtest || [], "history-backtest")
    : { resolved: [], excluded: {}, totalUnique: 0 };

  // Primary restored-strategy live board: official TARGET/STOP when present;
  // educational live history WIN/LOSS as supplemental observable sample.
  const primaryResolved = officialAudit.resolved.length
    ? officialAudit.resolved
    : liveAudit.resolved;

  const primarySource = officialAudit.resolved.length ? "official-TARGET_HIT/STOP_HIT" : "history-live-WIN/LOSS";

  const report = {
    primarySource,
    note:
      officialAudit.resolved.length === 0
        ? "Official store has no TARGET_HIT/STOP_HIT outcomes yet. Reporting educational live history WIN/LOSS where available. Backtest is shown separately and is not live official performance."
        : "Primary win rate uses official TARGET_HIT/STOP_HIT only.",
    official: {
      totalUniqueSignals: officialAudit.totalUnique,
      completedTARGET: officialAudit.resolved.filter((r) => r.outcome === "TARGET").length,
      completedSTOP: officialAudit.resolved.filter((r) => r.outcome === "STOP").length,
      unresolvedExcluded: officialAudit.excluded,
      overall: rateBucket(officialAudit.resolved),
      byDirection: byDirection(officialAudit.resolved),
      byPattern: byPattern(officialAudit.resolved),
      sampleRows: officialAudit.resolved.slice(0, 20),
    },
    historyLive: {
      totalUniqueSignals: liveAudit.totalUnique,
      completedTARGET: liveAudit.resolved.filter((r) => r.outcome === "TARGET").length,
      completedSTOP: liveAudit.resolved.filter((r) => r.outcome === "STOP").length,
      unresolvedExcluded: liveAudit.excluded,
      overall: rateBucket(liveAudit.resolved),
      byDirection: byDirection(liveAudit.resolved),
      byPattern: byPattern(liveAudit.resolved),
    },
    historyBacktest: {
      totalUniqueSignals: backtestAudit.totalUnique,
      completedTARGET: backtestAudit.resolved.filter((r) => r.outcome === "TARGET").length,
      completedSTOP: backtestAudit.resolved.filter((r) => r.outcome === "STOP").length,
      unresolvedExcluded: backtestAudit.excluded,
      overall: rateBucket(backtestAudit.resolved),
      byDirection: byDirection(backtestAudit.resolved),
      byPattern: byPattern(backtestAudit.resolved),
      note: "Walk-forward educational backtest — not live published official signals.",
    },
    headline: {
      overall: rateBucket(primaryResolved),
      byDirection: byDirection(primaryResolved),
      byPattern: byPattern(primaryResolved),
      unresolvedExcluded:
        officialAudit.resolved.length > 0 ? officialAudit.excluded : liveAudit.excluded,
      totalUniqueSignals:
        officialAudit.resolved.length > 0 ? officialAudit.totalUnique : liveAudit.totalUnique,
    },
    lifecycleProblems: [
      officialAudit.resolved.length === 0
        ? "Official lifecycle store has 0 TARGET_HIT and 0 STOP_HIT — completed trades are not being recorded as target/stop outcomes (many EXPIRED/INVALIDATED instead)."
        : null,
      (official?.signals || []).some((s) => s.lifecycleStatus === "ACTIVE" || s.lifecycleStatus === "WAITING_FOR_ENTRY")
        ? "Open official signals remain ACTIVE/WAITING — correctly excluded from win rate."
        : null,
    ].filter(Boolean),
  };

  console.log("WINRATE_AUDIT " + JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  process.exit(1);
});
