import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { getHistory } from "@/lib/signals-engine/history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const access = await getSignalsAccess(req);
    if (!access) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }
    if (access.plan !== "pro") {
      return NextResponse.json({
        locked: true,
        plan: "free",
        live: [],
        liveStats: null,
        backtestStats: null,
        note: "Full signal history and performance analytics are included with Pippinway Signals Pro.",
      });
    }
    const { getOfficialPerformance } = await import("@/lib/signals/performance");
    const { getOfficialStore } = await import("@/lib/signals/official-store");
    const [history, performance, official] = await Promise.all([
      getHistory(),
      getOfficialPerformance(),
      getOfficialStore().listSignals(),
    ]);
    return NextResponse.json({
      ...history,
      locked: false,
      plan: "pro",
      performance,
      official: official.slice(0, 80),
      sources: {
        backtest: "Walk-forward 1H closed-candle test. Past bars only; same-bar stop and target counts as a loss.",
        paper: "Forward-observed official signals. Price-path hits are not brokerage fills.",
        live: "No brokerage execution is connected. Verified fills remain zero.",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "History error" }, { status: 502 });
  }
}
