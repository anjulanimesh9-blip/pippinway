"use client";

import { useState } from "react";
import {
  CASH_PAYMENT_24H_MESSAGE,
  type PaymentMethod,
} from "@/lib/rewards";
import { submitRewardPaymentDetails } from "@/lib/requestRewardPayment";

type PaymentDetailsFormProps = {
  historyId: string;
  amount: number;
};

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "paypal", label: "PayPal" },
  { value: "wise", label: "Wise" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "other", label: "Other" },
];

export default function PaymentDetailsForm({
  historyId,
  amount,
}: PaymentDetailsFormProps) {
  const [method, setMethod] = useState<PaymentMethod>("paypal");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [accountIdentifier, setAccountIdentifier] = useState("");
  const [bankName, setBankName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitRewardPaymentDetails(historyId, {
        method,
        fullName,
        email,
        accountIdentifier,
        bankName,
        notes,
      });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not submit payment details. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
        Payment details submitted. {CASH_PAYMENT_24H_MESSAGE}
      </p>
    );
  }

  const needsEmail = method === "paypal" || method === "wise";
  const needsBank = method === "bank_transfer";

  return (
    <form onSubmit={onSubmit} className="space-y-3" autoComplete="off">
      <p className="text-sm font-semibold text-white">
        Submit payout details for your ${amount} cash reward
      </p>
      <p className="text-xs text-gray-400">{CASH_PAYMENT_24H_MESSAGE}</p>

      <label className="block text-xs font-semibold text-gray-400">
        Payment method
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          className="mt-1 w-full rounded-xl bg-[#020817] px-3 py-2 text-sm text-white outline-none"
        >
          {METHODS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-semibold text-gray-400">
        Account holder name
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-xl bg-[#020817] px-3 py-2 text-sm text-white outline-none"
        />
      </label>

      {needsEmail && (
        <label className="block text-xs font-semibold text-gray-400">
          Payout email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl bg-[#020817] px-3 py-2 text-sm text-white outline-none"
          />
        </label>
      )}

      {needsBank && (
        <>
          <label className="block text-xs font-semibold text-gray-400">
            Bank name
            <input
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#020817] px-3 py-2 text-sm text-white outline-none"
            />
          </label>
          <label className="block text-xs font-semibold text-gray-400">
            Account number
            <input
              required
              value={accountIdentifier}
              onChange={(e) => setAccountIdentifier(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#020817] px-3 py-2 text-sm text-white outline-none"
            />
          </label>
        </>
      )}

      {method === "other" && (
        <>
          <label className="block text-xs font-semibold text-gray-400">
            Payout email or account
            <input
              value={accountIdentifier}
              onChange={(e) => setAccountIdentifier(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#020817] px-3 py-2 text-sm text-white outline-none"
            />
          </label>
          <label className="block text-xs font-semibold text-gray-400">
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl bg-[#020817] px-3 py-2 text-sm text-white outline-none"
            />
          </label>
        </>
      )}

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-[#FBB03B] px-4 py-2.5 text-sm font-extrabold text-black hover:bg-[#ffc14d] disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit payment details"}
      </button>
    </form>
  );
}
