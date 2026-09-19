"use client";

import { useState } from "react";
import Image from "next/image";

export default function StorySceneImage({
  src,
  alt,
  priority = false,
}: {
  src?: string;
  alt: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = src?.trim();
  if (!imageSrc || failed) return null;

  return (
    <figure className="relative mt-5 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      <Image
        src={imageSrc}
        alt={alt}
        width={1600}
        height={900}
        sizes="(max-width: 760px) calc(100vw - 32px), 728px"
        className="h-auto w-full object-contain"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        onError={() => setFailed(true)}
      />
    </figure>
  );
}
