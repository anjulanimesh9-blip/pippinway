import Image from "next/image";
import Link from "next/link";

export default function SignalsPromo() {
  return (
    <section aria-labelledby="signals-promo-heading" className="relative overflow-hidden rounded-2xl border border-[#FBB03B]/25 bg-[#070d1a]">
      <div className="grid items-stretch md:grid-cols-2">
        <div className="relative z-10 px-5 py-6 sm:px-7 sm:py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FBB03B]">
            Pippinway Signals · Powered by PipSignal AI
          </p>
          <h2 id="signals-promo-heading" className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Trade Smarter. See the Signals.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Live crypto market analysis, chart pattern detection and transparent trading insights in one place.
          </p>
          <p className="mt-1 text-sm text-slate-400">Manual signals only. No guaranteed profits.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/signals" className="inline-flex h-11 items-center rounded-full bg-[#FBB03B] px-5 text-sm font-semibold text-[#0B1220]">
              Explore Live Signals
            </Link>
            <Link href="/signals/pricing" className="inline-flex h-11 items-center rounded-full border border-[#FBB03B]/40 px-5 text-sm font-semibold text-[#FBB03B]">
              Compare Plans
            </Link>
          </div>
        </div>
        <div className="relative min-h-[160px]">
          <Image
            src="/signals/bull-bear.png"
            alt="Golden bull and bear with candlestick charts"
            fill
            quality={65}
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
