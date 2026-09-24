/**
 * Local lifecycle simulation — proves TARGET_HIT / STOP_HIT / AMBIGUOUS persistence.
 * Does not change strategy; uses synthetic candles against frozen Entry/SL/TP.
 */
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { advanceLifecycle, createLifecycle, resolveOutcomeFromCandle } from "../lib/signals-engine/lifecycle";
import { resolveActiveFromCandles } from "../lib/signals-engine/monitor";
import { OfficialSignalStore, officialFromPublished } from "../lib/signals/official-store";
import { reportFrom } from "../lib/signals/performance";
import type { PublishedSignal } from "../lib/signals-engine/lifecycle";
import type { CoinScan } from "../lib/signals-engine/types";
import { fixtureFilters } from "../lib/signals-engine/exchange-fixtures";
import { buildSetup } from "../lib/signals-engine/trading";

function stamp(offsetMs = 0) {
  return new Date(Date.parse("2026-09-24T10:00:00.000Z") + offsetMs).toISOString();
}

function makePublished(
  symbol: string,
  direction: "LONG" | "SHORT",
  entry: number,
  stop: number,
  target: number,
  pattern: string,
): { coin: CoinScan; published: PublishedSignal } {
  const filters = fixtureFilters(symbol in { ETHUSDT: 1, BTCUSDT: 1, SOLUSDT: 1 } ? symbol : "ETHUSDT");
  const setup = buildSetup({ direction, entry, stop, target, filters })!;
  const lifecycle = {
    ...createLifecycle({
      originalEntry: entry,
      openedAt: stamp(),
      lastCandleCloseAt: stamp(),
      entryConditions: "sim",
    }),
    status: "ACTIVE" as const,
    observedTrigger: true,
    seenAwayFromEntry: true,
    triggerObservedAt: stamp(60_000),
  };
  const published: PublishedSignal = {
    symbol,
    direction,
    entry,
    stop,
    target,
    pattern,
    patternStatus: "CONFIRMED",
    entryConditions: "sim",
    reason: "sim",
    nextStep: "sim",
    lastCandleCloseAt: stamp(),
    lifecycle,
  };
  const coin: CoinScan = {
    symbol,
    available: true,
    price: entry,
    priceUpdatedAt: stamp(),
    stale: false,
    trend: "MIXED",
    direction,
    pattern,
    patternStatus: "CONFIRMED",
    timeframes: [],
    filters,
    setup,
    entryConditions: "sim",
    reason: "sim",
    nextStep: "sim",
    lastCandleCloseAt: stamp(),
    analyzedAt: stamp(),
    originalEntry: entry,
    lifecycle,
  };
  return { coin, published };
}

