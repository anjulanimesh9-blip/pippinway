"use client";

import Link from "next/link";
import useNotifications from "../hooks/useNotifications";
import { useI18n } from "@/lib/i18n";

export default function NotificationsPage() {
  const { t } = useI18n();
  const {
    notifications,
    loading,
    markAsRead,
  } = useNotifications();

  return (
    <div className="min-h-screen bg-[#020817] p-6 text-white">
      <h1 className="mb-6 text-3xl font-bold">
        🔔 {t("notifications.title")}
      </h1>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6">
          {t("common.loading")}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6">
          <p className="text-gray-400">
            {t("notifications.noneYet")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`cursor-pointer rounded-2xl border p-5 transition hover:border-blue-500 ${
                notification.isRead
                  ? "border-white/10 bg-[#0F172A]"
                  : "border-blue-500 bg-blue-950/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {notification.title}
                </h2>

                {!notification.isRead && (
                  <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold">
                    {t("common.new")}
                  </span>
                )}
              </div>

              <p className="mt-2 text-gray-300">
                {notification.message}
              </p>

              {notification.listingId && (
                <Link
                  href={`/listings/${notification.listingId}`}
                  onClick={() => markAsRead(notification.id)}
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
                >
                  {t("notifications.viewListing")}
                </Link>
              )}

              {notification.createdAt?.toDate && (
                <p className="mt-3 text-xs text-gray-500">
                  {notification.createdAt
                    .toDate()
                    .toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
