"use client";

import Link from "next/link";
import type { Banner } from "@/lib/types/featured";

type Props = {
  banner: Banner | null;
  framed?: boolean;
};

export default function FirestoreBanner({ banner, framed = true }: Props) {
  if (!banner?.imageUrl) return null;

  const content = (
    <div
      className={
        framed
          ? "relative h-full overflow-hidden rounded-2xl border border-yellow-500/30 shadow-[0_0_24px_rgba(250,204,21,0.12)]"
          : "relative h-full"
      }
    >
      <img
        src={banner.imageUrl}
        alt="Advertisement"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );

  if (banner.linkType === "external" && banner.externalUrl) {
    return (
      <a
        href={banner.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full w-full"
      >
        {content}
      </a>
    );
  }

  if (banner.linkType === "listing" && banner.listingId) {
    return (
      <Link href={`/listings/${banner.listingId}`} className="block h-full w-full">
        {content}
      </Link>
    );
  }

  if (banner.linkType === "category") {
    return (
      <Link href="/listings" className="block h-full w-full">
        {content}
      </Link>
    );
  }

  return content;
}
