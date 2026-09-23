"use client";

import { useState } from "react";
import Image from "next/image";

const LOGO_BASE = "https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color";

export function CoinLogo({ symbol, size = 36 }: { symbol: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const ticker = symbol.replace("USDT", "").toLowerCase();
  const label = ticker.slice(0, 3).toUpperCase();
  const alt = `${ticker.toUpperCase()} logo`;

  if (failed) {
    return (
      <span
        role="img"
        aria-label={alt}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#FBB03B]/15 font-bold text-[#FBB03B]"
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.34) }}
      >
        {label}
      </span>
    );
  }

  return (
    <Image
      src={`${LOGO_BASE}/${ticker}.png`}
      alt={alt}
      width={size}
      height={size}
      className="shrink-0 rounded-full bg-[#0B1220]"
      quality={75}
      onError={() => setFailed(true)}
    />
  );
}
