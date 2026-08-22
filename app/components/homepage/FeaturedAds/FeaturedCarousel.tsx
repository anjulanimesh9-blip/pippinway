"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import EmblaAutoplay from "embla-carousel-autoplay";

import FeaturedCard from "./FeaturedCard";
import { isActiveFeaturedListing } from "@/lib/listingFeatured";
import type { ListingRecord } from "@/lib/types/featured";

type Listing = {
  id: string;
  title: string;
  imageUrl?: string;
  imageUrls?: string[];
  featured?: boolean;
  price?: number;
  category?: string;
  location?: string;
  country?: string;
};

type Props = {
  ads: Listing[];

  favorites: string[];
  toggleFavorite: (
    e: React.MouseEvent,
    listingId: string
  ) => void;

  currencyMap: Record<string, string>;

  className?: string;
};

function shuffleArray<T>(array: T[]) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {

    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [arr[i], arr[j]] = [
      arr[j],
      arr[i],
    ];
  }

  return arr;
}

export default function FeaturedCarousel({

  ads,

  favorites,

  toggleFavorite,

  currencyMap,

  className = "",

}: Props) {

  const featured = useMemo(

    () => ads.filter((item) => isActiveFeaturedListing(item as ListingRecord)),

    [ads]

  );

  const [items, setItems] = useState<Listing[]>(() =>
    shuffleArray(featured)
  );

  useEffect(() => {

    setItems(shuffleArray(featured));

  }, [featured]);

  useEffect(() => {

    const timer = setInterval(() => {

      setItems((prev) => shuffleArray(prev));

    }, 25000);

    return () => clearInterval(timer);

  }, []);
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
      dragFree: false,
    },
    [autoplay]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    setSelectedIndex(
      emblaApi.selectedScrollSnap()
    );
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();

    emblaApi.on("select", onSelect);

    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, items.length]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  if (!items.length) {
    return null;
  }
    return (
    <section className={className}>

      <div className="relative">

        {/* Embla */}

        <div
          ref={emblaRef}
          className="overflow-hidden"
        >

          <div className="flex items-center">

            {items.map((item, index) => (

              <div
                key={item.id}
                className="flex-[0_0_18%] flex justify-center px-3"
              >

                <FeaturedCard
                  item={item}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  currencyMap={currencyMap}
                />

              </div>

            ))}

          </div>

        </div>

        {/* Previous */}

        <button
          onClick={scrollPrev}
          className="
            absolute
            left-2
            top-1/2
            -translate-y-1/2

            z-40

            h-11
            w-11

            rounded-full

            bg-black/60
            backdrop-blur

            flex
            items-center
            justify-center

            text-white

            hover:bg-black/80
            transition
          "
        >
          ‹
        </button>

        {/* Next */}

        <button
          onClick={scrollNext}
          className="
            absolute
            right-2
            top-1/2
            -translate-y-1/2

            z-40

            h-11
            w-11

            rounded-full

            bg-black/60
            backdrop-blur

            flex
            items-center
            justify-center

            text-white

            hover:bg-black/80
            transition
          "
        >
          ›
        </button>
                {/* Progress Dots */}

        <div className="mt-8 flex justify-center gap-3">

          {items.map((_, index) => (

            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`
                h-2.5
                rounded-full
                transition-all
                duration-300

                ${
                  index === selectedIndex
                    ? "w-8 bg-violet-500"
                    : "w-2.5 bg-white/25 hover:bg-white/50"
                }
              `}
            />

          ))}

        </div>

        {/* Pippin Walker */}

        <div
          className="
            pippin-walker
            hidden
            lg:block
          "
        >
          <div className="relative">

            <span className="pippin-hi">
              Hi 👋
            </span>

            <img
              src="/mascot/pippin-wave.png"
              alt="Pippin"
              className="pippin-wave"
            />

          </div>
        </div>

      </div>

    </section>

  );
}