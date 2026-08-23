"use client";

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

const TABS: Array<{ key: ProfileTabKey; label: string }> = [
  { key: "listings", label: "My Listings" },
  { key: "about", label: "About" },
  { key: "reviews", label: "Reviews" },
];

export default function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
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
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
