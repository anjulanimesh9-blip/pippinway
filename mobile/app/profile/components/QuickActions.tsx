"use client";

import { FaPlus, FaHome } from "react-icons/fa";

interface QuickActionsProps {
  onAddListing: () => void;
  onHome: () => void;
}

export default function QuickActions({
  onAddListing,
  onHome,
}: QuickActionsProps) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-3">

      <button
        onClick={onAddListing}
        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:scale-[1.02] hover:shadow-green-500/20 active:scale-95"
      >
        <FaPlus className="text-sm" />
        Add Listing
      </button>

      <button
        onClick={onHome}
        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:bg-[#1f2937] hover:scale-[1.02] active:scale-95"
      >
        <FaHome className="text-sm" />
        Home
      </button>

    </div>
  );
}