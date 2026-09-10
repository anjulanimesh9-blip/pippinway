"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ADSTERRA_AD_KEY, adsterraSrcDoc } from "./adsterraConfig";

const AD_WIDTH = 300;
const AD_HEIGHT = 250;

type Props = {
  /**
   * Adsterra banner key. Defaults to the approved live key.
   * Same key may be reused across instances; each mounts in an isolated iframe.
   */
  adKey?: string;
  /** Optional extra classes on the outer aside (spacing wrappers). */
  className?: string;
};

function hasCreativeInSandbox(sandbox: HTMLIFrameElement): boolean {
  try {
    const doc = sandbox.contentDocument;
    if (!doc) return false;

    const directImg = doc.querySelector("img");
    if (
      directImg &&
      directImg.complete &&
      directImg.naturalWidth > 0 &&
      directImg.naturalHeight > 0
    ) {
      return true;
    }

    const nested = doc.querySelectorAll("iframe");
    for (const frame of nested) {
      try {
        const nestedDoc = frame.contentDocument;
        const img = nestedDoc?.querySelector("img");
        if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
          return true;
        }
      } catch {
        // Nested frame may be opaque; ignore.
      }
    }
  } catch {
    // Sandbox not ready yet.
  }

  return false;
}

/**
 * Safe Adsterra 300×250 banner unit.
 * Each instance runs the official snippet inside an isolated iframe (srcDoc)
 * so the same placement key can appear multiple times without sharing window.atOptions.
 * Layout height stays collapsed until a real creative is detected, then expands permanently.
 */
export default function AdsterraBanner({
  adKey = ADSTERRA_AD_KEY,
  className = "",
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const filledRef = useRef(false);
  const reactId = useId();
  const [filled, setFilled] = useState(false);
  const srcDoc = adsterraSrcDoc(adKey);

  // Detect fill only to expand layout — never unmount / never timeout-hide.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || typeof window === "undefined") return;
    if (filledRef.current) return;

    let pollId = 0;
    let observer: MutationObserver | null = null;

    const markFilled = () => {
      if (filledRef.current) return;
      if (!hasCreativeInSandbox(iframe)) return;
      filledRef.current = true;
      setFilled(true);
      observer?.disconnect();
      window.clearInterval(pollId);
    };

    const watchSandboxDoc = () => {
      markFilled();
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        observer?.disconnect();
        observer = new MutationObserver(() => {
          markFilled();
          const img = doc.querySelector("img");
          if (img && !img.dataset.adsterraFillBound) {
            img.dataset.adsterraFillBound = "1";
            if (img.complete) markFilled();
            else img.addEventListener("load", markFilled, { once: true });
          }
        });
        observer.observe(doc.documentElement || doc.body, {
          childList: true,
          subtree: true,
        });
      } catch {
        // Ignore until srcDoc is readable.
      }
    };

    iframe.addEventListener("load", watchSandboxDoc);
    watchSandboxDoc();
    pollId = window.setInterval(markFilled, 400);

    return () => {
      iframe.removeEventListener("load", watchSandboxDoc);
      observer?.disconnect();
      window.clearInterval(pollId);
    };
  }, [srcDoc]);

  return (
    <aside
      className={`mb-4 flex flex-col items-center ${className}`.trim()}
      aria-label="Advertisement"
      data-adsterra-instance={reactId}
      data-adsterra-key={adKey}
      data-adsterra-isolated="srcdoc"
      data-adsterra-filled={filled ? "true" : "false"}
    >
      <p className="mb-1.5 text-[10px] uppercase tracking-wide text-gray-500">
        Advertisement
      </p>
      {/*
        Clip wrapper controls visible layout height only.
        The isolated iframe always keeps a real 300×250 box (never display:none)
        so Adsterra can render even while the feed gap stays small.
      */}
      <div
        className="w-[300px] overflow-hidden"
        style={{ height: filled ? AD_HEIGHT : 0 }}
      >
        <iframe
          ref={iframeRef}
          title="Advertisement"
          srcDoc={srcDoc}
          width={AD_WIDTH}
          height={AD_HEIGHT}
          scrolling="no"
          frameBorder={0}
          // Scripts + same-origin needed for Adsterra invoke.js / creative iframe.
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          style={{
            width: AD_WIDTH,
            height: AD_HEIGHT,
            border: 0,
            display: "block",
            background: "transparent",
          }}
        />
      </div>
    </aside>
  );
}
