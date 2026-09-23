/**
 * Diagnostic-only: explain why Top 50 coins resolve to WAIT.
 * Does NOT change strategy thresholds or manufacture signals.
 *
 *   npm run monitor:wait-diag
 */
import { getCandles, getExchangeFilters, getOpenInterest, getPremiumIndex, getTickers, mapPool } from "../lib/signals-engine/binance";
import { buildMarketContext } from "../lib/signals-engine/context";
import { analyzeTimeframe, buildCoinScan, levelsForSetup } from "../lib/signals-engine/signals";
import { buildSetup, isRrPublicationReject, MIN_NET_RISK_REWARD, passesPublicationRr } from "../lib/signals-engine/trading";
import { DEFAULT_SETTINGS, SCAN_INTERVALS, type CoinScan, type TimeframeSnapshot } from "../lib/signals-engine/types";
import { resolveUniverse } from "../lib/signals-engine/universe";
import { verifySignal } from "../lib/signals-engine/verify";
import { loadPublishedScanSnapshot } from "../lib/signals/scan-snapshot";

type RejectionBucket =
  | "no_valid_pattern"
  | "pattern_no_confirmation"
  | "rr_below_3"
  | "volume_failed"
  | "entry_trigger_not_confirmed"
  | "structure_target_invalid"
  | "insufficient_data"
  | "conflicting_evidence"
  | "developing_setup"
  | "other";

type CoinDiag = {
  symbol: string;
  direction: string;
  pattern: string;
  patternStatus: string;
  qualityLabel: string | null;
  mtfVotes: Array<{ interval: string; vote: string; note: string }>;
  trend15m: string | null;
  trend1h: string | null;
  trend4h: string | null;
  volumeRatio15m: number | null;
  volumeBreakout15m: string | null;
  structure15m: string | null;
  potentialSide: "LONG" | "SHORT" | "NONE" | "n/a";
  stageBWouldPass: boolean | null;
  grossRr: number | null;
  netRr: number | null;
  minNetRrRequired: number;
  rrPassed: boolean | null;
  reasons: string[];
  primaryBucket: RejectionBucket;
  buckets: RejectionBucket[];
};

function snapshot(snapshots: TimeframeSnapshot[], interval: string) {
  return snapshots.find((item) => item.interval === interval);
}

function classifyBuckets(coin: CoinScan, extras: {
  grossRr: number | null;
  netRr: number | null;
  rrPassed: boolean | null;
  potentialSide: "LONG" | "SHORT" | "NONE" | "n/a";
}): RejectionBucket[] {
  const buckets = new Set<RejectionBucket>();
  const reason = `${coin.reason || ""} ${coin.nextStep || ""} ${(coin.quality?.contradictory || []).join(" ")}`.toLowerCase();
  const label = coin.quality?.label || "";

  if (isRrPublicationReject(coin.reason) || extras.rrPassed === false) buckets.add("rr_below_3");
  if (label === "INSUFFICIENT DATA" || reason.includes("missing") || reason.includes("stale") || coin.error) {
    buckets.add("insufficient_data");
  }
  if (label === "CONFLICTING EVIDENCE" || reason.includes("conflicts") || reason.includes("opposes")) {
    buckets.add("conflicting_evidence");
  }
  if (label === "DEVELOPING SETUP") buckets.add("developing_setup");

  if (reason.includes("no confirmed") && reason.includes("pattern") && reason.includes("volume")) {
    buckets.add("pattern_no_confirmation");
    buckets.add("volume_failed");
  } else if (reason.includes("no confirmed") || reason.includes("pattern confirmation")) {
    buckets.add("pattern_no_confirmation");
  }
  if (reason.includes("volume") && (reason.includes("breakout") || reason.includes("no volume"))) {
    buckets.add("volume_failed");
  }
  if (
    (coin.patternStatus === "UNCONFIRMED" || coin.patternStatus === "FORMING" || coin.pattern === "None")
    && extras.potentialSide === "NONE"
  ) {
    buckets.add("no_valid_pattern");
  }
  if (reason.includes("structure") && (reason.includes("opposes") || reason.includes("does not support") || reason.includes("target"))) {
    buckets.add("structure_target_invalid");
  }
  if (
    reason.includes("do not enter")
    || reason.includes("confirmation")
    || reason.includes("retest")
    || reason.includes("closed candle")
  ) {
    buckets.add("entry_trigger_not_confirmed");
  }

  if (buckets.size === 0) buckets.add("other");
  return [...buckets];
}

