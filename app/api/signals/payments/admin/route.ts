import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { billingBackend, decidePayment, listPayments } from "@/lib/signals/billing-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const access = await getSignalsAccess(req);
    if (!access?.isAdmin) return NextResponse.json({ error: "Admin only." }, { status: 403 });
    const payments = await listPayments();
    return NextResponse.json({
      payments,
      pending: payments.filter((item) => item.status === "PENDING" || item.status === "NEEDS_REVIEW"),
      approved: payments.filter((item) => item.status === "APPROVED"),
      rejected: payments.filter((item) => item.status === "REJECTED"),
      backend: billingBackend(),
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Payment requests failed.",
      payments: [],
      backend: billingBackend(),
    }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await getSignalsAccess(req);
    if (!access?.isAdmin) return NextResponse.json({ error: "Admin only." }, { status: 403 });
    const body = await req.json().catch(() => ({})) as { paymentId?: string; action?: string; adminNote?: string; confirmReceived?: boolean };
    const action = body.action === "APPROVE" || body.action === "REJECT" || body.action === "REQUEST_REVIEW" ? body.action : null;
    if (!body.paymentId || !action) return NextResponse.json({ error: "Choose a payment and a decision." }, { status: 400 });
    if (action === "APPROVE" && body.confirmReceived !== true) {
      return NextResponse.json({ error: "Confirm that the EcoCash payment was independently verified before approving." }, { status: 400 });
    }
    const result = await decidePayment({
      paymentId: body.paymentId,
      action,
      adminUid: access.uid,
      adminEmail: access.email,
      adminNote: body.adminNote,
      config: access.config,
    });
    if ("error" in result && result.error) return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment decision failed." }, { status: 502 });
  }
}