async function main() {
  const dir = mkdtempSync(path.join(tmpdir(), "lifecycle-sim-"));
  const store = new OfficialSignalStore(path.join(dir, "official.json"), null);

  const cases = [
    {
      name: "LONG_TP",
      ...makePublished("ETHUSDT", "LONG", 100, 99, 102, "Double Bottom"),
      candles: [{ high: 102.4, low: 100.1, close: 102.2, openTime: Date.parse(stamp(60_000)) }],
      expect: "TARGET_HIT" as const,
    },
    {
      name: "LONG_SL",
      ...makePublished("BTCUSDT", "LONG", 50000, 49500, 51000, "1-2-3 Reversal"),
      candles: [{ high: 50100, low: 49400, close: 49450, openTime: Date.parse(stamp(60_000)) }],
      expect: "STOP_HIT" as const,
    },
    {
      name: "SHORT_TP",
      ...makePublished("SOLUSDT", "SHORT", 150, 153, 144, "Double Top"),
      candles: [{ high: 151, low: 143.5, close: 144.2, openTime: Date.parse(stamp(60_000)) }],
      expect: "TARGET_HIT" as const,
    },
    {
      name: "SHORT_SL",
      ...makePublished("XRPUSDT", "SHORT", 0.5, 0.52, 0.46, "Descending Triangle"),
      candles: [{ high: 0.525, low: 0.49, close: 0.522, openTime: Date.parse(stamp(60_000)) }],
      expect: "STOP_HIT" as const,
    },
    {
      name: "AMBIGUOUS",
      ...makePublished("ADAUSDT", "LONG", 1, 0.98, 1.04, "Falling Wedge"),
      candles: [{ high: 1.05, low: 0.97, close: 1.01, openTime: Date.parse(stamp(60_000)) }],
      expect: "AMBIGUOUS" as const,
    },
    {
      name: "OFF_BOARD_STILL_RESOLVES",
      ...makePublished("DOGEUSDT", "LONG", 0.2, 0.19, 0.22, "Trendline Break"),
      candles: [{ high: 0.221, low: 0.201, close: 0.219, openTime: Date.parse(stamp(60_000)) }],
      expect: "TARGET_HIT" as const,
      note: "Simulates symbol no longer in Top 100 board — candle path still resolves",
    },
  ];

  const results: Array<Record<string, unknown>> = [];

  for (const item of cases) {
    const record = officialFromPublished(item.coin, item.published);
    const created = await store.upsertCreate(record);
    const advanced = resolveActiveFromCandles(created.record, item.candles, stamp(120_000), item.candles[0].close);
    expectStatus(item.name, advanced.status, item.expect);

    await store.updateLifecycle({
      id: created.record.id,
      status: advanced.status,
      observedTrigger: true,
      lastPrice: item.candles[0].close,
      lastPriceAt: stamp(120_000),
      closedAt: advanced.closedAt,
      note: advanced.note,
    });

    const qty = created.record.quantity;
    const fees = created.record.totalFeesUSDT;
    const exit =
      advanced.status === "STOP_HIT"
        ? created.record.stop
        : advanced.status === "TARGET_HIT"
          ? created.record.target
          : item.candles[0].close;
    const gross =
      advanced.status === "AMBIGUOUS"
        ? 0
        : created.record.direction === "LONG"
          ? (exit - created.record.originalEntry) * qty
          : (created.record.originalEntry - exit) * qty;

    await store.recordOutcome({
      signalId: created.record.id,
      kind: advanced.status,
      at: advanced.closedAt || stamp(120_000),
      price: exit,
      fillConfirmed: false,
      brokerageVerified: false,
      hypotheticalGrossPnl: Number(gross.toFixed(4)),
      hypotheticalNetPnl: Number((gross - fees).toFixed(4)),
    });

    // Attempt overwrite — must fail to change terminal.
    const blocked = await store.updateLifecycle({
      id: created.record.id,
      status: advanced.status === "TARGET_HIT" ? "STOP_HIT" : "TARGET_HIT",
      observedTrigger: true,
      lastPrice: 1,
      lastPriceAt: stamp(180_000),
      closedAt: stamp(180_000),
      note: "overwrite attempt",
    });

    // WAIT scan must not matter — frozen levels intact.
    const candleCheck = resolveOutcomeFromCandle(
      item.published.direction,
      item.published.stop,
      item.published.target,
      item.candles[0].high,
      item.candles[0].low,
    );

    results.push({
      name: item.name,
      symbol: item.published.symbol,
      direction: item.published.direction,
      pattern: item.published.pattern,
      entry: item.published.entry,
      stop: item.published.stop,
      target: item.published.target,
      outcome: advanced.status,
      candleResolution: candleCheck,
      overwriteBlocked: blocked.changed === false && blocked.record?.lifecycleStatus === advanced.status,
      note: "note" in item ? (item as { note?: string }).note || null : null,
    });
  }

  // Duplicate setup should not double-count in win rate.
  const dup = makePublished("ETHUSDT", "LONG", 100, 99, 102, "Double Bottom");
  const dupRecord = officialFromPublished(dup.coin, {
    ...dup.published,
    lifecycle: { ...dup.published.lifecycle, openedAt: stamp(5_000), status: "TARGET_HIT", closedAt: stamp(130_000) },
  });
  dupRecord.lifecycleStatus = "TARGET_HIT";
  dupRecord.closedAt = stamp(130_000);
  await store.upsertCreate(dupRecord);

  const signals = await store.listSignals();
  const outcomes = await store.outcomes();
  const report = reportFrom(signals, outcomes);

  console.log(
    "LIFECYCLE_SIM " +
      JSON.stringify(
        {
          cases: results,
          performance: {
            wins: report.wins,
            losses: report.losses,
            resolved: report.resolved,
            ambiguous: report.ambiguous,
            active: report.active,
            winRate: report.winRate,
            winRateLabel: report.winRateLabel,
          },
          storedOutcomes: outcomes.map((o) => ({
            signalId: o.signalId,
            kind: o.kind,
            at: o.at,
            price: o.price,
            gross: o.hypotheticalGrossPnl,
            net: o.hypotheticalNetPnl,
          })),
          allPassed: results.every((r) => r.overwriteBlocked === true && r.outcome === r.candleResolution),
        },
        null,
        2,
      ),
  );

  if (!results.every((r) => r.overwriteBlocked === true && r.outcome === r.candleResolution)) {
    process.exitCode = 2;
  }
}

function expectStatus(name: string, actual: string, expected: string) {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, got ${actual}`);
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  process.exit(1);
});
