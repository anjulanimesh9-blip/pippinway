"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getCountFromServer,
  query,
  Timestamp,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { BarChart3, Database, Globe } from "lucide-react";
import { auth, db } from "@/app/firebase";

type Ga4WindowMetrics = {
  activeUsers: number | null;
  sessions: number | null;
  pageViews: number | null;
};

type Ga4Report = {
  connected: boolean;
  reason?: string;
  windows?: {
    today: Ga4WindowMetrics;
    days7: Ga4WindowMetrics;
    days30: Ga4WindowMetrics;
  };
  events30d?: Record<string, number>;
};

type CountValue = number | null;

type FirestoreMetrics = {
  users: CountValue;
  listings: CountValue;
  withOwner: CountValue;
  approved: CountValue;
  featured: CountValue;
  rejected: CountValue;
  expired: CountValue;
  sold: CountValue;
  listingsToday: CountValue;
  listings7d: CountValue;
  listings30d: CountValue;
  usersToday: CountValue;
  users7d: CountValue;
  users30d: CountValue;
};

const EMPTY_FIRESTORE: FirestoreMetrics = {
  users: null,
  listings: null,
  withOwner: null,
  approved: null,
  featured: null,
  rejected: null,
  expired: null,
  sold: null,
  listingsToday: null,
  listings7d: null,
  listings30d: null,
  usersToday: null,
  users7d: null,
  users30d: null,
};

function startOfLocalDay(daysAgo = 0): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

