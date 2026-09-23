import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { getLivePrices } from "@/lib/signals-engine/scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const access = await getSignalsAccess(req);
    if (!access) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
    const feed = await getLivePrices();
    const free = new Set(access.config.freeSymbols);
    const isPro = access.plan === "pro";
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
