"use client";

import { useEffect, useRef, useState } from "react";

const AD_KEY = "3911d3739b79fa88dd424ae24ccf3ca8";
const SCRIPT_SRC = `https://www.highrevenueformat.com/${AD_KEY}/invoke.js`;
const SCRIPT_ATTR = "data-adsterra-banner";
const FILL_TIMEOUT_MS = 4000;

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

function hasAdCreative(container: HTMLElement): boolean {
  const iframe = container.querySelector("iframe");
  if (!iframe) return false;

  try {
    const doc = iframe.contentDocument;
    if (!doc) return false;

    const img = doc.querySelector("img");
    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      return true;
    }
  } catch {
    // Cross-origin iframe — cannot inspect; treat as not yet confirmed.
  }

  return false;
}

/**
 * Safe Adsterra 300×250 banner unit.
 * Loads client-side only, sets window.atOptions before the script,
 * and guards against duplicate script injection.
 * Collapses the reserved slot if no creative appears within ~4s.
 */
export default function AdsterraBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const settledRef = useRef(false);
  const [slot, setSlot] = useState<"pending" | "ready" | "empty">("pending");

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    let pollId = 0;
    let timeoutId = 0;

    const observer = new MutationObserver(() => {
      check();
      const iframe = container.querySelector("iframe");
      const doc = iframe?.contentDocument;
      const img = doc?.querySelector("img");
      if (img && !img.dataset.adsterraFillBound) {
        img.dataset.adsterraFillBound = "1";
        if (img.complete) check();
        else img.addEventListener("load", check, { once: true });
      }
    });

    const stopWatching = () => {
      observer.disconnect();
      window.clearInterval(pollId);
      window.clearTimeout(timeoutId);
    };

    const settleReady = () => {
      if (settledRef.current) return;
      settledRef.current = true;
      stopWatching();
      setSlot("ready");
    };

    const settleEmpty = () => {
      if (settledRef.current) return;
      settledRef.current = true;
      stopWatching();
      setSlot("empty");
    };

    const check = () => {
      if (hasAdCreative(container)) settleReady();
    };

    check();
    observer.observe(container, { childList: true, subtree: true });

    // Lightweight poll covers iframe document writes that miss MutationObserver.
    pollId = window.setInterval(check, 400);

    timeoutId = window.setTimeout(() => {
      if (hasAdCreative(container)) settleReady();
      else settleEmpty();
    }, FILL_TIMEOUT_MS);

    return () => {
      stopWatching();
    };
  }, []);

  if (slot === "empty") {
    return null;
  }

  return (
    <aside
      className="mb-4 flex flex-col items-center"
      aria-label="Advertisement"
      data-adsterra-slot={slot}
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
