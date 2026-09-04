"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import ListingPhoto, { RELATED_AD_SIZES } from "@/app/components/ListingPhoto";
import { formatPrice } from "@/lib/formatPrice";
import { useI18n } from "@/lib/i18n";

type RelatedAdsProps = {
  relatedAds: any[];
  currencyMap?: Record<string, string>;
  sellerName?: string;
};

export default function RelatedAds({
  relatedAds,
  sellerName,
}: RelatedAdsProps) {
  const { t } = useI18n();
  if (!relatedAds.length) return null;

  const heading = sellerName
    ? t("listing.moreFrom", { name: sellerName })
    : t("listing.similarAds");

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <h2 className="mb-4 text-lg font-bold text-white">{heading}</h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {relatedAds.slice(0, 8).map((ad) => {
          return (
            <Link
              key={ad.id}
              href={`/listings/${ad.id}`}
              className="overflow-hidden rounded-lg border border-white/10 bg-[#111827] transition hover:border-white/20"
            >
              <div className="relative aspect-[4/3] bg-[#0B0E14]">
                <ListingPhoto
                  src={ad.imageUrls?.[0] || ad.imageUrl}
                  alt={ad.title}
                  sizes={RELATED_AD_SIZES}
                  className="object-cover"
                />
                {ad.featured && (
                  <span className="absolute left-2 top-2 rounded bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-black">
                    {t("listing.featured")}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-emerald-400">
                  {formatPrice(ad.price ?? ad.amount, ad.country)}
                </p>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-white">
                  {ad.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={11} />
                  <span className="truncate">
                    {ad.location || t("listing.unknown")}
                  </span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
