import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { getCandles, isAllowedInterval } from "@/lib/signals-engine/binance";
import { SCAN_INTERVALS } from "@/lib/signals-engine/types";
import { isValidSymbol } from "@/lib/signals-engine/universe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const access = await getSignalsAccess(req);
    if (!access) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const symbol = (req.nextUrl.searchParams.get("symbol") || "").toUpperCase();
    const interval = (req.nextUrl.searchParams.get("interval") || "15m").toLowerCase();
    const allowedIntervals = new Set<string>(SCAN_INTERVALS);
    if (!isValidSymbol(symbol) || !isAllowedInterval(interval) || !allowedIntervals.has(interval)) {
      return NextResponse.json({ error: "Choose a scanned pair and a supported timeframe." }, { status: 400 });
    }

    const isPro = access.plan === "pro";
    const { getRevealRecord } = await import("@/lib/signals/billing-store");
    const revealed = new Set(((await getRevealRecord(access.uid))?.symbols || []).map((item) => item.toUpperCase()));
    if (!isPro && !revealed.has(symbol) && !access.config.freeShowFullDetails) {
      return NextResponse.json({
        symbol,
        interval,
        locked: true,
        candles: [],
        error: "Full charts for this pair are a Pro feature.",
      });
    }

    const candles = await getCandles(symbol, interval, 180);
    return NextResponse.json({
      symbol,
      interval,
      locked: false,
      fetchedAt: new Date().toISOString(),
      candles: candles
        .filter((row) => Number.isFinite(row.open) && Number.isFinite(row.close) && Number.isFinite(row.high) && Number.isFinite(row.low))
        .map((row) => ({
          time: Math.floor(row.openTime / 1000),
          open: row.open,
          high: row.high,
          low: row.low,
          close: row.close,
          closed: row.closed,
        })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Chart data unavailable" }, { status: 502 });
  }
}
