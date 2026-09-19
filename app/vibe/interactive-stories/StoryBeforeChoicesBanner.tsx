"use client";

import useBanners, { bannersForPlacement } from "@/app/hooks/useBanners";
import BannerRotator, {
  STORY_BANNER_CLASS,
} from "@/app/components/homepage/Banner/BannerRotator";

export default function StoryBeforeChoicesBanner() {
  const { banners } = useBanners(null);
  const storyBanners = bannersForPlacement(banners, "story-before-choices");

  if (storyBanners.length === 0) return null;

  return (
    <BannerRotator
      banners={storyBanners}
      fallbackImages={[]}
      variant="strip"
      backdrop="dark"
      forceFitMode="auto"
      showAdLabel
      className={`${STORY_BANNER_CLASS} mt-8`}
      sizes="(max-width: 760px) calc(100vw - 32px), 728px"
      eager
    />
  );
}
