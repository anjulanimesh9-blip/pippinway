"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, Store, X } from "lucide-react";
import { useGuestAuthPrompt } from "./GuestAuthPrompt";
import useAuth from "../hooks/useAuth";
import { VIBE_PATHS } from "@/lib/vibe/constants";

function focusVibeComposer() {
  document.getElementById("vibe-composer-panel")?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  window.setTimeout(() => {
    document.getElementById("vibe-composer")?.focus();
  }, 280);
}

export default function PostChooserSheet({
  open,
  onClose,
  addListingHref,
}: {
  open: boolean;
  onClose: () => void;
  addListingHref: string;
}) {
  const { user } = useAuth();
  const { requireAuth } = useGuestAuthPrompt();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const goMarketplace = () => {
    onClose();
    requireAuth(addListingHref);
  };

  const goVibe = () => {
    onClose();
    if (user && pathname === "/vibe") {
      router.replace(VIBE_PATHS.compose);
      focusVibeComposer();
      return;
    }
    requireAuth(VIBE_PATHS.compose);
  };

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-chooser-title"
        className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-white/10 bg-[#0B1220] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <div className="mb-3 flex items-center justify-between">
          <h2 id="post-chooser-title" className="text-base font-semibold text-white">
            Create a post
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2 pb-2">
          <button
            type="button"
            onClick={goMarketplace}
            className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3.5 text-left transition hover:border-[#FBB03B]/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBB03B]/15 text-lg">
              🛍️
            </span>
            <span>
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                Post to Marketplace
                <Store className="h-3.5 w-3.5 text-[#FBB03B]" />
              </span>
              <span className="mt-0.5 block text-xs text-gray-400">
                Sell an item or publish an ad
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={goVibe}
            className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3.5 text-left transition hover:border-[#FBB03B]/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBB03B]/15 text-lg">
              ✨
            </span>
            <span>
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                Post to Vibe
                <Sparkles className="h-3.5 w-3.5 text-[#FBB03B]" />
              </span>
              <span className="mt-0.5 block text-xs text-gray-400">
                Share something with the community
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