function primaryBucket(buckets: RejectionBucket[]): RejectionBucket {
  const order: RejectionBucket[] = [
    "insufficient_data",
    "rr_below_3",
    "no_valid_pattern",
    "pattern_no_confirmation",
    "volume_failed",
    "structure_target_invalid",
    "entry_trigger_not_confirmed",
    "conflicting_evidence",
    "developing_setup",
    "other",
  ];
  return order.find((item) => buckets.includes(item)) || "other";
}

async function diagnoseSymbol(symbol: string, price: number | undefined): Promise<CoinDiag> {
  const filters = (await getExchangeFilters([symbol])).get(symbol);
  if (!filters) {
    return {
      symbol,
      direction: "WAIT",
      pattern: "None",
      patternStatus: "UNAVAILABLE",
      qualityLabel: null,
      mtfVotes: [],
      trend15m: null,
      trend1h: null,
      trend4h: null,
      volumeRatio15m: null,
      volumeBreakout15m: null,
      structure15m: null,
      potentialSide: "n/a",
      stageBWouldPass: null,
      grossRr: null,
      netRr: null,
      minNetRrRequired: MIN_NET_RISK_REWARD,
      rrPassed: null,
      reasons: ["Missing exchange filters"],
      primaryBucket: "insufficient_data",
      buckets: ["insufficient_data"],
    };
  }

  const snapshots: TimeframeSnapshot[] = [];
  const errors: string[] = [];
  let hourlyCloses: number[] = [];
  await mapPool([...SCAN_INTERVALS], 2, async (interval) => {
    try {
      const candles = await getCandles(symbol, interval, 250);
      const snap = analyzeTimeframe(candles, interval);
      snapshots.push(snap);
      if (interval === "1h") hourlyCloses = candles.filter((c) => c.closed).map((c) => c.close);
    } catch (error) {
      errors.push(`${interval}: ${error instanceof Error ? error.message : "kline error"}`);
    }
  });
  snapshots.sort(
    (a, b) => SCAN_INTERVALS.indexOf(a.interval as (typeof SCAN_INTERVALS)[number])
      - SCAN_INTERVALS.indexOf(b.interval as (typeof SCAN_INTERVALS)[number]),
  );

  const prem = (await getPremiumIndex([symbol]).catch(() => new Map())).get(symbol);
  const oi = await getOpenInterest(symbol).catch(() => null);
  const mid = snapshot(snapshots, "15m");
  const context = buildMarketContext({
    symbol,
    livePrice: price ?? null,
    markPrice: prem?.markPrice ?? null,
    fundingRate: prem?.lastFundingRate ?? null,
    openInterest: oi,
    atr: mid?.atr ?? null,
    volumeRatio: mid?.volumeRatio ?? null,
    symbolCloses: hourlyCloses,
  });

  const coin = buildCoinScan({
    symbol,
    filters,
    snapshots,
    livePrice: price ?? null,
    priceUpdatedAt: new Date().toISOString(),
    stale: false,
    error: snapshots.length ? undefined : errors.join("; ") || "No candles",
    context,
  });

  // Probe verification + R/R independently for diagnostics (same functions, no threshold changes).
  const decision = snapshots.length && price != null
    ? verifySignal({
      snapshots,
      stale: false,
      context,
      symbol,
      tickSize: filters.tickSize,
      pricePrecision: filters.pricePrecision,
    })
    : null;

  let grossRr: number | null = null;
  let netRr: number | null = null;
  let rrPassed: boolean | null = null;
  let potentialSide: CoinDiag["potentialSide"] = "n/a";
  let stageBWouldPass: boolean | null = null;

  if (decision) {
    potentialSide = decision.direction === "WAIT" ? "NONE" : decision.direction;
    // If Stage B passed, direction is LONG/SHORT before R/R gate.
    if (decision.direction === "LONG" || decision.direction === "SHORT") {
      stageBWouldPass = true;
      potentialSide = decision.direction;
      const levels = levelsForSetup(decision.direction, snapshots, price!, filters.tickSize);
      if (levels) {
        const setup = buildSetup({
          direction: decision.direction,
          entry: levels.entry,
          stop: levels.stop,
          target: levels.target,
          filters,
          marginUSDT: DEFAULT_SETTINGS.marginUSDT,
          leverage: DEFAULT_SETTINGS.leverage,
          feeRate: DEFAULT_SETTINGS.takerFeeRate,
          marginMode: DEFAULT_SETTINGS.marginMode,
        });
        if (setup) {
          grossRr = setup.grossRiskReward;
          netRr = setup.netRiskReward;
          rrPassed = passesPublicationRr(setup.netRiskReward);
        }
      } else {
        stageBWouldPass = true;
        rrPassed = null;
      }
    } else {
      stageBWouldPass = false;
      // Heuristic: Stage A potential from reason text
      if (/possible LONG|developing\. Missing|Stage A saw a possible LONG/i.test(decision.reason)) potentialSide = "LONG";
      if (/possible SHORT|Stage A saw a possible SHORT/i.test(decision.reason)) potentialSide = "SHORT";
      if (/no one-sided|Stage A found no/i.test(decision.reason)) potentialSide = "NONE";
    }
  }

  // Prefer R/R numbers from the forced-WAIT path when buildCoinScan already computed them in reason.
  const rrMatch = coin.reason?.match(/Net risk\/reward is 1:([0-9.]+).*gross 1:([0-9.]+)/i);
  if (rrMatch) {
    netRr = Number(rrMatch[1]);
    grossRr = Number(rrMatch[2]);
    rrPassed = false;
    stageBWouldPass = true;
  }

  const buckets = coin.direction === "WAIT"
    ? classifyBuckets(coin, { grossRr, netRr, rrPassed, potentialSide })
    : [];

  const reasons = [
    coin.reason,
    ...(coin.quality?.contradictory || []).slice(0, 8),
  ].filter(Boolean) as string[];

  return {
    symbol,
    direction: coin.direction,
    pattern: coin.pattern,
    patternStatus: coin.patternStatus,
    qualityLabel: coin.quality?.label ?? null,
    mtfVotes: (coin.quality?.timeframeVotes || []).map((v) => ({
      interval: v.interval,
      vote: v.vote,
      note: v.note,
    })),
    trend15m: snapshot(snapshots, "15m")?.trend ?? null,
    trend1h: snapshot(snapshots, "1h")?.trend ?? null,
    trend4h: snapshot(snapshots, "4h")?.trend ?? null,
    volumeRatio15m: snapshot(snapshots, "15m")?.volumeRatio ?? null,
    volumeBreakout15m: snapshot(snapshots, "15m")?.breakout ?? null,
    structure15m: snapshot(snapshots, "15m")?.structure ?? null,
    potentialSide,
    stageBWouldPass,
    grossRr,
    netRr,
    minNetRrRequired: MIN_NET_RISK_REWARD,
    rrPassed,
    reasons,
    primaryBucket: coin.direction === "WAIT" ? primaryBucket(buckets) : "other",
    buckets,
  };
}

