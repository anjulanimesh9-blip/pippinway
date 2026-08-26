"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collectionGroup,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  type QuerySnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import {
  CASH_PAYMENT_24H_MESSAGE,
  STATUS_PAID,
  STATUS_PAYMENT_DETAILS_SUBMITTED,
  STATUS_PAYMENT_PROCESSING,
  formatRewardDate,
  isCashReward,
  statusBadgeClass,
  type RewardHistoryItem,
  type RewardHistoryStatus,
} from "@/lib/rewards";
import {
  paymentMethodLabel,
  updateCashRewardStatus,
} from "@/lib/requestRewardPayment";

type AdminRewardRow = RewardHistoryItem & {
  userId: string;
};

function createdAtMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  if (typeof (value as { seconds?: number }).seconds === "number") {
    return (value as { seconds: number }).seconds * 1000;
  }
  const parsed = new Date(value as string | number);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function mapHistoryDocs(
  snapshot: QuerySnapshot,
  sortClientSide: boolean
): AdminRewardRow[] {
  const rows = snapshot.docs.map((d) => {
    const data = d.data();
    const userId = String(data.userId || d.ref.parent.parent?.id || "");
    return {
      id: d.id,
      userId,
      ...(data as Omit<RewardHistoryItem, "id">),
    };
  });
  if (sortClientSide) {
    rows.sort((a, b) => createdAtMillis(b.createdAt) - createdAtMillis(a.createdAt));
  }
  return rows;
}

function nextCashAction(status: RewardHistoryStatus | string): {
  label: string;
  nextStatus: "Payment Processing" | "Paid";
} | null {
  if (status === STATUS_PAYMENT_DETAILS_SUBMITTED) {
    return { label: "Mark processing", nextStatus: STATUS_PAYMENT_PROCESSING };
  }
  if (status === STATUS_PAYMENT_PROCESSING) {
    return { label: "Mark paid", nextStatus: STATUS_PAID };
  }
  return null;
}

