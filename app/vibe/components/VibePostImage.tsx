"use client";

import Image from "next/image";
import { useState } from "react";
import { listingPhotoSrc } from "@/app/components/ListingPhoto";

/** Feed column is full-width below `lg`, then ~540px in the 3-column shell. */
export const VIBE_FEED_IMAGE_SIZES = "(max-width: 1023px) 100vw, 540px";
/** Post page is `max-w-2xl` with small horizontal padding. */
export const VIBE_DETAIL_IMAGE_SIZES = "(max-width: 672px) 100vw, 640px";
/** Similar Vibes: 1 column on small screens, 2 columns from `sm`. */
export const VIBE_SIMILAR_IMAGE_SIZES =
  "(max-width: 639px) 100vw, (max-width: 672px) 50vw, 328px";

const optimizeInProd = process.env.NODE_ENV === "production";
/** Allowed by `next.config.ts` `images.qualities`. */
const VIBE_DISPLAY_QUALITY = 75;
const DEFAULT_RATIO = { w: 1200, h: 900 };

function isGifSrc(src: string): boolean {
  return /\.gif(?:$|\?)/i.test(src);
}

export default function VibePostImage({
  src,
  sizes,
  variant,
  priority = false,
}: {
  src: string;
  sizes: string;
  variant: "feed" | "detail" | "similar";
  priority?: boolean;
}) {
  const safeSrc = listingPhotoSrc(src);
  const [failed, setFailed] = useState(false);
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const unoptimized = !optimizeInProd || isGifSrc(safeSrc);
  const loading = priority ? "eager" : "lazy";

  const applyNaturalRatio = (width: number, height: number) => {
    if (width < 1 || height < 1) return;
    setRatio((prev) =>
      prev.w === width && prev.h === height ? prev : { w: width, h: height }
    );
  };

  if (variant === "similar") {
    return (
      <div className="relative aspect-[16/10] w-full bg-black/40">
        {failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={safeSrc}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={safeSrc}
            alt=""
            fill
            sizes={sizes}
            quality={VIBE_DISPLAY_QUALITY}
            loading="lazy"
            unoptimized={unoptimized}
            className="object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    );
  }

  const maxH =
    variant === "detail"
      ? "max-h-[min(62vh,720px)] sm:max-h-[min(70vh,720px)]"
      : "max-h-[min(72vh,820px)]";
  const imageClass = `mx-auto block h-auto w-full object-contain ${maxH}`;
  const ratioStyle = {
    width: "100%",
    height: "auto",
    aspectRatio: `${ratio.w} / ${ratio.h}`,
  } as const;

  if (failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={safeSrc}
        alt=""
        width={ratio.w}
        height={ratio.h}
        loading={loading}
        decoding="async"
        className={imageClass}
        style={ratioStyle}
      />
    );
  }

  return (
    <Image
      src={safeSrc}
      alt=""
      width={ratio.w}
      height={ratio.h}
      sizes={sizes}
      quality={VIBE_DISPLAY_QUALITY}
      loading={loading}
      priority={priority}
      unoptimized={unoptimized}
      className={imageClass}
      style={ratioStyle}
      onLoad={(event) => {
        applyNaturalRatio(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight);
      }}
      onError={() => setFailed(true)}
    />
  );
}
