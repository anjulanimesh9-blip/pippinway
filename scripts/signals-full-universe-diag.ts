/**
 * One-shot full eligible-universe diagnostic (ALL TRADING USDT-M perpetuals).
 * Uses the SAME production pipeline as wait-diag / buildCoinScan.
 * Does NOT change MIN_NET_RR or publish signals.
 *
 *   npm run monitor:full-universe-diag
 */
import { promises as fs } from "fs";
import path from "path";
import {
  getCandles,
  getExchangeFilters,
  getOpenInterest,
  getPremiumIndex,
  getTickers,
  mapPool,
} from "../lib/signals-engine/binance";
import { weightSnapshot } from "../lib/signals-engine/rate-limit";
import { buildMarketContext } from "../lib/signals-engine/context";
import { analyzeTimeframe, buildCoinScan, levelsForSetup } from "../lib/signals-engine/signals";
import {
  buildSetup,
  geometryValid,
  MIN_NET_RISK_REWARD,
  passesPublicationRr,
  roundToTick,
} from "../lib/signals-engine/trading";
import {
  DEFAULT_SETTINGS,
  SCAN_INTERVALS,
  type CoinScan,
  type TimeframeSnapshot,
} from "../lib/signals-engine/types";
import { resolveUniverse } from "../lib/signals-engine/universe";
import { verifySignal } from "../lib/signals-engine/verify";

type Row = {
  symbol: string;
  ok: boolean;
  failReason?: string;
  direction: string;
  pattern: string;
  patternStatus: string;
  qualityLabel: string | null;
  stageADirectional: boolean;
  stageASide: "LONG" | "SHORT" | "NONE";
  stageBPassed: boolean;
  structureLevelsOk: boolean;
  levelSource: string | null;
  entry: number | null;
  stop: number | null;
  target: number | null;
  geometryOk: boolean | null;
  grossRr: number | null;
  netRr: number | null;
  netRrRawApprox: number | null;
  rrGte1: boolean;
  rrGte2: boolean;
  rrGte25: boolean;
  rrGte3: boolean;
  publishedOfficially: boolean;
  publishBlockReason: string | null;
  mtf: { "15m": string | null; "1h": string | null; "4h": string | null; votes: Array<{ interval: string; vote: string; note: string }> };
  volumeRatio15m: number | null;
  volumeBreakout15m: string | null;
  structure15m: string | null;
  stageAEvidence: string[];
  stageBEvidence: string[];
  tickSize: number | null;
  reasons: string[];
};

function snap(snapshots: TimeframeSnapshot[], interval: string) {
  return snapshots.find((item) => item.interval === interval);
}

function stageAFromDecision(decision: { direction: string; reason: string; quality?: { supporting?: string[]; label?: string } } | null): {
  directional: boolean;
  side: "LONG" | "SHORT" | "NONE";
} {
  if (!decision) return { directional: false, side: "NONE" };
  if (decision.direction === "LONG" || decision.direction === "SHORT") {
    return { directional: true, side: decision.direction };
  }
  const text = `${decision.reason || ""} ${(decision.quality?.supporting || []).join(" ")}`;
  if (/possible LONG|Stage A saw a possible LONG|A LONG idea is developing/i.test(text)) {
    return { directional: true, side: "LONG" };
  }
  if (/possible SHORT|Stage A saw a possible SHORT|A SHORT idea is developing/i.test(text)) {
    return { directional: true, side: "SHORT" };
  }
  if (decision.quality?.label === "DEVELOPING SETUP" || decision.quality?.label === "CONFLICTING EVIDENCE") {
    return { directional: true, side: "NONE" };
  }
  return { directional: false, side: "NONE" };
}

