import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { binanceScanningAllowed } from "@/lib/signals/host-role";
import { getOfficialStore } from "@/lib/signals/official-store";
import { runMonitoringCycle } from "@/lib/signals-engine/monitor-cycle";
import { monitorIsRunning, startSignalsMonitor } from "@/lib/signals-engine/monitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: NextRequest, isAdmin: boolean) {
  if (req.headers.get("x-vercel-cron") === "1") return true;
  const secret = process.env.SIGNALS_MONITOR_SECRET;
  const header = req.headers.get("x-signals-monitor-secret") || req.nextUrl.searchParams.get("secret") || "";
  if (secret && header === secret) return true;
  const cron = process.env.CRON_SECRET;
  const bearer = req.headers.get("authorization") || "";
  if (cron && bearer === `Bearer ${cron}`) return true;
  if (isAdmin) return true;
  return process.env.NODE_ENV !== "production" && !secret && !cron;
}

export async function GET(req: NextRequest) {
  const access = await getSignalsAccess(req);
  if (!authorized(req, Boolean(access?.isAdmin))) {
    return NextResponse.json({ error: "Monitor endpoint requires admin, Vercel Cron, or SIGNALS_MONITOR_SECRET." }, { status: 403 });
  }

  // On Vercel, Binance continuous scanning is blocked (HTTP 451). Serve published health only.
  if (!binanceScanningAllowed()) {
    const health = await getOfficialStore().health().catch(() => null);
    return NextResponse.json({
      ok: true,
      running: false,
      overlapped: false,
      skippedBinance: true,
      note: "Binance scanning is disabled on this host. The persistent worker publishes scanner state to Firestore.",
      cycle: {
        ok: true,
        overlapped: false,
        workerStatus: health?.workerStatus || "offline",
        coverageNote: health?.coverageNote || "Waiting for the persistent Signals worker.",
        durationMs: health?.lastCycleDurationMs ?? null,
        backlog: health?.queueBacklog ?? null,
        weightUsed: health?.requestWeightUsed ?? null,
        analyzed: [],
        eligible: health?.availablePairs ?? 0,
        selected: health?.totalPairs ?? 0,
        long: health?.validatedLong ?? 0,
        short: health?.validatedShort ?? 0,
        wait: health?.waitCount ?? 0,
      },
      health,
    });
  }

  if (process.env.SIGNALS_MONITOR_INLINE === "1") startSignalsMonitor();
  const cycle = await runMonitoringCycle();
  return NextResponse.json({
    ok: cycle.ok,
    running: monitorIsRunning() || cycle.workerStatus === "running",
    overlapped: cycle.overlapped,
    cycle,
    note: cycle.coverageNote,
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
