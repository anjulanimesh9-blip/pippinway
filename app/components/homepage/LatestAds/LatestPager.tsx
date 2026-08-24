"use client";

type LatestPagerProps = {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

function scrollToLatestAds() {
  document
    .getElementById("latest-listings")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LatestPager({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: LatestPagerProps) {
  if (!hasPrev && !hasNext) return null;

  return (
    <nav
      className="mt-4 flex items-center justify-between gap-3"
      aria-label="Latest ads pages"
    >
      {hasPrev ? (
        <button
          type="button"
          onClick={() => {
            onPrev();
            scrollToLatestAds();
          }}
          className="rounded-xl border border-white/10 bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
        >
          Previous
        </button>
      ) : (
        <span />
      )}
      {hasNext ? (
        <button
          type="button"
          onClick={() => {
            onNext();
            scrollToLatestAds();
          }}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-500"
        >
          Next
        </button>
      ) : (
        <span />
      )}
    </nav>
  );
}
