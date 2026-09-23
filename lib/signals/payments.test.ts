import { describe, expect, it } from "vitest";
import { applyPaymentDecision, canSubmitPayment, normalizeTxRef, type SignalsPayment } from "./payments";

function payment(status: SignalsPayment["status"] = "PENDING"): SignalsPayment {
  return {
    id: "pay-1",
    uid: "user-1",
    email: "user@example.com",
    status,
    method: "ECOCASH",
    plan: "pro",
    amount: 4.99,
    currency: "USD",
    transactionRef: "ECO123456",
    paymentDate: "2026-09-22",
    senderPhone: "",
    notes: "",
    receiptPath: "signals_receipts/user-1/pay-1.jpg",
    receiptMime: "image/jpeg",
    createdAt: "2026-09-22T10:00:00.000Z",
    updatedAt: "2026-09-22T10:00:00.000Z",
    adminUid: null,
    adminEmail: null,
    decision: null,
    decisionAt: null,
    adminNote: "",
    subscriptionStart: null,
    subscriptionExpires: null,
  };
}

describe("EcoCash payment decisions", () => {
  it("does not activate Pro for pending or rejected payments", () => {
    expect(canSubmitPayment([payment("PENDING")]).ok).toBe(false);
    const rejected = applyPaymentDecision({ payment: payment(), action: "REJECT", adminUid: "admin-1" });
    expect(rejected.activate).toBe(false);
    expect(rejected.payment.status).toBe("REJECTED");
  });

  it("activates Pro once and is idempotent on repeat approval", () => {
    const first = applyPaymentDecision({
      payment: payment(),
      action: "APPROVE",
      adminUid: "admin-1",
      now: "2026-09-22T12:00:00.000Z",
      subscriptionDays: 30,
    });
    expect(first.activate).toBe(true);
    expect(first.payment.status).toBe("APPROVED");
    expect(first.payment.subscriptionExpires).toBe("2026-10-22T12:00:00.000Z");
    const again = applyPaymentDecision({
      payment: first.payment,
      action: "APPROVE",
      adminUid: "admin-1",
      now: "2026-09-23T12:00:00.000Z",
      subscriptionDays: 30,
    });
    expect(again.activate).toBe(false);
    expect(again.idempotent).toBe(true);
    expect(again.payment.subscriptionExpires).toBe(first.payment.subscriptionExpires);
  });

  it("rejects a second payment that reuses an approved transaction reference", () => {
    const result = applyPaymentDecision({
      payment: { ...payment(), id: "pay-2" },
      action: "APPROVE",
      adminUid: "admin-1",
      alreadyApprovedRef: true,
    });
    expect(result.activate).toBe(false);
    expect(result.error).toContain("already approved");
  });

  it("normalizes transaction references", () => {
    expect(normalizeTxRef(" eco 123-456 ")).toBe("ECO123-456");
  });
});