async function diagnoseSymbol(symbol: string, price: number | undefined): Promise<Row> {
  const baseFail = (failReason: string): Row => ({
    symbol,
    ok: false,
    failReason,
    direction: "WAIT",
    pattern: "None",
    patternStatus: "UNAVAILABLE",
    qualityLabel: null,
    stageADirectional: false,
    stageASide: "NONE",
    stageBPassed: false,
    structureLevelsOk: false,
    levelSource: null,
    entry: null,
    stop: null,
    target: null,
    geometryOk: null,
    grossRr: null,
    netRr: null,
    netRrRawApprox: null,
    rrGte1: false,
    rrGte2: false,
    rrGte25: false,
    rrGte3: false,
    publishedOfficially: false,
    publishBlockReason: failReason,
    mtf: { "15m": null, "1h": null, "4h": null, votes: [] },
    volumeRatio15m: null,
    volumeBreakout15m: null,
    structure15m: null,
    stageAEvidence: [],
    stageBEvidence: [],
    tickSize: null,
    reasons: [failReason],
  });

  try {
    const filters = (await getExchangeFilters([symbol])).get(symbol);
    if (!filters?.available) return baseFail(filters?.reason || "Missing or unavailable filters");

    const snapshots: TimeframeSnapshot[] = [];
    const errors: string[] = [];
    let hourlyCloses: number[] = [];
    await mapPool([...SCAN_INTERVALS], 2, async (interval) => {
      try {
        const candles = await getCandles(symbol, interval, 250);
        const row = analyzeTimeframe(candles, interval);
        snapshots.push(row);
        if (interval === "1h") hourlyCloses = candles.filter((c) => c.closed).map((c) => c.close);
      } catch (error) {
        errors.push(`${interval}: ${error instanceof Error ? error.message : "kline error"}`);
      }
    });
    snapshots.sort(
      (a, b) =>
        SCAN_INTERVALS.indexOf(a.interval as (typeof SCAN_INTERVALS)[number])
        - SCAN_INTERVALS.indexOf(b.interval as (typeof SCAN_INTERVALS)[number]),
    );

    if (!snapshots.length || price == null) {
      return baseFail(errors.join("; ") || "No candles or price");
    }

    const prem = (await getPremiumIndex([symbol]).catch(() => new Map())).get(symbol);
    const oi = await getOpenInterest(symbol).catch(() => null);
    const mid = snap(snapshots, "15m");
    const context = buildMarketContext({
      symbol,
      livePrice: price,
      markPrice: prem?.markPrice ?? null,
      fundingRate: prem?.lastFundingRate ?? null,
      openInterest: oi,
      atr: mid?.atr ?? null,
      volumeRatio: mid?.volumeRatio ?? null,
      symbolCloses: hourlyCloses,
    });

    const coin: CoinScan = buildCoinScan({
      symbol,
      filters,
      snapshots,
      livePrice: price,
      priceUpdatedAt: new Date().toISOString(),
      stale: false,
      error: undefined,
      context,
    });

    const decision = verifySignal({
      snapshots,
      stale: false,
      context,
      symbol,
      tickSize: filters.tickSize,
      pricePrecision: filters.pricePrecision,
    });

    const stageA = stageAFromDecision(decision);
    const stageBPassed = decision.direction === "LONG" || decision.direction === "SHORT";

    let entry: number | null = null;
    let stop: number | null = null;
    let target: number | null = null;
    let levelSource: string | null = null;
    let structureLevelsOk = false;
    let geometryOk: boolean | null = null;
    let grossRr: number | null = null;
    let netRr: number | null = null;
    let netRrRawApprox: number | null = null;
    let publishBlockReason: string | null = null;

    if (stageBPassed) {
      const levels = levelsForSetup(decision.direction, snapshots, price, filters.tickSize);
      if (!levels) {
        publishBlockReason = "Stage B passed but levelsForSetup returned null";
      } else {
        structureLevelsOk = true;
        levelSource = levels.source;
        entry = levels.entry;
        stop = levels.stop;
        target = levels.target;
        geometryOk = geometryValid(decision.direction, entry, stop, target);

        // Raw (pre-display) R/R using unrounded mid.price vs tick-rounded levels for comparison.
        const rawEntry = mid?.price ?? price;
        const risk =
          decision.direction === "LONG" ? levels.entry - levels.stop : levels.stop - levels.entry;
        const reward =
          decision.direction === "LONG" ? levels.target - levels.entry : levels.entry - levels.target;
        if (risk > 0) netRrRawApprox = reward / risk;

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
        if (!setup) {
          publishBlockReason = "buildSetup returned null";
        } else {
          grossRr = setup.grossRiskReward;
          netRr = setup.netRiskReward;
          if (!geometryOk) publishBlockReason = "Geometry invalid after tick rounding";
          else if (!passesPublicationRr(setup.netRiskReward)) {
            publishBlockReason = `Net R/R 1:${setup.netRiskReward.toFixed(2)} below floor 1:${MIN_NET_RISK_REWARD}`;
          } else if (!setup.executable) {
            publishBlockReason = setup.executableReason || "Setup not executable";
          }

          // Tick collapse check
          const re = roundToTick(levels.entry, filters.tickSize);
          const rs = roundToTick(levels.stop, filters.tickSize);
          const rt = roundToTick(levels.target, filters.tickSize);
          if (re === rs || re === rt || rs === rt) {
            publishBlockReason = `Tick collapse risk: entry=${re} stop=${rs} target=${rt} tick=${filters.tickSize}`;
          }
          void rawEntry;
        }
      }
    } else {
      publishBlockReason = decision.reason || "Stage B did not pass";
    }

    // Prefer reason-embedded R/R from buildCoinScan when Stage B cleared then R/R gate failed.
    const rrMatch = coin.reason?.match(/Net risk\/reward is 1:([0-9.]+).*gross 1:([0-9.]+)/i);
    if (rrMatch) {
      netRr = Number(rrMatch[1]);
      grossRr = Number(rrMatch[2]);
      if (!publishBlockReason) {
        publishBlockReason = `Net R/R 1:${netRr} below floor 1:${MIN_NET_RISK_REWARD}`;
      }
    }

    const publishedOfficially = coin.direction === "LONG" || coin.direction === "SHORT";
    if (publishedOfficially) publishBlockReason = null;

    const rrGte1 = netRr != null && netRr >= 1;
    const rrGte2 = netRr != null && netRr >= 2;
    const rrGte25 = netRr != null && netRr >= 2.5;
    const rrGte3 = netRr != null && netRr >= 3;

    return {
      symbol,
      ok: true,
      direction: coin.direction,
      pattern: coin.pattern,
      patternStatus: coin.patternStatus,
      qualityLabel: coin.quality?.label ?? null,
      stageADirectional: stageA.directional,
      stageASide: stageA.side,
      stageBPassed,
      structureLevelsOk,
      levelSource,
      entry,
      stop,
      target,
      geometryOk,
      grossRr,
      netRr,
      netRrRawApprox,
      rrGte1,
      rrGte2,
      rrGte25,
      rrGte3,
      publishedOfficially,
      publishBlockReason,
      mtf: {
        "15m": snap(snapshots, "15m")?.trend ?? null,
        "1h": snap(snapshots, "1h")?.trend ?? null,
        "4h": snap(snapshots, "4h")?.trend ?? null,
        votes: (coin.quality?.timeframeVotes || []).map((v) => ({
          interval: v.interval,
          vote: v.vote,
          note: v.note,
        })),
      },
      volumeRatio15m: snap(snapshots, "15m")?.volumeRatio ?? null,
      volumeBreakout15m: snap(snapshots, "15m")?.breakout ?? null,
      structure15m: snap(snapshots, "15m")?.structure ?? null,
      stageAEvidence: (coin.quality?.supporting || []).slice(0, 6),
      stageBEvidence: [
        decision.reason,
        ...(coin.quality?.contradictory || []).slice(0, 4),
      ].filter(Boolean) as string[],
      tickSize: filters.tickSize,
      reasons: [coin.reason, ...(coin.quality?.contradictory || []).slice(0, 6)].filter(Boolean) as string[],
    };
  } catch (error) {
    return baseFail(error instanceof Error ? error.message : String(error));
  }
}

