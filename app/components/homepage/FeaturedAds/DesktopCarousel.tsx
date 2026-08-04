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

{items.map((item, index) => {
  const total = items.length;

  let distance = Math.abs(index - selected);

  if (distance > total / 2) {
    distance = total - distance;
  }

  let scale = "scale-75 opacity-40";
  let z = "z-0";

  if (distance === 0) {
    scale = "scale-110 opacity-100";
    z = "z-30";
  } else if (distance === 1) {
    scale = "scale-95 opacity-80";
    z = "z-20";
  } else if (distance === 2) {
    scale = "scale-90 opacity-60";
    z = "z-10";
  }

return (
  <div
    key={`${item.id}-${index}`}
    className={`
      flex-[0_0_18%]
      px-4
      flex
      justify-center
      transition-all
      duration-500
      ${scale}
      ${z}
    `}
  >
    <FeaturedCard
      item={item}
      favorites={favorites}
      toggleFavorite={toggleFavorite}
      currencyMap={currencyMap}
      active={distance === 0}
    />
  </div>
);
})}

        </div>
      </div>
    </div>
  );
}