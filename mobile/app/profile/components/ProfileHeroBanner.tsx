"use client";

import useBanners, { bannersForPlacement } from "@/app/hooks/useBanners";
import BannerRotator, {
  PROFILE_BANNER_CLASS,
} from "@/app/components/homepage/Banner/BannerRotator";

type Props = {
  country?: string | null;
};

export default function ProfileHeroBanner({ country }: Props) {
  const { banners, loading } = useBanners(country ?? null);
  const profileBanners = bannersForPlacement(banners, "profile");

  if (loading && profileBanners.length === 0) return null;
  if (profileBanners.length === 0) return null;

  return (
    <BannerRotator banners={profileBanners} className={PROFILE_BANNER_CLASS} />
  );
}
