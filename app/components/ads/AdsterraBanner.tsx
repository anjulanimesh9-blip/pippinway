"use client";

import { useEffect, useRef } from "react";

const AD_KEY = "3911d3739b79fa88dd424ae24ccf3ca8";
const SCRIPT_SRC = `https://www.highrevenueformat.com/${AD_KEY}/invoke.js`;
const SCRIPT_ATTR = "data-adsterra-banner";

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

/**
 * Safe Adsterra 300×250 banner unit.
 * Loads client-side only, sets window.atOptions before the script,
 * and guards against duplicate script injection.
 */
export default function AdsterraBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || initializedRef.current) return;
    if (typeof window === "undefined") return;

    // Already initialized in this container (e.g. HMR / remount)
    if (container.querySelector("iframe, script")) {
      initializedRef.current = true;
      return;
    }

    // Global duplicate guard — only one invoke.js for this key
    if (document.querySelector(`script[${SCRIPT_ATTR}="${AD_KEY}"]`)) {
      initializedRef.current = true;
      return;
    }

    initializedRef.current = true;

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
    container.appendChild(script);
  }, []);

  return (
    <aside
      className="flex flex-col items-center"
      aria-label="Advertisement"
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
