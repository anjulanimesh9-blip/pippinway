"use client";

import { useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);

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
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        autoplay={
          items.length > 1
            ? { delay: 5000, disableOnInteraction: false }
            : false
        }
      >
        {items.map((item, index) => {
          const len = items.length;
          const distance = Math.min(
            Math.abs(index - activeIndex),
            len - Math.abs(index - activeIndex)
          );
          const loadImage = len <= 3 || distance <= 1;
          return (
          <SwiperSlide key={item.id}>
            <FeaturedCard
              item={item}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              currencyMap={currencyMap}
              mobile
              active={index === activeIndex}
              loadImage={loadImage}
            />
          </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
