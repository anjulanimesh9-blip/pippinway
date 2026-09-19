"use client";

import Link from "next/link";
import { BANNER_INFEED_SIZES } from "@/app/components/ListingPhoto";
import type { Banner, BannerFitMode } from "@/lib/types/featured";
import { isUsableBannerSrc } from "@/lib/bannerImages";
import { safeBannerHref } from "@/lib/bannerFit";
import BannerFitImage from "./BannerFitImage";

type Props = {
  banner: Banner | null;
  framed?: boolean;
  eager?: boolean;
  sizes?: string;
  backdrop?: "blur" | "dark";
  forceFitMode?: BannerFitMode;
  onImageError?: () => void;
};

export default function FirestoreBanner({
  banner,
  framed = true,
  eager = false,
  sizes = BANNER_INFEED_SIZES,
  backdrop,
  forceFitMode,
  onImageError,
}: Props) {
  if (!banner || !isUsableBannerSrc(banner.imageUrl)) return null;

  const content = (
    <div
      className={
        framed
          ? "relative h-full w-full overflow-hidden rounded-2xl border border-yellow-500/30 shadow-[0_0_24px_rgba(250,204,21,0.12)]"
          : "relative h-full w-full overflow-hidden"
      }
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <BannerFitImage
        src={banner.imageUrl.trim()}
        alt="Advertisement"
        fitMode={forceFitMode ?? banner.fitMode}
        sizes={sizes}
        eager={eager}
        backdrop={backdrop}
        onError={onImageError}
      />
    </div>
  );

  const externalHref =
    banner.linkType === "external" && banner.externalUrl
      ? safeBannerHref(banner.externalUrl)
      : "";

  if (externalHref) {
    return (
      <a
        href={externalHref}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 block h-full w-full"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {content}
      </a>
    );
  }

  if (banner.linkType === "listing" && banner.listingId) {
    return (
      <Link
        href={`/listings/${banner.listingId}`}
        className="absolute inset-0 block h-full w-full"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {content}
      </Link>
    );
  }

  if (banner.linkType === "category") {
    return (
      <Link
        href="/listings"
        className="absolute inset-0 block h-full w-full"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {content}
      </Link>
    );
  }

  return content;
}
