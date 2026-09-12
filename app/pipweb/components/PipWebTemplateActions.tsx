"use client";

import { useState } from "react";
import {
  pipWebContactHref,
  setSelectedPipWebTemplate,
} from "@/app/pipweb/data/templates";

const PREVIEW_BTN =
  "inline-flex h-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white transition hover:border-[#60A5FA]/40 hover:bg-[#3B82F6]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]";

const CHOOSE_BTN =
  "inline-flex h-10 items-center justify-center rounded-xl bg-[#3B82F6] px-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.22)] transition hover:bg-[#2563EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]";

export default function PipWebTemplateActions({
  id,
  name,
  previewUrl,
}: {
  id: string;
  name: string;
  previewUrl: string | null;
}) {
  const [comingSoon, setComingSoon] = useState(false);

  return (
    <div className="mt-5">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {previewUrl ? (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={PREVIEW_BTN}
          >
            Live Preview
          </a>
        ) : (
          <button
            type="button"
            className={PREVIEW_BTN}
            onClick={() => setComingSoon(true)}
          >
            Live Preview
          </button>
        )}
        <a
          href={pipWebContactHref(id)}
          className={CHOOSE_BTN}
          onClick={() => setSelectedPipWebTemplate({ id, name })}
        >
          Choose This Design
        </a>
      </div>
      {comingSoon ? (
        <p className="mt-3 text-center text-sm text-[#7DD3FC]" role="status">
          Coming Soon — live previews are on the way.
        </p>
      ) : null}
    </div>
  );
}
