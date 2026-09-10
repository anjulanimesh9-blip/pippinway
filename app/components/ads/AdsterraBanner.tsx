"use client";

import { useEffect, useId, useRef } from "react";

const AD_KEY = "3911d3739b79fa88dd424ae24ccf3ca8";
const SCRIPT_SRC = `https://www.highrevenueformat.com/${AD_KEY}/invoke.js`;
const SCRIPT_ATTR = "data-adsterra-banner";
/** Gap so invoke.js can read window.atOptions before another slot overwrites it. */
const INIT_STAGGER_MS = 120;

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: string;
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
  }
}

/** Serialize inits across banners sharing one Adsterra key. */
let initQueue: Promise<void> = Promise.resolve();

function enqueueBannerInit(run: () => void): Promise<void> {
  const next = initQueue.then(async () => {
    run();
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, INIT_STAGGER_MS);
    });
  });
  initQueue = next.catch(() => undefined);
  return next;
}

type Props = {
  /** Optional extra classes on the outer aside (spacing wrappers). */
  className?: string;
};

/**
 * Safe Adsterra 300×250 banner unit.
 * Loads client-side only, sets window.atOptions before the script,
 * and keeps the reserved slot mounted (no auto-hide / no-fill collapse).
 */
export default function AdsterraBanner({ className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const reactId = useId();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || initializedRef.current) return;
    if (typeof window === "undefined") return;

    // Already initialized in this container (e.g. HMR / remount)
    if (container.querySelector("iframe, script")) {
      initializedRef.current = true;
      return;
    }

    initializedRef.current = true;
    let cancelled = false;

    void enqueueBannerInit(() => {
      if (cancelled || !container.isConnected) return;
      if (container.querySelector("iframe, script")) return;

      window.atOptions = {
        key: AD_KEY,
        format: "iframe",
        height: 250,
        width: 300,
        params: {},
      };

      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.setAttribute(SCRIPT_ATTR, AD_KEY);
      script.setAttribute("data-adsterra-instance", reactId);
      container.appendChild(script);
    });

    return () => {
      cancelled = true;
    };
  }, [reactId]);

  return (
    <aside
      className={`mb-4 flex flex-col items-center ${className}`.trim()}
      aria-label="Advertisement"
      data-adsterra-instance={reactId}
    >
      <p className="mb-1.5 text-[10px] uppercase tracking-wide text-gray-500">
        Advertisement
      </p>
      <div
        ref={containerRef}
        className="flex items-center justify-center overflow-hidden bg-transparent"
        style={{ width: 300, height: 250, minWidth: 300, minHeight: 250 }}
      />
    </aside>
  );
}
