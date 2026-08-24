"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Gift,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  Shield,
  Star,
} from "lucide-react";

export type ProfileNavKey =
  | "dashboard"
  | "listings"
  | "messages"
  | "favorites"
  | "profile"
  | "credits"
  | "payments"
  | "transactions"
  | "packages"
  | "settings"
  | "help";

type SidebarProps = {
  menuOpen: boolean;
  unreadCount: number;
  activeItem: ProfileNavKey;
  userMembership?: string;
  isAdmin?: boolean;
  proRequest?: boolean;
  onNavigate: (key: ProfileNavKey) => void;
  onLogout: () => void;
  onRequestPro: () => void;
  onClose?: () => void;
};

const SIDE_LINK_CLASS =
  "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-gray-400 transition hover:bg-white/5 hover:text-white";

const NAV_ITEMS: Array<{
  key: ProfileNavKey;
  label: string;
  icon: typeof Package;
}> = [
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "favorites", label: "Favorites", icon: Heart },
  { key: "credits", label: "Featured Credits", icon: Star },
  { key: "packages", label: "Packages", icon: Boxes },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "help", label: "Help", icon: HelpCircle },
];

export default function Sidebar({
  menuOpen,
  unreadCount,
  activeItem,
  isAdmin,
  onNavigate,
  onLogout,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const listingsActive =
    pathname === "/profile/listings" || pathname.startsWith("/profile/listings/");

  const handleClick = (key: ProfileNavKey) => {
    onNavigate(key);
    onClose?.();
  };

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 flex h-screen w-[260px] flex-col
          border-r border-white/8 bg-[#0B0E14] px-4 py-5
          transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0
        `}
      >
        <div className="mb-6 flex items-center gap-2 px-2">
          <Image
            src="/images/logo.png"
            alt="Pippinway"
            width={36}
            height={36}
            className="h-9 w-auto object-contain"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-white">
            pippinway.com
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          <Link href="/" onClick={() => onClose?.()} className={SIDE_LINK_CLASS}>
            <Home size={18} />
            <span>Home</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => onClose?.()}
              className={SIDE_LINK_CLASS}
            >
              <Shield size={18} />
              <span>Admin</span>
            </Link>
          )}

          <Link
            href="/rewards"
            onClick={() => onClose?.()}
            className={SIDE_LINK_CLASS}
          >
            <Gift size={18} />
            <span>🎡 Rewards</span>
          </Link>

          <Link
            href="/profile/listings"
            onClick={() => onClose?.()}
            className={`
              relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm
              transition
              ${
                listingsActive
                  ? "bg-[#2563eb] font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.35)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }
            `}
          >
            <Package size={18} />
            <span>My Listings</span>
          </Link>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeItem === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleClick(item.key)}
                className={`
                  relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm
                  transition
                  ${
                    active
                      ? "bg-[#2563eb] font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.35)]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.key === "messages" && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose?.();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}
