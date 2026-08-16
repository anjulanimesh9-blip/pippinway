"use client";

import useEmblaCarousel from "embla-carousel-react";
import EmblaAutoplay from "embla-carousel-autoplay";
import { useEffect, useMemo, useState } from "react";

import FeaturedCard from "./FeaturedCard";

type Props = {
  items: any[];
  favorites: string[];
  toggleFavorite: (e: any, listingId: string) => void;
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
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      containScroll: false,
    },
    [autoplay]
  );

  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelected(emblaApi.selectedScrollSnap());
    };

    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="hidden lg:block w-full">
      <div ref={emblaRef} className="overflow-hidden py-8">
        <div className="flex items-center">

          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex-[0_0_18%] px-4 flex justify-center"
            >
              <FeaturedCard
                item={item}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                currencyMap={currencyMap}
                active={index === selected}
              />
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}