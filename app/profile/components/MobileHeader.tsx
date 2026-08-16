"use client";

import Image from "next/image";

interface MobileHeaderProps {
  unreadCount: number;
  onMenu: () => void;
  onMessages: () => void;
}

export default function MobileHeader({
  unreadCount,
  onMenu,
  onMessages,
}: MobileHeaderProps) {
  return (
    <div className="lg:hidden sticky top-0 z-50 bg-[#0B1220] border-b border-white/10">
      <div className="flex items-center justify-between px-4 h-16">
        <button
          onClick={onMenu}
          className="text-2xl"
        >
          ☰
        </button>

        <Image
          src="/images/logo.png"
          alt="logo"
          width={120}
          height={40}
          className="h-10 w-auto object-contain"
          priority
        />

        <button
          className="relative"
          onClick={onMessages}
        >
          🔔

          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}