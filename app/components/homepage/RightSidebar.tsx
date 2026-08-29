"use client";

import { BANNER_SIDEBAR_SIZES } from "@/app/components/ListingPhoto";
import type { Banner } from "@/lib/types/featured";
import BannerRotator, { SIDEBAR_BANNER_CLASS } from "./Banner/BannerRotator";

type Props = {
  banners: Banner[];
};

export default function RightSidebar({ banners }: Props) {
  if (banners.length === 0) return null;

  return (
    <div className="pl-1">
      <BannerRotator
        banners={banners}
        fallbackImages={[]}
        className={SIDEBAR_BANNER_CLASS}
        sizes={BANNER_SIDEBAR_SIZES}
      />
    </div>
  );
}
