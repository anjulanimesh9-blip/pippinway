import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { getPayment, readReceipt } from "@/lib/signals/billing-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const access = await getSignalsAccess(req);
  if (!access) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { id } = await context.params;
  const payment = await getPayment(id);
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (payment.uid !== access.uid && !access.isAdmin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const receipt = await readReceipt(payment.receiptPath);
  if (!receipt) return NextResponse.json({ error: "Receipt is not available." }, { status: 404 });
  return new NextResponse(new Uint8Array(receipt.bytes), {
    headers: {
      "Content-Type": receipt.mime,
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
    },
  });
}