async function countOf(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<CountValue> {
  try {
    const ref = collection(db, collectionName);
    const snap = await getCountFromServer(
      constraints.length ? query(ref, ...constraints) : ref
    );
    return snap.data().count;
  } catch {
    return null;
  }
}

async function countUsersSince(since: Date): Promise<CountValue> {
  const stamp = Timestamp.fromDate(since);
  const byMembership = await countOf(
    "users",
    where("membershipStart", ">=", stamp)
  );
  if (byMembership !== null) return byMembership;
  return countOf("users", where("createdAt", ">=", stamp));
}

function formatCount(value: CountValue): string {
  if (value === null) return "—";
  return value.toLocaleString();
}

export default function AdminAnalyticsPage() {
  const [firestore, setFirestore] = useState<FirestoreMetrics>(EMPTY_FIRESTORE);
  const [ga4, setGa4] = useState<Ga4Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const today = startOfLocalDay(0);
      const days7 = startOfLocalDay(6);
      const days30 = startOfLocalDay(29);

      const [
        users,
        listings,
        withOwner,
        approved,
        featured,
        rejected,
        expired,
        sold,
        listingsToday,
        listings7d,
        listings30d,
        usersToday,
        users7d,
        users30d,
      ] = await Promise.all([
        countOf("users"),
        countOf("listings"),
        countOf("listings", where("ownerId", ">", "")),
        countOf("listings", where("approved", "==", true)),
        countOf("listings", where("featured", "==", true)),
        countOf("listings", where("rejected", "==", true)),
        countOf("listings", where("expired", "==", true)),
        countOf("listings", where("sold", "==", true)),
        countOf("listings", where("createdAt", ">=", Timestamp.fromDate(today))),
        countOf("listings", where("createdAt", ">=", Timestamp.fromDate(days7))),
        countOf(
          "listings",
          where("createdAt", ">=", Timestamp.fromDate(days30))
        ),
        countUsersSince(today),
        countUsersSince(days7),
        countUsersSince(days30),
      ]);

      if (!cancelled) {
        setFirestore({
          users,
          listings,
          withOwner,
          approved,
          featured,
          rejected,
          expired,
          sold,
          listingsToday,
          listings7d,
          listings30d,
          usersToday,
          users7d,
          users30d,
        });
      }

      try {
        const user = await new Promise<typeof auth.currentUser>((resolve) => {
          if (auth.currentUser) {
            resolve(auth.currentUser);
            return;
          }
          const unsub = onAuthStateChanged(auth, (next) => {
            unsub();
            resolve(next);
          });
        });
        const token = user ? await user.getIdToken() : null;
        if (token) {
          const res = await fetch("/api/admin/analytics/ga4", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const report = (await res.json()) as Ga4Report;
            if (!cancelled) setGa4(report);
          } else if (res.status === 503) {
            let report: Ga4Report = {
              connected: false,
              reason: "Analytics connection required",
            };
            try {
              const body = (await res.json()) as Ga4Report;
              if (body?.connected === false) report = body;
            } catch {
              // Keep the 503 default reason.
            }
            if (!cancelled) setGa4(report);
          } else if (!cancelled) {
            setGa4(null);
          }
        } else if (!cancelled) {
          setGa4(null);
        }
      } catch {
        if (!cancelled) setGa4(null);
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const gaConnected = ga4?.connected === true && !!ga4.windows;
  const showConnectionRequired = ga4?.connected === false;
  const showFunnel =
    gaConnected &&
    firestore.listings30d !== null &&
    ga4.windows?.days30.activeUsers !== null &&
    ga4.events30d !== undefined;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-400">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#FBB03B]">
          Insights
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <BarChart3 className="h-7 w-7 shrink-0 text-sky-400" />
          Analytics
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-400">
          Firestore cards count marketplace records. GA4 cards show visitors
          only after the Data API is connected. No placeholder traffic numbers.
        </p>
      </div>

      <SectionTitle
        icon={Database}
        label="Firestore"
        hint="Business metrics from listings and users"
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          source="Firestore"
          label="Users"
          value={firestore.users}
        />
        <MetricCard
          source="Firestore"
          label="Listings"
          value={firestore.listings}
        />
        <MetricCard
          source="Firestore"
          label="With owner"
          value={firestore.withOwner}
        />
        <MetricCard
          source="Firestore"
          label="Approved"
          value={firestore.approved}
        />
        <MetricCard
          source="Firestore"
          label="Featured"
          value={firestore.featured}
        />
        <MetricCard
          source="Firestore"
          label="Rejected"
          value={firestore.rejected}
        />
        <MetricCard
          source="Firestore"
          label="Expired"
          value={firestore.expired}
        />
        <MetricCard
          source="Firestore"
          label="Sold"
          value={firestore.sold}
        />
      </div>

      <h3 className="mt-6 mb-3 text-sm font-semibold text-gray-300">
        New listings
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          source="Firestore"
          label="Today"
          value={firestore.listingsToday}
        />
        <MetricCard
          source="Firestore"
          label="7 days"
          value={firestore.listings7d}
        />
        <MetricCard
          source="Firestore"
          label="30 days"
          value={firestore.listings30d}
        />
      </div>

      <h3 className="mt-6 mb-3 text-sm font-semibold text-gray-300">
        New users
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          source="Firestore"
          label="Today"
          value={firestore.usersToday}
        />
        <MetricCard
          source="Firestore"
          label="7 days"
          value={firestore.users7d}
        />
        <MetricCard
          source="Firestore"
          label="30 days"
          value={firestore.users30d}
        />
      </div>

      <SectionTitle
        icon={Globe}
        label="GA4"
        hint="Visitors from Google Analytics Data API"
        className="mt-10"
      />

      {gaConnected ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <WindowCard
              title="Today"
              metrics={ga4.windows!.today}
            />
            <WindowCard
              title="7 days"
              metrics={ga4.windows!.days7}
            />
            <WindowCard
              title="30 days"
              metrics={ga4.windows!.days30}
            />
          </div>
          {ga4.events30d && Object.keys(ga4.events30d).length > 0 ? (
            <>
              <h3 className="mt-6 mb-3 text-sm font-semibold text-gray-300">
                GA4 events · 30 days
              </h3>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {Object.entries(ga4.events30d).map(([name, count]) => (
                  <MetricCard
                    key={name}
                    source="GA4"
                    label={name.replaceAll("_", " ")}
                    value={count}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              No matching GA4 events in the last 30 days yet.
            </p>
          )}
        </>
      ) : showConnectionRequired ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#111827] px-4 py-8 text-center">
          <p className="text-sm font-semibold text-white">
            Analytics connection required
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-gray-400">
            Visitor numbers stay hidden until{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs">
              GA4_PROPERTY_ID
            </code>{" "}
            and server-only service account credentials are set. This panel
            does not invent traffic.
          </p>
        </div>
      ) : null}

      {showFunnel ? (
        <>
          <h3 className="mt-10 mb-3 text-sm font-semibold text-gray-300">
            Funnel · 30 days
          </h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              source="GA4"
              label="Active users"
              value={ga4.windows!.days30.activeUsers}
            />
            <MetricCard
              source="GA4"
              label="Listing views"
              value={ga4.events30d?.view_listing ?? 0}
            />
            <MetricCard
              source="GA4"
              label="Seller contacts"
              value={ga4.events30d?.contact_seller ?? 0}
            />
            <MetricCard
              source="Firestore"
              label="New listings"
              value={firestore.listings30d}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  label,
  hint,
  className = "",
}: {
  icon: typeof Database;
  label: string;
  hint: string;
  className?: string;
}) {
  return (
    <div className={`mb-3 flex min-w-0 items-start gap-2 ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
          {label}
        </h2>
        <p className="text-xs text-gray-500">{hint}</p>
      </div>
    </div>
  );
}

function MetricCard({
  source,
  label,
  value,
}: {
  source: "GA4" | "Firestore";
  label: string;
  value: CountValue;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/8 bg-[#111827] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
            source === "GA4"
              ? "bg-sky-500/15 text-sky-300"
              : "bg-[#FBB03B]/15 text-[#FBB03B]"
          }`}
        >
          {source}
        </span>
      </div>
      <p className="mt-3 truncate text-2xl font-extrabold tabular-nums text-white sm:text-3xl">
        {formatCount(value)}
      </p>
    </div>
  );
}

function WindowCard({
  title,
  metrics,
}: {
  title: string;
  metrics: {
    activeUsers: number | null;
    sessions: number | null;
    pageViews: number | null;
  };
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/8 bg-[#111827] p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {title}
        </p>
        <span className="shrink-0 rounded-md bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-sky-300">
          GA4
        </span>
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500">Active users</dt>
          <dd className="font-semibold tabular-nums text-white">
            {formatCount(metrics.activeUsers)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500">Sessions</dt>
          <dd className="font-semibold tabular-nums text-white">
            {formatCount(metrics.sessions)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500">Page views</dt>
          <dd className="font-semibold tabular-nums text-white">
            {formatCount(metrics.pageViews)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
