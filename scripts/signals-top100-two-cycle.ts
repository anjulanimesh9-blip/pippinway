/**
 * Two consecutive Top-100 analysis cycles with forced re-rank.
 * Confirms membership/order can change and health fields are populated.
 */
import { runFullTop50Analysis } from "../lib/signals-engine/monitor-cycle";
import { invalidateUniverse } from "../lib/signals-engine/universe";
import { weightSnapshot } from "../lib/signals-engine/rate-limit";
import { loadPublishedScanSnapshot } from "../lib/signals/scan-snapshot";

function boardSymbols(coins: Array<{ symbol: string }>) {
  return coins.map((c) => c.symbol);
}

function diffMembership(a: string[], b: string[]) {
  const setA = new Set(a);
  const setB = new Set(b);
  return {
    entered: b.filter((s) => !setA.has(s)),
    exited: a.filter((s) => !setB.has(s)),
    orderChanged: a.join(",") !== b.join(","),
    firstDifferIndex: a.findIndex((s, i) => s !== b[i]),
  };
}

async function main() {
  invalidateUniverse();
  const cycle1 = await runFullTop50Analysis();
  const snap1 = await loadPublishedScanSnapshot();
  const symbols1 = boardSymbols(snap1?.response?.coins || []);
  const health1 = snap1?.response?.health;

  // Brief pause then force a second fresh ranking (as a new 5-minute cycle would).
  await new Promise((r) => setTimeout(r, 2_000));
  invalidateUniverse();
  const cycle2 = await runFullTop50Analysis();
  const snap2 = await loadPublishedScanSnapshot();
  const symbols2 = boardSymbols(snap2?.response?.coins || []);
  const health2 = snap2?.response?.health;
  const weight = weightSnapshot();
  const membership = diffMembership(symbols1, symbols2);

  const report = {
    cycle1: {
      ok: cycle1.ok,
      overlapped: cycle1.overlapped,
      eligible: cycle1.eligible,
      selected: cycle1.selected,
      analyzedCount: cycle1.analyzedCount,
      long: cycle1.long,
      short: cycle1.short,
      wait: cycle1.wait,
      durationMs: cycle1.durationMs,
      weightUsed: cycle1.weightUsed,
      rankedAt: health1?.top100RankedAt ?? snap1?.response?.universe?.listedAt ?? null,
      analysisAt: health1?.lastFullUniverseAt ?? cycle1.lastFullUniverseAt ?? null,
      nextAnalysisAt: health1?.nextAnalysisAt ?? null,
      symbolsHead: symbols1.slice(0, 10),
      symbolsTail: symbols1.slice(-5),
    },
    cycle2: {
      ok: cycle2.ok,
      overlapped: cycle2.overlapped,
      eligible: cycle2.eligible,
      selected: cycle2.selected,
      analyzedCount: cycle2.analyzedCount,
      long: cycle2.long,
      short: cycle2.short,
      wait: cycle2.wait,
      durationMs: cycle2.durationMs,
      weightUsed: cycle2.weightUsed,
      rankedAt: health2?.top100RankedAt ?? snap2?.response?.universe?.listedAt ?? null,
      analysisAt: health2?.lastFullUniverseAt ?? cycle2.lastFullUniverseAt ?? null,
      nextAnalysisAt: health2?.nextAnalysisAt ?? null,
      symbolsHead: symbols2.slice(0, 10),
      symbolsTail: symbols2.slice(-5),
    },
    membership: {
      ...membership,
      enteredCount: membership.entered.length,
      exitedCount: membership.exited.length,
      sameLength: symbols1.length === 100 && symbols2.length === 100,
    },
    healthFieldsPresent: {
      eligible: health2?.eligibleUniverse != null,
      selected100: health2?.selectedCount === 100,
      analyzed100: health2?.analyzedCount === 100,
      top100RankedAt: Boolean(health2?.top100RankedAt),
      analysisTimestamp: Boolean(health2?.lastFullUniverseAt || health2?.cycleCompletedAt),
      nextAnalysisAt: Boolean(health2?.nextAnalysisAt),
      analysisDuration: health2?.analysisDurationMs != null || cycle2.analysisDurationMs != null,
      requestWeight: health2?.requestWeightUsed != null || cycle2.weightUsed != null,
      circuit: health2?.binanceCircuitOpen === false || health2?.binanceCircuitOpen === true || weight.circuitOpen === false,
      worker: Boolean(health2?.workerStatus || health2?.monitoring),
    },
    circuitOpen: weight.circuitOpen,
  };

  console.log("TOP100_TWO_CYCLE " + JSON.stringify(report));
  if (
    !cycle1.ok
    || !cycle2.ok
    || cycle1.selected !== 100
    || cycle2.selected !== 100
    || cycle1.analyzedCount !== 100
    || cycle2.analyzedCount !== 100
  ) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  process.exit(1);
});
