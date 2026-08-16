"use client";

export default function TrustBadges() {
  const items = [
    { icon: "🏷️", title: "100% FREE", text: "Post ads at no cost" },
    { icon: "🛡️", title: "Trusted Platform", text: "Verified sellers" },
    { icon: "🌍", title: "Global Reach", text: "Buyers worldwide" },
    { icon: "🎧", title: "24/7 Support", text: "We're here to help" },
  ];

  return (
    <section className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 text-center"
        >
          <div className="text-2xl mb-2">{item.icon}</div>
          <h3 className="text-sm font-bold text-white">{item.title}</h3>
          <p className="text-xs text-gray-400 mt-1">{item.text}</p>
        </div>
      ))}
    </section>
  );
}
