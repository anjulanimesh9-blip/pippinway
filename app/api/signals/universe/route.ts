import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { listEligiblePerpetuals, quoteVolumeMap, selectUniverse } from "@/lib/signals-engine/universe";
import { SCAN_SYMBOLS } from "@/lib/signals-engine/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const access = await getSignalsAccess(req);
    if (!access) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
    const listed = await listEligiblePerpetuals();
    const volume = await quoteVolumeMap().catch(() => ({} as Record<string, number>));
    const mode50 = selectUniverse({ mode: "50", eligible: listed.symbols, quoteVolume: volume });
    const mode100 = selectUniverse({ mode: "100", eligible: listed.symbols, quoteVolume: volume });
    return NextResponse.json({
      eligible: listed.count,
      listedAt: listed.fetchedAt,
      coreWatchlist: SCAN_SYMBOLS.length,
      modes: {
        "15": SCAN_SYMBOLS.length,
        "50": mode50.symbols.length,
        "100": mode100.symbols.length,
        all: listed.count,
        custom: access.settings.watchlist.length,
      },
      plan: access.plan,
      allowedModes: access.plan === "pro" ? ["15", "50", "100", "all", "custom"] : ["15"],
      watchlist: access.settings.watchlist,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Universe unavailable" }, { status: 502 });
  }
}
