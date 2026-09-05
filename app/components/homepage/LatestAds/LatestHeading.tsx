"use client";

import { useI18n } from "@/lib/i18n";

type Props = {
  count?: number;
  from?: number;
  to?: number;
};

export default function LatestHeading({
  count = 0,
  from = 0,
  to = 0,
}: Props) {
  const { t } = useI18n();
  const label =
    from > 0 && to > 0
      ? t("home.showingPage", { from, to })
      : count > 0
        ? t("home.adsCount", { count })
        : null;

  return (
    <div className="mb-3 mt-2">
      <h2 id="latest-listings" className="text-lg font-bold text-white">
        {t("home.latestAds")}
      </h2>
      {label && <p className="text-xs text-gray-500 mt-0.5">{label}</p>}
    </div>
  );
}
