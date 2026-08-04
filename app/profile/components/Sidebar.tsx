"use client";

import Image from "next/image";

type SidebarProps = {
  menuOpen: boolean;
  unreadCount: number;
  userMembership?: string;
  onDashboard: () => void;
  onMyListings: () => void;
  onAddListing: () => void;
  onMessages: () => void;
  onFavorites: () => void;
  onSettings: () => void;
  onLogout: () => void;
  onClose?: () => void;
};

export default function Sidebar({
  menuOpen,
  unreadCount,
  userMembership,
  onDashboard,
  onMyListings,
  onAddListing,
  onMessages,
  onFavorites,
  onSettings,
  onLogout,
  onClose,
}: SidebarProps) {
  const itemClass =
    "flex items-center gap-3 w-full rounded-2xl px-5 py-4 text-left transition hover:bg-[#1e293b]";

  const handleClick = (callback: () => void) => {
    callback();
    onClose?.();
  };

  return (
    <>
      {/* Overlay */}
      {menuOpen && (
  <div
    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
    onClick={onClose}
  />
)}s

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-72
          bg-[#0f172a]
          border-r border-gray-800
          flex flex-col
          p-6
          transform transition-transform duration-300 ease-in-out

          ${menuOpen ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
          lg:static
        `}
      >
        <div className="mb-10 flex justify-center">
          <Image
            src="/images/logo.png"
            alt="Pippinway"
            width={150}
            height={50}
            priority
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={() => handleClick(onDashboard)}
            className={`${itemClass} bg-blue-600`}
          >
            🏠 Dashboard
          </button>

          <button
            onClick={() => handleClick(onMyListings)}
            className={itemClass}
          >
            📦 My Listings
          </button>

          <button
            onClick={() => handleClick(onAddListing)}
            className={itemClass}
          >
            ➕ Add Listing
          </button>

          <button
            onClick={() => handleClick(onMessages)}
            className={`${itemClass} relative`}
          >
            💬 Messages

            {unreadCount > 0 && (
              <span className="absolute right-4 rounded-full bg-red-600 px-2 py-1 text-xs">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleClick(onFavorites)}
            className={itemClass}
          >
            ❤️ Favorites
          </button>

          <button
            onClick={() => handleClick(onSettings)}
            className={itemClass}
          >
            ⚙️ Settings
          </button>
        </div>

        <div className="mt-auto">
          <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-center">
            <p className="text-xs text-gray-400">
              Current Plan
            </p>

            <p className="mt-2 font-bold">
              {userMembership === "pro"
                ? "⭐ PRO MEMBER"
                : "FREE MEMBER"}
            </p>
          </div>

          <button
            onClick={() => handleClick(onLogout)}
            className="w-full rounded-2xl bg-red-600 py-4 font-semibold transition hover:bg-red-700"
          >
            🚪 Logout
          </button>

          <p className="mt-6 text-center text-xs text-gray-500">
            Pippinway v1.0
          </p>
        </div>
      </aside>
    </>
  );
}