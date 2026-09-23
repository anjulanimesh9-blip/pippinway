import { NextResponse } from "next/server";
import { getSignalsConfig } from "@/lib/signals/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getSignalsConfig();
  return NextResponse.json({
    ...config,
    cardCheckoutEnabled: false,
    billingNote: "Card checkout stays disabled. EcoCash is a manual payment request reviewed by an admin.",
  });
}
