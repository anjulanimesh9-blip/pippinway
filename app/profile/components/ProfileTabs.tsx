"use client";

import { useI18n } from "@/lib/i18n";

export type ProfileTabKey =
  | "listings"
  | "about"
  | "reviews"
  | "saved"
  | "activity"
  | "favorites";

type ProfileTabsProps = {
  activeTab: ProfileTabKey;
  onChange: (tab: ProfileTabKey) => void;
};

const TABS: Array<{ key: ProfileTabKey; labelKey: string }> = [
  { key: "about", labelKey: "profile.about" },
  { key: "listings", labelKey: "profile.myListings" },
  { key: "reviews", labelKey: "profile.reviews" },
];

export default function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
  const { t } = useI18n();
  return (
    <div className="border-b border-white/8">
      <div className="flex gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "border-sky-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
