export default function RightBanner() {
  return (
    <aside className="sticky top-24 hidden self-start overflow-hidden rounded-lg border border-white/10 bg-[#07111f]/85 p-3 shadow-xl shadow-black/25 backdrop-blur-xl xl:block">
      <p className="mb-3 text-center text-xs uppercase tracking-[0.18em] text-slate-500">
        Advertisement
      </p>
      <div className="relative flex min-h-[600px] w-[300px] flex-col justify-between overflow-hidden rounded-lg border border-violet-300/20 bg-gradient-to-br from-[#140a3b] via-[#24105d] to-[#06162e] p-6">
        <div className="absolute inset-x-0 bottom-0 h-44 bg-[url('/images/right-ad.jpg')] bg-cover bg-bottom opacity-35" />
        <div className="relative">
          <span className="rounded-full border border-amber-200/40 bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-100">
            AdSense ready
          </span>
          <h2 className="mt-8 text-3xl font-black leading-tight text-white">
            Promote Your Business
          </h2>
          <p className="mt-4 text-sm leading-6 text-violet-100/80">
            Reach buyers across supported Pippinway countries with responsive ad placements.
          </p>
        </div>
        <div className="relative rounded-lg border border-white/10 bg-black/20 p-4 text-center text-sm text-slate-200">
          <p className="font-bold text-white">300 x 600</p>
          <p className="mt-1 text-xs text-slate-400">Also supports 300 x 250 and 728 x 90</p>
        </div>
      </div>
    </aside>
  );
}
