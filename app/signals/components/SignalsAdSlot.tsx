"use client";

import useBanners, { bannersForPlacement } from "@/app/hooks/useBanners";
import BannerRotator from "@/app/components/homepage/Banner/BannerRotator";
import type { BannerPlacement } from "@/lib/types/featured";

export default function SignalsAdSlot({
  placement,
  className,
}: {
  placement: Extract<BannerPlacement, "signals-free" | "signals-pro" | "signals-mobile">;
  className?: string;
}) {
  const { banners } = useBanners(null);
  const assigned = bannersForPlacement(banners, placement);
  if (!assigned.length) return null;
  return (
    <aside className={className} aria-label="Advertisement">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Advertisement</p>
      <BannerRotator
        banners={assigned}
        fallbackImages={[]}
        showAdLabel
        className="relative h-[120px] max-h-[120px] w-full overflow-hidden rounded-2xl sm:h-[160px] sm:max-h-[160px]"
        sizes="(max-width: 768px) 100vw, 40vw"
      />
    </aside>
  );
}
