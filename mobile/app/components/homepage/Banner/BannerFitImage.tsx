"use client";

import type { CSSProperties } from "react";
import type { BannerFitMode } from "@/lib/types/featured";
import {
  BANNER_CONTAIN_IMG_STYLE,
  BANNER_COVER_IMG_STYLE,
  isUsableBannerSrc,
} from "@/lib/bannerImages";
import { resolveBannerFitMode } from "@/lib/bannerFit";

type Props = {
  src: string;
  alt?: string;
  fitMode?: BannerFitMode | string | null;
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

/**
 * Shared banner renderer (mobile copy): Auto Fit = contain + blurred cover fill.
 */
export default function BannerFitImage({
  src,
  alt = "Advertisement",
  fitMode,
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
            <img
              src={url}
              alt=""
              className="banner-slot-img banner-slot-img--cover"
              style={BANNER_COVER_IMG_STYLE}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
          <div className="banner-fit-overlay" style={OVERLAY_STYLE} aria-hidden />
        </>
      )}
      <div className="banner-fit-fg" style={FG_STYLE}>
        <img
          src={url}
          alt={alt}
          className={
            isCover
              ? "banner-slot-img banner-slot-img--cover"
              : "banner-slot-img banner-slot-img--contain"
          }
          style={isCover ? BANNER_COVER_IMG_STYLE : BANNER_CONTAIN_IMG_STYLE}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={onError}
          onLoad={onLoad}
        />
      </div>
    </div>
  );
}
