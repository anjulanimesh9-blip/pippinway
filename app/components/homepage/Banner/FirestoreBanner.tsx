"use client";

import Link from "next/link";
import type { Banner } from "@/lib/types/featured";

type Props = {
  banner: Banner | null;
};

export default function FirestoreBanner({ banner }: Props) {
  if (!banner?.imageUrl) return null;

  const content = (
    <div className="overflow-hidden rounded-2xl border border-yellow-500/30 shadow-[0_0_24px_rgba(250,204,21,0.12)]">
      <img
        src={banner.imageUrl}
        alt="Advertisement"
        className="w-full h-auto object-cover"
      />
    </div>
  );

  if (banner.linkType === "external" && banner.externalUrl) {
    return (
      <a href={banner.externalUrl} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  if (banner.linkType === "listing" && banner.listingId) {
    return <Link href={`/listings/${banner.listingId}`}>{content}</Link>;
  }

  if (banner.linkType === "category") {
    return <Link href="/listings">{content}</Link>;
  }

  return content;
}