async function main() {
  const started = Date.now();
  const selection = await resolveUniverse("all", undefined, true);
  const prices = await getTickers(selection.symbols);
  console.error(JSON.stringify({
    event: "full_universe_diag_start",
    eligible: selection.eligible,
    selected: selection.symbols.length,
    mode: selection.mode,
  }));

  const rows = await mapPool(selection.symbols, 3, async (symbol) => {
    const row = await diagnoseSymbol(symbol, prices.get(symbol));
    if (selection.symbols.indexOf(symbol) % 25 === 0) {
      const w = weightSnapshot();
      console.error(JSON.stringify({
        event: "full_universe_diag_progress",
        symbol,
        index: selection.symbols.indexOf(symbol),
        of: selection.symbols.length,
        weightUsed: w.used,
        weightLimit: w.limit,
        elapsedMs: Date.now() - started,
      }));
    }
    return row;
  });

  const ok = rows.filter((r) => r.ok);
  const failed = rows.filter((r) => !r.ok);
  const stageA = ok.filter((r) => r.stageADirectional);
  const stageB = ok.filter((r) => r.stageBPassed);
  const structureOk = ok.filter((r) => r.structureLevelsOk);
  const withNet = ok.filter((r) => r.netRr != null);
  const gte1 = withNet.filter((r) => r.rrGte1);
  const gte2 = withNet.filter((r) => r.rrGte2);
  const gte25 = withNet.filter((r) => r.rrGte25);
  const gte3 = withNet.filter((r) => r.rrGte3);
  const long3 = gte3.filter((r) => r.stageASide === "LONG" || r.direction === "LONG");
  const short3 = gte3.filter((r) => r.stageASide === "SHORT" || r.direction === "SHORT");
  const published = ok.filter((r) => r.publishedOfficially);
  const weight = weightSnapshot();
  const runtimeMs = Date.now() - started;

  const candidatesGte3 = gte3.map((r) => ({
    symbol: r.symbol,
    side: r.direction === "LONG" || r.direction === "SHORT" ? r.direction : r.stageASide,
    pattern: r.pattern,
    patternStatus: r.patternStatus,
    timeframe: "15m (structure) + MTF 15m/1h/4h",
    entry: r.entry,
    stop: r.stop,
    target: r.target,
    grossRr: r.grossRr,
    netRr: r.netRr,
    netRrRawApprox: r.netRrRawApprox,
    levelSource: r.levelSource,
    geometryOk: r.geometryOk,
    tickSize: r.tickSize,
    mtf: r.mtf,
    volumeRatio15m: r.volumeRatio15m,
    volumeBreakout15m: r.volumeBreakout15m,
    structure15m: r.structure15m,
    stageAEvidence: r.stageAEvidence,
    stageBEvidence: r.stageBEvidence,
    publishedOfficially: r.publishedOfficially,
    publishBlockReason: r.publishBlockReason,
  }));

  const report = {
    at: new Date().toISOString(),
    runtimeMs,
    runtimeMin: Number((runtimeMs / 60000).toFixed(2)),
    requestWeight: { used: weight.used, limit: weight.limit },
    universe: {
      eligible: selection.eligible,
      selected: selection.symbols.length,
      mode: selection.mode,
    },
    funnel: {
      eligible: selection.eligible,
      successfullyAnalyzed: ok.length,
      dataFailures: failed.length,
      stageADirectional: stageA.length,
      stageBPassed: stageB.length,
      validStructureLevels: structureOk.length,
      netRrGte1: gte1.length,
      netRrGte2: gte2.length,
      netRrGte25: gte25.length,
      netRrGte3: gte3.length,
      potentialLongGte3: long3.length,
      potentialShortGte3: short3.length,
      officiallyPublishedNow: published.length,
    },
    failedSymbols: failed.map((r) => ({ symbol: r.symbol, reason: r.failReason })),
    candidatesGte3,
    sampleLowRr: withNet
      .filter((r) => r.netRr != null && r.netRr < 3)
      .sort((a, b) => (a.netRr || 0) - (b.netRr || 0))
      .slice(0, 15)
      .map((r) => ({
        symbol: r.symbol,
        side: r.stageASide,
        netRr: r.netRr,
        grossRr: r.grossRr,
        entry: r.entry,
        stop: r.stop,
        target: r.target,
        levelSource: r.levelSource,
        tickSize: r.tickSize,
      })),
    minNetRrRequired: MIN_NET_RISK_REWARD,
  };

  const outDir = path.join(process.cwd(), "data");
  await fs.mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, `full-universe-diag-${Date.now()}.json`);
  await fs.writeFile(outFile, JSON.stringify(report, null, 2));

  console.log("FULL_UNIVERSE_DIAG " + JSON.stringify(report));
  console.error("\n=== FULL UNIVERSE DIAGNOSTIC ===");
  console.error(`Eligible ${report.universe.eligible} | Analyzed ${report.funnel.successfullyAnalyzed} | Failures ${report.funnel.dataFailures}`);
  console.error(`Runtime ${report.runtimeMin} min | Weight ${weight.used}/${weight.limit}`);
  console.error(`Stage A ${report.funnel.stageADirectional} | Stage B ${report.funnel.stageBPassed} | Structure ${report.funnel.validStructureLevels}`);
  console.error(`Net>=1 ${report.funnel.netRrGte1} | >=2 ${report.funnel.netRrGte2} | >=2.5 ${report.funnel.netRrGte25} | >=3 ${report.funnel.netRrGte3}`);
  console.error(`LONG>=3 ${report.funnel.potentialLongGte3} | SHORT>=3 ${report.funnel.potentialShortGte3} | Official now ${report.funnel.officiallyPublishedNow}`);
  console.error(`Wrote ${outFile}`);
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  process.exit(1);
});
