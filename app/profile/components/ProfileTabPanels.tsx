"use client";

import { getRelativeTime } from "@/lib/formatPrice";
import { getListingStatus } from "../utils";

type AboutPanelProps = {
  about?: string;
  country?: string;
  displayName: string;
  onEdit: () => void;
};

export function AboutPanel({
  about,
  country,
  displayName,
  onEdit,
}: AboutPanelProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#151A22] p-6">
      <h3 className="text-lg font-bold text-white">About {displayName}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
        {about?.trim() ||
          `${displayName} is a seller on Pippinway${
            country ? ` based in ${country}` : ""
          }. Browse their listings and send a message to learn more.`}
      </p>
      <button
        type="button"
        onClick={onEdit}
        className="mt-5 rounded-xl bg-[#FBB03B] px-4 py-2 text-sm font-bold text-black hover:bg-[#ffc14d]"
      >
        Edit About Me
      </button>
    </div>
  );
}

export function ReviewsPanel({ count = 0 }: { count?: number }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#151A22] py-16 text-center">
      <p className="text-lg font-bold text-white">Reviews</p>
      <p className="mt-2 text-sm text-gray-400">
        {count > 0
          ? `${count} reviews from buyers.`
          : "No reviews yet. Complete more sales to start collecting feedback."}
      </p>
    </div>
  );
}

export function SavedSearchesPanel() {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#151A22] py-16 text-center">
      <p className="text-lg font-bold text-white">Saved Searches</p>
      <p className="mt-2 text-sm text-gray-400">
        You have no saved searches yet. Save a search from the homepage to get
        alerts.
      </p>
    </div>
  );
}

export function ActivityPanel({ ads }: { ads: any[] }) {
  const recent = [...ads]
    .sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt))
    .slice(0, 8);

  if (recent.length === 0) {
    return (
      <div className="rounded-2xl border border-white/8 bg-[#151A22] py-16 text-center text-gray-500">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recent.map((ad) => {
        const status = getListingStatus(ad);
        return (
          <div
            key={ad.id}
            className="flex items-center justify-between rounded-2xl border border-white/8 bg-[#151A22] px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{ad.title}</p>
              <p className="mt-1 text-xs text-gray-400">
                Posted {getRelativeTime(ad.createdAt) || "recently"}
              </p>
            </div>
            <span className="ml-3 shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs capitalize text-gray-300">
              {status}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function toTime(value: unknown): number {
  if (!value) return 0;
  if (typeof (value as { seconds?: number }).seconds === "number") {
    return (value as { seconds: number }).seconds * 1000;
  }
  const date = value instanceof Date ? value : new Date(value as string | number);
  return isNaN(date.getTime()) ? 0 : date.getTime();
}
