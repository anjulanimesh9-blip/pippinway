"use client";

import Link from "next/link";
import type { Banner } from "@/lib/types/featured";
import { isUsableBannerSrc } from "@/lib/bannerImages";

type Props = {
  banner: Banner | null;
  framed?: boolean;
  onImageError?: () => void;
};

export default function FirestoreBanner({
  banner,
  framed = true,
  onImageError,
}: Props) {
  if (!banner || !isUsableBannerSrc(banner.imageUrl)) return null;

  const content = (
    <div
      className={
        framed
          ? "absolute inset-0 overflow-hidden rounded-2xl border border-yellow-500/30 shadow-[0_0_24px_rgba(250,204,21,0.12)]"
          : "absolute inset-0"
      }
    >
      <img
        src={banner.imageUrl.trim()}
        alt="Advertisement"
        className="banner-slot-img"
        onError={onImageError}
      />
    </div>
  );

  if (banner.linkType === "external" && banner.externalUrl) {
    return (
      <a
        href={banner.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 block"
      >
        {content}
      </a>
    );
  }

  if (banner.linkType === "listing" && banner.listingId) {
    return (
      <Link href={`/listings/${banner.listingId}`} className="absolute inset-0 block">
        {content}
      </Link>
    );
  }

  if (banner.linkType === "category") {
    return (
      <Link href="/listings" className="absolute inset-0 block">
        {content}
      </Link>
    );
  }

  return content;
}