export default function AdminRewardsPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminRewardRow[]>([]);
  const [filter, setFilter] = useState<"all" | "cash" | "pending">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [references, setReferences] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || snap.data().role !== "admin") {
        router.push("/");
        return;
      }
      setAdminId(user.uid);
    });
    return unsubAuth;
  }, [router]);

  useEffect(() => {
    if (!adminId) return;
    let cancelled = false;
    let unsub = () => {};

    const listen = (withOrder: boolean) => {
      const historyQuery = withOrder
        ? query(collectionGroup(db, "rewardHistory"), orderBy("createdAt", "desc"))
        : query(collectionGroup(db, "rewardHistory"));
      unsub = onSnapshot(
        historyQuery,
        (snapshot) => {
          setRows(mapHistoryDocs(snapshot, !withOrder));
        },
        (err) => {
          console.error("Admin rewards history error:", err);
          if (withOrder && !cancelled) {
            unsub();
            listen(false);
            return;
          }
          setMessage(
            "Could not load reward history. Deploy Firestore indexes if prompted."
          );
        }
      );
    };

    listen(true);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [adminId]);

  const visible = useMemo(() => {
    if (filter === "cash") return rows.filter(isCashReward);
    if (filter === "pending") {
      return rows.filter(
        (row) =>
          isCashReward(row) &&
          row.status !== STATUS_PAID &&
          row.status !== "Completed"
      );
    }
    return rows;
  }, [rows, filter]);

  const advance = async (row: AdminRewardRow) => {
    const action = nextCashAction(row.status);
    if (!action) return;
    setBusyId(row.id);
    setMessage(null);
    try {
      await updateCashRewardStatus({
        userId: row.userId,
        historyId: row.id,
        nextStatus: action.nextStatus,
        paymentReference:
          action.nextStatus === STATUS_PAID
            ? references[row.id]?.trim() || undefined
            : undefined,
      });
      setMessage(
        action.nextStatus === STATUS_PAID
          ? "Marked paid. The customer was notified."
          : "Moved to payment processing."
      );
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Could not update this reward."
      );
    } finally {
      setBusyId(null);
    }
  };

  if (!adminId) {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center text-2xl">
        Checking Admin Access...
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Rewards</h1>
            <p className="mt-2 text-sm text-gray-400">
              Featured Ad credits are added automatically. No approval is needed
              before customers use them. Process cash prizes only.
            </p>
            <p className="mt-1 text-xs text-amber-200">{CASH_PAYMENT_24H_MESSAGE}</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-xl bg-[#111827] px-4 py-2 text-sm text-white hover:bg-[#1f2937]"
          >
            Back to dashboard
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ["all", "All rewards"],
              ["cash", "Cash only"],
              ["pending", "Cash pending"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${
                filter === key
                  ? "bg-blue-600 text-white"
                  : "bg-[#111827] text-gray-300 hover:bg-[#1f2937]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {message && <p className="mb-4 text-yellow-300">{message}</p>}

        {visible.length === 0 ? (
          <p className="text-gray-400">No rewards in this view.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#111827]">
            <table className="min-w-full text-left text-sm text-white">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Reward</th>
                  <th className="px-4 py-3 font-semibold">Spin</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const action = nextCashAction(row.status);
                  const details = row.paymentDetails;
                  const open = expandedId === row.id;
                  return (
                    <tr key={`${row.userId}-${row.id}`} className="border-t border-gray-800">
                      <td className="px-4 py-3 align-top">
                        {row.userName || "—"}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-300">
                        {row.userEmail || "—"}
                      </td>
                      <td className="px-4 py-3 align-top font-semibold">
                        {row.prizeLabel}
                      </td>
                      <td className="px-4 py-3 align-top capitalize text-gray-300">
                        {row.type === "mega" ? "Mega" : "Normal"}
                      </td>
                      <td className="px-4 py-3 align-top whitespace-nowrap text-gray-300">
                        {formatRewardDate(row.createdAt)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadgeClass(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {isCashReward(row) ? (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-400">
                              {row.paymentStatus || row.status}
                            </p>
                            {row.status === STATUS_PAID && (
                              <p className="text-xs text-emerald-300">
                                Paid {formatRewardDate(row.paidAt)}
                                {row.paymentReference
                                  ? ` · ${row.paymentReference}`
                                  : ""}
                              </p>
                            )}
                            {details && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId(open ? null : row.id)
                                }
                                className="text-xs text-blue-400 hover:underline"
                              >
                                {open ? "Hide details" : "View payment details"}
                              </button>
                            )}
                            {open && details && (
                              <div className="max-w-xs rounded-xl border border-white/10 bg-[#020817] p-3 text-xs text-gray-300">
                                <p>Method: {paymentMethodLabel(details.method)}</p>
                                <p>Name: {details.fullName}</p>
                                {details.email ? <p>Email: {details.email}</p> : null}
                                {details.bankName ? <p>Bank: {details.bankName}</p> : null}
                                {details.accountIdentifier ? (
                                  <p>Account: {details.accountIdentifier}</p>
                                ) : null}
                                {details.notes ? <p>Notes: {details.notes}</p> : null}
                              </div>
                            )}
                            {row.status === STATUS_PAYMENT_PROCESSING && (
                              <input
                                value={references[row.id] ?? ""}
                                onChange={(e) =>
                                  setReferences((prev) => ({
                                    ...prev,
                                    [row.id]: e.target.value,
                                  }))
                                }
                                placeholder="Payment reference (optional)"
                                className="w-full rounded-lg bg-[#020817] px-3 py-2 text-xs outline-none"
                              />
                            )}
                            {action ? (
                              <button
                                type="button"
                                disabled={busyId === row.id}
                                onClick={() => advance(row)}
                                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                              >
                                {busyId === row.id ? "Saving..." : action.label}
                              </button>
                            ) : row.status === "Payment Details Required" ||
                              row.status === "Pending" ? (
                              <p className="text-xs text-amber-200">
                                Waiting for customer details
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
