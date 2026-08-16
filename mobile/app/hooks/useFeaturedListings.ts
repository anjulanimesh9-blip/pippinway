"use client";

import { useEffect, useMemo, useState } from "react";

export default function useFeaturedListings(
  listings: any[],
  selectedCategory: string
) {
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  const featuredListings = useMemo(
    () => listings.filter((item) => item.featured),
    [listings]
  );

  const mixedListings = useMemo(() => {
    const normalAds = listings.filter(
      (item) => !item.featured
    );

    const featuredAds = [...featuredListings];

    if (featuredAds.length > 1) {
      const shift =
        currentFeaturedIndex % featuredAds.length;

      featuredAds.push(
        ...featuredAds.splice(0, shift)
      );
    }

    const mixed = [...normalAds];

    featuredAds.forEach((ad) => {
      const randomIndex = Math.floor(
        Math.random() * (mixed.length + 1)
      );

      mixed.splice(randomIndex, 0, ad);
    });

    return mixed;
  }, [
    listings,
    featuredListings,
    currentFeaturedIndex,
  ]);

  useEffect(() => {
    if (featuredListings.length < 2) return;

    const interval = setInterval(() => {
      setCurrentFeaturedIndex((prev) =>
        (prev + 1) % featuredListings.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredListings.length]);

  useEffect(() => {
    setCurrentFeaturedIndex(0);
  }, [selectedCategory]);

  return {
    featuredListings,
    mixedListings,
  };
}