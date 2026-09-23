import { NextResponse } from "next/server";
import { binanceScanningAllowed, preferPublishedScanSnapshot } from "@/lib/signals/host-role";
import { loadPublishedScanSnapshot } from "@/lib/signals/scan-snapshot";
import { getSparklines, getTicker24hr, getTickers } from "@/lib/signals-engine/binance";
import { publicMonitorHealth } from "@/lib/signals-engine/scanner";
import { SCAN_SYMBOLS } from "@/lib/signals-engine/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (preferPublishedScanSnapshot() || !binanceScanningAllowed()) {
      const published = await loadPublishedScanSnapshot();
      const bySymbol = new Map((published?.response?.coins || []).map((coin) => [coin.symbol, coin]));
      return NextResponse.json({
        fetchedAt: published?.publishedAt || new Date().toISOString(),
        source: "persistent-worker scan snapshot",
        health: published?.response?.health || publicMonitorHealth(),
        rows: SCAN_SYMBOLS.map((symbol) => {
          const coin = bySymbol.get(symbol);
          return {
            symbol,
            price: coin?.price ?? null,
            changePct: coin?.changePct ?? null,
            sparkline: [] as number[],
          };
        }),
      });
    }

    const [prices, changes, sparklines] = await Promise.all([
      getTickers(SCAN_SYMBOLS),
      getTicker24hr(SCAN_SYMBOLS).catch(() => new Map<string, number>()),
      getSparklines(SCAN_SYMBOLS).catch(() => new Map<string, number[]>()),
    ]);
    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      source: "Binance USDT-M ticker and 1H closed candles",
      health: publicMonitorHealth(),
      rows: SCAN_SYMBOLS.map((symbol) => ({
        symbol,
        price: prices.get(symbol) ?? null,
        changePct: changes.get(symbol) ?? null,
        sparkline: sparklines.get(symbol) || [],
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Ticker unavailable" }, { status: 502 });
  }
}
