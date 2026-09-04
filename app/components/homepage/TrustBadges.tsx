"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function TrustBadges() {
  const { t } = useI18n();
  const items: Array<{
    icon: string;
    title: string;
    text: string;
    href?: string;
  }> = [
    {
      icon: "🏷️",
      title: t("home.trustPostTitle"),
      text: t("home.trustPostBody"),
    },
    {
      icon: "🛡️",
      title: t("home.trustLocalTitle"),
      text: t("home.trustLocalBody"),
    },
    {
      icon: "🌍",
      title: t("home.trustCountriesTitle"),
      text: t("home.trustCountriesBody"),
    },
    {
      icon: "🎧",
      title: t("home.trustSafetyTitle"),
      text: t("home.trustSafetyBody"),
      href: "/safety",
    },
  ];

  return (
    <section className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => {
        const inner = (
          <>
            <div className="text-2xl mb-2">{item.icon}</div>
            <h3 className="text-sm font-bold text-white">{item.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{item.text}</p>
          </>
        );

        const className =
          "rounded-2xl border border-white/10 bg-[#0f172a] p-4 text-center";

        if ("href" in item && item.href) {
          return (
            <Link key={item.title} href={item.href} className={className}>
              {inner}
            </Link>
          );
        }

        return (
          <div key={item.title} className={className}>
            {inner}
          </div>
        );
      })}
    </section>
  );
}
