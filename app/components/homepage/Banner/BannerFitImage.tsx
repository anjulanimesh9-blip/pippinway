"use client";

import type { CSSProperties } from "react";
import ListingPhoto, { BANNER_INFEED_SIZES } from "@/app/components/ListingPhoto";
import type { BannerFitMode } from "@/lib/types/featured";
import {
  BANNER_CONTAIN_IMG_STYLE,
  BANNER_COVER_IMG_STYLE,
  isUsableBannerSrc,
} from "@/lib/bannerImages";
import { canOptimizeBannerSrc, resolveBannerFitMode } from "@/lib/bannerFit";

type Props = {
  src: string;
  alt?: string;
  fitMode?: BannerFitMode | string | null;
  sizes?: string;
  eager?: boolean;
  onError?: () => void;
  onLoad?: () => void;
};

const FRAME_STYLE: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
};

const LAYER_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  overflow: "hidden",
};

const BLUR_LAYER_STYLE: CSSProperties = {
  ...LAYER_STYLE,
  zIndex: 0,
  pointerEvents: "none",
  transform: "scale(1.08)",
  filter: "blur(20px)",
};

const OVERLAY_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 1,
  pointerEvents: "none",
  background: "rgba(0,0,0,0.25)",
};

const FG_STYLE: CSSProperties = {
  ...LAYER_STYLE,
  zIndex: 2,
};

function SlotImage({
  src,
  alt,
  className,
  style,
  sizes,
  eager,
  onError,
  onLoad,
}: {
  src: string;
  alt: string;
  className: string;
  style: CSSProperties;
  sizes: string;
  eager?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}) {
  if (canOptimizeBannerSrc(src)) {
    return (
      <ListingPhoto
        src={src}
        alt={alt}
        sizes={sizes}
        className={className}
        style={style}
        eager={eager}
        onError={onError}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={onError}
      onLoad={onLoad}
    />
  );
}

/**
 * Shared banner renderer: Auto Fit = contain + blurred cover fill.
 * Crop to Fill (`cover`) = existing cover behavior. Same URL for both layers.
 */
export default function BannerFitImage({
  src,
  alt = "Advertisement",
  fitMode,
  sizes = BANNER_INFEED_SIZES,
  eager = false,
  onError,
  onLoad,
}: Props) {
  if (!isUsableBannerSrc(src)) return null;

  const url = src.trim();
  const mode = resolveBannerFitMode(fitMode);
  const isCover = mode === "cover";

  return (
    <div className="banner-fit-frame" style={FRAME_STYLE}>
      {!isCover && (
        <>
          <div className="banner-fit-bg" style={BLUR_LAYER_STYLE} aria-hidden>
            <SlotImage
              src={url}
              alt=""
              className="banner-slot-img banner-slot-img--cover"
              style={BANNER_COVER_IMG_STYLE}
              sizes={sizes}
              eager={eager}
            />
          </div>
          <div className="banner-fit-overlay" style={OVERLAY_STYLE} aria-hidden />
        </>
      )}
      <div className="banner-fit-fg" style={FG_STYLE}>
        <SlotImage
          src={url}
          alt={alt}
          className={
            isCover
              ? "banner-slot-img banner-slot-img--cover"
              : "banner-slot-img banner-slot-img--contain"
          }
          style={isCover ? BANNER_COVER_IMG_STYLE : BANNER_CONTAIN_IMG_STYLE}
          sizes={sizes}
          eager={eager}
          onError={onError}
          onLoad={onLoad}
        />
      </div>
    </div>
  );
}
