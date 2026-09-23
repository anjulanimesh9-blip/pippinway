export const PAYMENT_STATUSES = ["PENDING", "NEEDS_REVIEW", "APPROVED", "REJECTED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type SignalsPayment = {
  id: string;
  uid: string;
  email: string;
  status: PaymentStatus;
  method: "ECOCASH";
  plan: "pro";
  amount: number;
  currency: string;
  transactionRef: string;
  paymentDate: string;
  senderPhone: string;
  notes: string;
  receiptPath: string;
  receiptMime: string;
  createdAt: string;
  updatedAt: string;
  adminUid: string | null;
  adminEmail: string | null;
  decision: PaymentStatus | null;
  decisionAt: string | null;
  adminNote: string;
  subscriptionStart: string | null;
  subscriptionExpires: string | null;
};

export function normalizeTxRef(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 40);
}

export function canSubmitPayment(existing: SignalsPayment[]): { ok: boolean; error?: string } {
  if (existing.some((item) => item.status === "PENDING" || item.status === "NEEDS_REVIEW")) {
    return { ok: false, error: "A payment is already waiting for verification. You can upload another receipt after that request is decided." };
  }
  return { ok: true };
}

export function applyPaymentDecision(input: {
  payment: SignalsPayment;
  action: "APPROVE" | "REJECT" | "REQUEST_REVIEW";
  adminUid: string;
  adminEmail?: string;
  adminNote?: string;
  now?: string;
  subscriptionDays?: number;
  alreadyApprovedRef?: boolean;
}): { payment: SignalsPayment; activate: boolean; idempotent: boolean; error?: string } {
  const now = input.now || new Date().toISOString();
  const note = (input.adminNote || "").trim().slice(0, 400);
  if (input.action === "APPROVE") {
    if (input.alreadyApprovedRef && input.payment.status !== "APPROVED") {
      return { payment: input.payment, activate: false, idempotent: false, error: "This transaction reference was already approved." };
    }
    if (input.payment.status === "APPROVED") {
      return { payment: input.payment, activate: false, idempotent: true };
    }
    const start = input.payment.subscriptionStart || now;
    const days = input.subscriptionDays && input.subscriptionDays > 0 ? input.subscriptionDays : 30;
    const expires = input.payment.subscriptionExpires || new Date(Date.parse(start) + days * 86_400_000).toISOString();
    return {
      payment: {
        ...input.payment,
        status: "APPROVED",
        decision: "APPROVED",
        decisionAt: now,
        adminUid: input.adminUid,
        adminEmail: input.adminEmail || null,
        adminNote: note,
        updatedAt: now,
        subscriptionStart: start,
        subscriptionExpires: expires,
      },
      activate: true,
      idempotent: false,
    };
  }
  if (input.action === "REJECT") {
    if (input.payment.status === "APPROVED") {
      return { payment: input.payment, activate: false, idempotent: false, error: "An approved payment cannot be rejected from this screen." };
    }
    return {
      payment: {
        ...input.payment,
        status: "REJECTED",
        decision: "REJECTED",
        decisionAt: now,
        adminUid: input.adminUid,
        adminEmail: input.adminEmail || null,
        adminNote: note,
        updatedAt: now,
      },
      activate: false,
      idempotent: input.payment.status === "REJECTED",
    };
  }
  if (input.payment.status === "APPROVED") {
    return { payment: input.payment, activate: false, idempotent: false, error: "An approved payment cannot move back to review." };
  }
  return {
    payment: {
      ...input.payment,
      status: "NEEDS_REVIEW",
      decision: "NEEDS_REVIEW",
      decisionAt: now,
      adminUid: input.adminUid,
      adminEmail: input.adminEmail || null,
      adminNote: note,
      updatedAt: now,
    },
    activate: false,
    idempotent: input.payment.status === "NEEDS_REVIEW",
  };
}
