import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { binanceScanningAllowed, preferPublishedScanSnapshot } from "@/lib/signals/host-role";
import { loadPublishedScanSnapshot } from "@/lib/signals/scan-snapshot";
import { getLivePrices } from "@/lib/signals-engine/scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const access = await getSignalsAccess(req);
    if (!access) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
    const free = new Set(access.config.freeSymbols);
    const isPro = access.plan === "pro";

    if (preferPublishedScanSnapshot() || !binanceScanningAllowed()) {
      const published = await loadPublishedScanSnapshot();
      const prices = (published?.response?.coins || []).map((coin) => ({
        symbol: coin.symbol,
        price: coin.price,
        changePct: coin.changePct ?? null,
        available: coin.available !== false,
        quoteVolume: coin.quoteVolume ?? null,
      }));
      return NextResponse.json({
        fetchedAt: published?.publishedAt || new Date().toISOString(),
        source: "persistent-worker",
        prices: prices.map((row) =>
          isPro || free.has(row.symbol) ? row : { ...row, locked: true },
        ),
        plan: access.plan,
      });
    }

    const feed = await getLivePrices();
    return NextResponse.json({
      ...feed,
      prices: feed.prices.map((row) =>
        isPro || free.has(row.symbol) ? row : { ...row, price: row.price, locked: true },
      ),
      plan: access.plan,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Price error" }, { status: 502 });
  }
}
