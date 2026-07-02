const reasons = [
  {
    title: "Global Reach",
    body: "Buy and sell across ten supported countries while keeping local search simple.",
  },
  {
    title: "Verified Access",
    body: "Posting is tied to the existing login and verified email flow already used by Pippinway.",
  },
  {
    title: "Fast Discovery",
    body: "Country, category, location and keyword filters work together on the same live listing feed.",
  },
  {
    title: "Featured Visibility",
    body: "Featured ads keep their existing logic and appear in a premium gold spotlight area.",
  },
];

export default function WhyChoose() {
  return (
    <section className="border-y border-white/10 bg-[#07111f] px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="why-choose-title">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            Trusted marketplace
          </p>
          <h2 id="why-choose-title" className="mt-2 text-3xl font-black text-white">
            Why Choose Pippinway
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <article key={reason.title} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
              <h3 className="text-base font-black text-white">{reason.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{reason.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
