"use client";

import Link from "next/link";
import { VIBE_CATEGORY_LIST } from "@/lib/vibe/categories";
import type { VibeCategoryId } from "@/lib/vibe/types";

export default function VibeCategoryNav({
  active,
  onSelect,
}: {
  active: VibeCategoryId;
  onSelect?: (id: VibeCategoryId) => void;
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {VIBE_CATEGORY_LIST.map((category) => {
        const isActive = category.id === active;
        const className = `shrink-0 rounded-full border px-3 py-2 text-sm transition ${
          isActive
            ? "border-[#FBB03B] bg-[#FBB03B]/15 font-semibold text-[#FBB03B]"
            : "border-white/10 bg-[#0F172A] text-gray-300 hover:border-white/20"
        }`;

        if (onSelect) {
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={className}
            >
              {category.emoji} {category.label}
            </button>
          );
        }

        return (
          <Link key={category.id} href={category.href} className={className}>
            {category.emoji} {category.label}
          </Link>
        );
      })}
    </div>
  );
}