async function main() {
  const selection = await resolveUniverse("50", undefined, true);
  const prices = await getTickers(selection.symbols);
  const published = await loadPublishedScanSnapshot().catch(() => null);

  const rows: CoinDiag[] = [];
  // Bounded concurrency: reuse mapPool at 4 to respect Binance weight.
  const { mapPool: pool } = await import("../lib/signals-engine/binance");
  const diags = await pool(selection.symbols, 4, async (symbol) => diagnoseSymbol(symbol, prices.get(symbol)));
  rows.push(...diags);

  const summary: Record<string, number> = {
    total: rows.length,
    long: rows.filter((r) => r.direction === "LONG").length,
    short: rows.filter((r) => r.direction === "SHORT").length,
    wait: rows.filter((r) => r.direction === "WAIT").length,
    no_valid_pattern: 0,
    pattern_no_confirmation: 0,
    rr_below_3: 0,
    volume_failed: 0,
    entry_trigger_not_confirmed: 0,
    structure_target_invalid: 0,
    insufficient_data: 0,
    conflicting_evidence: 0,
    developing_setup: 0,
    other: 0,
    stageB_passed_but_rr_failed: 0,
    stageB_never_passed: 0,
  };

  for (const row of rows) {
    if (row.direction !== "WAIT") continue;
    for (const bucket of row.buckets) summary[bucket] = (summary[bucket] || 0) + 1;
    if (row.stageBWouldPass === true && row.rrPassed === false) summary.stageB_passed_but_rr_failed += 1;
    if (row.stageBWouldPass === false) summary.stageB_never_passed += 1;
  }

  const byPrimary: Record<string, number> = {};
  for (const row of rows.filter((r) => r.direction === "WAIT")) {
    byPrimary[row.primaryBucket] = (byPrimary[row.primaryBucket] || 0) + 1;
  }

  const report = {
    at: new Date().toISOString(),
    selected: selection.symbols.length,
    eligible: selection.eligible,
    minNetRrRequired: MIN_NET_RISK_REWARD,
    publishedAt: published?.publishedAt ?? null,
    publishedCounts: published?.response?.counts ?? null,
    summary,
    primaryBucketCounts: byPrimary,
    coins: rows.map((row) => ({
      symbol: row.symbol,
      direction: row.direction,
      pattern: row.pattern,
      patternStatus: row.patternStatus,
      qualityLabel: row.qualityLabel,
      mtf: {
        "15m": row.trend15m,
        "1h": row.trend1h,
        "4h": row.trend4h,
        votes: row.mtfVotes,
      },
      volumeRatio15m: row.volumeRatio15m,
      volumeBreakout15m: row.volumeBreakout15m,
      structure15m: row.structure15m,
      potentialSide: row.potentialSide,
      stageBWouldPass: row.stageBWouldPass,
      grossRr: row.grossRr,
      netRr: row.netRr,
      rrPassed: row.rrPassed,
      primaryBucket: row.primaryBucket,
      buckets: row.buckets,
      reasons: row.reasons,
    })),
  };

  console.log("WAIT_DIAGNOSTIC " + JSON.stringify(report));

  // Human-readable rollup
  console.error("\n=== WAIT DIAGNOSTIC SUMMARY ===");
  console.error(`Selected ${report.selected} | LONG ${summary.long} SHORT ${summary.short} WAIT ${summary.wait}`);
  console.error("Primary rejection buckets (each WAIT coin counted once):");
  for (const [k, v] of Object.entries(byPrimary).sort((a, b) => b[1] - a[1])) {
    console.error(`  ${k}: ${v}`);
  }
  console.error("Multi-label hits (a coin can contribute to several):");
  for (const key of [
    "no_valid_pattern",
    "pattern_no_confirmation",
    "rr_below_3",
    "volume_failed",
    "entry_trigger_not_confirmed",
    "structure_target_invalid",
    "insufficient_data",
    "conflicting_evidence",
    "developing_setup",
    "other",
    "stageB_passed_but_rr_failed",
    "stageB_never_passed",
  ] as const) {
    console.error(`  ${key}: ${summary[key]}`);
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  process.exit(1);
});
