"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import FeaturedCard from "./FeaturedCard";
import type { ListingRecord } from "@/lib/types/featured";

type Props = {
  items: ListingRecord[];
  favorites: string[];
  toggleFavorite: (e: React.MouseEvent, listingId: string) => void;
  currencyMap: Record<string, string>;
};

export default function MobileCarousel({
  items,
  favorites,
  toggleFavorite,
  currencyMap,
}: Props) {
  return (
    <div className="featured-swiper lg:hidden relative pb-4">
      <Swiper
        modules={[Autoplay, Navigation]}
        slidesPerView={1.15}
        spaceBetween={16}
        centeredSlides
        loop={items.length >= 4}
        grabCursor
        navigation
        autoplay={
          items.length > 1
            ? { delay: 5000, disableOnInteraction: false }
            : false
        }
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <FeaturedCard
              item={item}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              currencyMap={currencyMap}
              mobile
              active
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
