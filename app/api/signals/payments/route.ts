import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSignalsAccess } from "@/lib/signals/access";
import { createPayment, listPayments, saveReceipt } from "@/lib/signals/billing-store";
import { validateReceipt } from "@/lib/signals/image";
import { canSubmitPayment, normalizeTxRef, type SignalsPayment } from "@/lib/signals/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const access = await getSignalsAccess(req);
  if (!access) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const payments = await listPayments(access.uid);
  return NextResponse.json({
    payments,
    subscription: access.subscription,
    plan: access.plan,
    config: {
      proPriceMonthly: access.config.proPriceMonthly,
      currency: access.config.currency,
      subscriptionDays: access.config.subscriptionDays,
      ecocashRecipientNumber: access.config.ecocashRecipientNumber,
      ecocashRecipientName: access.config.ecocashRecipientName,
      ecocashInstructions: access.config.ecocashInstructions,
    },
  });
}

export async function POST(req: NextRequest) {
  const access = await getSignalsAccess(req);
  if (!access) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!access.config.ecocashRecipientNumber || !access.config.ecocashRecipientName) {
    return NextResponse.json({ error: "EcoCash payment details have not been configured by an admin yet." }, { status: 503 });
  }
  const existing = await listPayments(access.uid);
  const gate = canSubmitPayment(existing);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 409 });

  const form = await req.formData();
  const transactionRef = normalizeTxRef(String(form.get("transactionRef") || ""));
  const amount = Number(form.get("amount"));
  const paymentDate = String(form.get("paymentDate") || "");
  const senderPhone = String(form.get("senderPhone") || "").trim().slice(0, 24);
  const notes = String(form.get("notes") || "").trim().slice(0, 400);
  const file = form.get("receipt");
  if (!transactionRef || transactionRef.length < 6) return NextResponse.json({ error: "Enter the EcoCash transaction reference." }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Enter the amount you paid." }, { status: 400 });
  if (!paymentDate || Number.isNaN(Date.parse(paymentDate))) return NextResponse.json({ error: "Enter the payment date." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Upload a receipt screenshot." }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const image = validateReceipt(bytes, file.type);
  if (!image.ok) return NextResponse.json({ error: image.error }, { status: 400 });

  const id = randomUUID();
  const receiptPath = `signals_receipts/${access.uid}/${id}.${image.ext}`;
  await saveReceipt(receiptPath, bytes, image.mime);
  const now = new Date().toISOString();
  const payment: SignalsPayment = {
    id,
    uid: access.uid,
    email: access.email || "",
    status: "PENDING",
    method: "ECOCASH",
    plan: "pro",
    amount: Number(amount.toFixed(2)),
    currency: access.config.currency,
    transactionRef,
    paymentDate,
    senderPhone,
    notes,
    receiptPath,
    receiptMime: image.mime,
    createdAt: now,
    updatedAt: now,
    adminUid: null,
    adminEmail: null,
    decision: null,
    decisionAt: null,
    adminNote: "",
    subscriptionStart: null,
    subscriptionExpires: null,
  };
  await createPayment(payment);
  return NextResponse.json({
    ok: true,
    payment,
    note: "Receipt uploaded. This is not proof that funds were received. Status: Pending Verification.",
  });
}
