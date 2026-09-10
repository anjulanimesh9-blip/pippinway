"use client";

import { useEffect, useId, useRef, useState } from "react";

const AD_KEY = "3911d3739b79fa88dd424ae24ccf3ca8";
const SCRIPT_SRC = `https://www.highrevenueformat.com/${AD_KEY}/invoke.js`;
const SCRIPT_ATTR = "data-adsterra-banner";
/** Gap so invoke.js can read window.atOptions before another slot overwrites it. */
const INIT_STAGGER_MS = 120;
const AD_WIDTH = 300;
const AD_HEIGHT = 250;

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
    // Cross-origin iframe — cannot inspect yet.
  }

  return false;
}

type Props = {
  /** Optional extra classes on the outer aside (spacing wrappers). */
  className?: string;
};

/**
 * Safe Adsterra 300×250 banner unit.
 * Loads client-side only, sets window.atOptions before the script,
 * keeps the slot mounted, and only expands layout height after a real creative fills.
 */
export default function AdsterraBanner({ className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const filledRef = useRef(false);
  const reactId = useId();
  const [filled, setFilled] = useState(false);

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
        height: AD_HEIGHT,
        width: AD_WIDTH,
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

  // Detect fill only to expand layout — never unmount / never timeout-hide.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;
    if (filledRef.current) return;

    const markFilled = () => {
      if (filledRef.current) return;
      if (!hasAdCreative(container)) return;
      filledRef.current = true;
      setFilled(true);
      observer.disconnect();
      window.clearInterval(pollId);
    };

    const observer = new MutationObserver(() => {
      markFilled();
      const iframe = container.querySelector("iframe");
      const img = iframe?.contentDocument?.querySelector("img");
      if (img && !img.dataset.adsterraFillBound) {
        img.dataset.adsterraFillBound = "1";
        if (img.complete) markFilled();
        else img.addEventListener("load", markFilled, { once: true });
      }
    });

    markFilled();
    observer.observe(container, { childList: true, subtree: true });
    const pollId = window.setInterval(markFilled, 400);

    return () => {
      observer.disconnect();
      window.clearInterval(pollId);
    };
  }, []);

  return (
    <aside
      className={`mb-4 flex flex-col items-center ${className}`.trim()}
      aria-label="Advertisement"
      data-adsterra-instance={reactId}
      data-adsterra-filled={filled ? "true" : "false"}
    >
      <p className="mb-1.5 text-[10px] uppercase tracking-wide text-gray-500">
        Advertisement
      </p>
      {/*
        Clip wrapper controls visible layout height only.
        The Adsterra target below always keeps a real 300×250 box (never display:none)
        so invoke.js can insert/fill an iframe even while the feed gap stays small.
      */}
      <div
        className="w-[300px] overflow-hidden"
        style={{ height: filled ? AD_HEIGHT : 0 }}
      >
        <div
          ref={containerRef}
          className="flex items-center justify-center overflow-hidden bg-transparent"
          style={{
            width: AD_WIDTH,
            height: AD_HEIGHT,
            minWidth: AD_WIDTH,
            minHeight: AD_HEIGHT,
          }}
        />
      </div>
    </aside>
  );
}
