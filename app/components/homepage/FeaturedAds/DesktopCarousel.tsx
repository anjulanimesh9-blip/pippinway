"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import EmblaAutoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useMemo, useState } from "react";

import FeaturedCard from "./FeaturedCard";
import type { ListingRecord } from "@/lib/types/featured";

type Props = {
  items: ListingRecord[];
  favorites: string[];
  toggleFavorite: (e: React.MouseEvent, listingId: string) => void;
  currencyMap: Record<string, string>;
};

export default function DesktopCarousel({
  items,
  favorites,
  toggleFavorite,
  currencyMap,
}: Props) {
  const autoplay = useMemo(
    () =>
      EmblaAutoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: items.length > 1, align: "start", containScroll: "trimSnaps" },
    items.length > 1 ? [autoplay] : []
  );

  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="hidden lg:block relative w-full">
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous featured ads"
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-2 text-white hover:bg-black/80"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next featured ads"
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-2 text-white hover:bg-black/80"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <div ref={emblaRef} className="overflow-hidden px-10 py-4">
        <div className="flex gap-4">
          {items.map((item, index) => {
            const len = items.length;
            const distance = Math.min(
              Math.abs(index - selected),
              len - Math.abs(index - selected)
            );
            const loadImage = len <= 4 || distance <= 2;
            return (
            <div key={item.id} className="min-w-0 flex-[0_0_32%]">
              <FeaturedCard
                item={item}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                currencyMap={currencyMap}
                active={index === selected}
                loadImage={loadImage}
              />
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
