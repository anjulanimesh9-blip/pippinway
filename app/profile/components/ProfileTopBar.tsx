"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, MapPin, Menu, Plus, Search } from "lucide-react";
import { trackSearch } from "@/lib/analytics";
import useNotifications from "../../hooks/useNotifications";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

const LOCATIONS = [
  "All Locations",
  "Sri Lanka",
  "Zimbabwe",
  "India",
  "Singapore",
  "United Kingdom",
  "USA",
  "Canada",
  "Thailand",
  "Maldives",
  "South Africa",
];

type ProfileTopBarProps = {
  userName: string;
  profileImage?: string;
  onMenu: () => void;
};

export default function ProfileTopBar({
  userName,
  profileImage,
  onMenu,
}: ProfileTopBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [showNotifications, setShowNotifications] = useState(false);
  const notifyRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount } = useNotifications();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        notifyRef.current &&
        !notifyRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (location !== "All Locations") params.set("country", location);
    trackSearch({
      search_term: search,
      country: location,
    });
    router.push(params.toString() ? `/?${params.toString()}` : "/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0B0E14]/95 backdrop-blur-xl">
      <div className="flex items-center gap-1.5 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3 lg:px-6">
        <button
          type="button"
          onClick={onMenu}
          className="shrink-0 rounded-xl p-1.5 text-gray-300 hover:bg-white/5 sm:p-2 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <form
          onSubmit={handleSearch}
          className="flex min-w-0 flex-1 items-center overflow-hidden rounded-xl border border-white/10 bg-[#151A22]"
        >
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 sm:left-3"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full min-w-0 bg-transparent py-2 pl-8 pr-2 text-sm text-white outline-none placeholder:text-gray-500 sm:py-2.5 sm:pl-10 sm:pr-3"
              aria-label="Search anything"
            />
          </div>

          <div className="hidden h-8 w-px bg-white/10 sm:block" />

          <div className="relative hidden sm:flex items-center">
            <MapPin
              size={14}
              className="pointer-events-none absolute left-3 text-gray-500"
            />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="appearance-none bg-transparent py-2.5 pl-8 pr-8 text-sm text-gray-300 outline-none"
            >
              {LOCATIONS.map((item) => (
                <option key={item} value={item} className="bg-[#151A22]">
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="mr-1.5 hidden rounded-lg bg-white/5 p-2 text-gray-300 hover:bg-white/10 md:inline-flex"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
        </form>

        <LanguageSwitcher compact />

        <Link
          href="/add-listing"
          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#FBB03B] px-2 py-2 text-xs font-bold text-black transition hover:bg-[#ffc14d] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span className="hidden sm:inline">Post New Ad</span>
          <span className="sm:hidden">Post</span>
        </Link>

        <div className="relative shrink-0" ref={notifyRef}>
          <button
            type="button"
            onClick={() => setShowNotifications((v) => !v)}
            className="relative rounded-xl p-1.5 text-gray-300 hover:bg-white/5 sm:p-2"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#0B0E14]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#151A22] shadow-2xl">
              <div className="border-b border-white/10 p-4 font-bold">
                Notifications
              </div>
              <div className="max-h-72 divide-y divide-white/5 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-4 hover:bg-white/5">
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-gray-400">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(false);
                  router.push("/notifications");
                }}
                className="w-full border-t border-white/10 p-3 text-sm text-sky-400 hover:bg-white/5"
              >
                View All
              </button>
            </div>
          )}
        </div>

        <Link href="/profile" className="relative shrink-0">
          {profileImage ? (
            <img
              src={profileImage}
              alt={userName}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10 sm:h-9 sm:w-9"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-xs font-bold ring-2 ring-white/10 sm:h-9 sm:w-9 sm:text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0B0E14]" />
        </Link>
      </div>
    </header>
  );
}
