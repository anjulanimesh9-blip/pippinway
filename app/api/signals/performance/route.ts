import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { getOfficialStore } from "@/lib/signals/official-store";
import { getOfficialPerformance } from "@/lib/signals/performance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const access = await getSignalsAccess(req);
  if (!access) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (access.plan !== "pro" && !access.isAdmin) {
    return NextResponse.json({
      locked: true,
      note: "Official performance analytics are a Pro feature.",
    });
  }
  const store = getOfficialStore();
  const [performance, health, signals] = await Promise.all([
    getOfficialPerformance(),
    store.health(),
    store.listSignals(),
  ]);
  return NextResponse.json({
    locked: false,
    performance,
    health,
    signals: signals.slice(0, 80).map((item) => ({
      id: item.id,
      symbol: item.symbol,
      direction: item.direction,
      originalEntry: item.originalEntry,
      lifecycleStatus: item.lifecycleStatus,
      fillConfirmed: item.fillConfirmed,
      brokerageVerified: item.brokerageVerified,
      openedAt: item.openedAt,
      quantity: item.quantity,
      marginUSDT: item.marginUSDT,
      leverage: item.leverage,
    })),
  });
}
