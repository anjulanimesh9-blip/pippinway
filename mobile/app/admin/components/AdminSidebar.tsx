"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Home,
  LayoutDashboard,
  Package,
  Shield,
  Users,
} from "lucide-react";

const LINK_CLASS =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-gray-400 transition hover:bg-white/5 hover:text-white";

const ACTIVE_CLASS =
  "flex w-full items-center gap-3 rounded-xl bg-[#2563eb] px-3 py-2 text-left text-sm font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.35)]";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/pro-users", label: "Pro Requests", icon: Shield },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminSidebarProps = {
  menuOpen: boolean;
  onClose?: () => void;
};

export default function AdminSidebar({ menuOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

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
          fixed top-0 left-0 z-50 flex h-screen w-[240px] flex-col
          border-r border-white/8 bg-[#0B0E14] px-3 py-4
          transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0
        `}
      >
        <div className="mb-5 flex items-center gap-2 px-2">
          <Image
            src="/images/logo.png"
            alt="Pippinway"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
          <div>
            <p className="text-sm font-bold tracking-tight text-white">
              pippinway.com
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#FBB03B]">
              Admin
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto pr-1">
          <Link href="/" onClick={() => onClose?.()} className={LINK_CLASS}>
            <Home size={17} className="shrink-0 text-current" />
            <span>Home</span>
          </Link>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                className={active ? ACTIVE_CLASS : LINK_CLASS}
              >
                <Icon size={17} className="shrink-0 text-current" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
