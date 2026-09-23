import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { buildFreeDailyPayload } from "@/lib/signals/free-daily";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const access = await getSignalsAccess(req);
    if (!access) {
      return NextResponse.json({ error: "Sign in with your Pippinway account to use Signals." }, { status: 401 });
    }
    if (access.plan === "pro") {
      return NextResponse.json({
        plan: "pro",
        subscription: access.subscription,
        config: { proPriceMonthly: access.config.proPriceMonthly, currency: access.config.currency },
      });
    }
    const force = req.nextUrl.searchParams.get("force") === "1";
    return NextResponse.json(await buildFreeDailyPayload(access, force));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Daily signals error" }, { status: 502 });
  }
}
