"use client";

import { ZODIAC_DISCLAIMER } from "@/lib/vibe/zodiac";

export default function EntertainmentNote({
  children,
}: {
  children?: string;
}) {
  return (
    <p className="text-[11px] leading-4 text-gray-500">
      {children || ZODIAC_DISCLAIMER}
    </p>
  );
}
