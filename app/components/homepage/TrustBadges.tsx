"use client";

import Link from "next/link";

const items: Array<{
  icon: string;
  title: string;
  text: string;
  href?: string;
}> = [
  { icon: "🏷️", title: "Free to post", text: "Create an ad at no listing fee" },
  { icon: "🛡️", title: "Local sellers", text: "Connect with people posting nearby" },
  { icon: "🌍", title: "Multiple countries", text: "Browse ads across Pippinway markets" },
  {
    icon: "🎧",
    title: "Safety guidance",
    text: "Read tips before you meet or pay",
    href: "/safety",
  },
];

export default function TrustBadges() {
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
