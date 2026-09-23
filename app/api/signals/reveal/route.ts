import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { getRevealRecord, revealSymbol } from "@/lib/signals/billing-store";
import { allowanceFromRecord } from "@/lib/signals/quota";
import { isValidSymbol } from "@/lib/signals-engine/universe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const access = await getSignalsAccess(req);
  if (!access) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const record = await getRevealRecord(access.uid);
  return NextResponse.json({
    plan: access.plan,
    subscription: access.subscription,
    allowance: allowanceFromRecord(record, access.config.freeDailyReveals),
  });
}

export async function POST(req: NextRequest) {
  const access = await getSignalsAccess(req);
  if (!access) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => ({})) as { symbol?: string };
  const symbol = String(body.symbol || "").toUpperCase();
  if (!isValidSymbol(symbol)) return NextResponse.json({ error: "Choose a valid USDT-M perpetual pair." }, { status: 400 });
  if (access.plan === "pro") {
    const record = await getRevealRecord(access.uid);
    return NextResponse.json({ allowed: true, already: true, consumed: false, symbol, allowance: allowanceFromRecord(record, access.config.freeDailyReveals), plan: "pro" });
  }
  const existing = await getRevealRecord(access.uid);
  const watchlist = new Set(access.config.freeSymbols.map((item) => item.toUpperCase()));
  const already = Boolean(existing?.symbols.includes(symbol));
  if (!already && !watchlist.has(symbol)) {
    return NextResponse.json({
      error: "That pair is not on the Free watchlist.",
      allowed: false,
      allowance: allowanceFromRecord(existing, access.config.freeDailyReveals),
    }, { status: 403 });
  }
  const result = await revealSymbol(access.uid, symbol, access.config.freeDailyReveals);
  if (!result.allowed) {
    return NextResponse.json({
      error: `Free accounts can reveal ${access.config.freeDailyReveals} unique complete signals per UTC day. Upgrade to Pro for unlimited access.`,
      allowed: false,
      allowance: result.allowance,
    }, { status: 403 });
  }
  return NextResponse.json({
    allowed: true,
    already: result.already,
    consumed: result.consumed,
    symbol,
    allowance: result.allowance,
    plan: "free",
  });
}
