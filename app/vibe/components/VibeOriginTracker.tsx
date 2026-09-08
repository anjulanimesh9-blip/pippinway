"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { rememberLastInternalPath } from "@/lib/vibe/postOrigin";

export default function VibeOriginTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/vibe/post/")) return;
    rememberLastInternalPath(`${pathname}${window.location.search}`);
  }, [pathname]);

  return null;
}
