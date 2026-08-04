"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";

import FeaturedCard from "./FeaturedCard";

type Props = {
  items: any[];
  favorites: string[];
  toggleFavorite: (e: any, listingId: string) => void;
  currencyMap: Record<string, string>;
};

export default function MobileCarousel({
  items,
  favorites,
  toggleFavorite,
  currencyMap,
}: Props) {
  return (
    <div className="featured-swiper lg:hidden relative pb-12">

      <Swiper
        effect="coverflow"
        centeredSlides
        loop={items.length > 4}
        grabCursor

        slidesPerView={1.25}
        spaceBetween={-80}

        autoplay={{
          delay: 2800,
          disableOnInteraction: false,
        }}

        coverflowEffect={{
          rotate: 0,
          stretch: -20,
          depth: 420,
          modifier: 2.8,
          scale: 0.75,
          slideShadows: false,
        }}

        modules={[EffectCoverflow, Autoplay]}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="flex justify-center">

            <FeaturedCard
  item={item}
  favorites={favorites}
  toggleFavorite={toggleFavorite}
  currencyMap={currencyMap}
/>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

    </div>
  );
}