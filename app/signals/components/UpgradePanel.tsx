import Link from "next/link";

export default function UpgradePanel({
  price = 4.99,
  expired = false,
}: {
  price?: number;
  expired?: boolean;
}) {
  return (
    <section className="rounded-[28px] border border-[#FBB03B]/25 bg-[radial-gradient(circle_at_top_right,rgba(251,176,59,0.16),transparent_42%),linear-gradient(180deg,#0b1220,#070d18)] p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FBB03B]">Pippinway Signals Pro</p>
      <h2 className="mt-2 text-2xl font-bold">{expired ? "Renew Pro access" : "See every validated setup"}</h2>
      <ul className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
        <li>✓ Unlimited complete-signal reveals</li>
        <li>✓ Top 50 live Binance Futures scanner</li>
        <li>✓ Charts, patterns and official history</li>
        <li>✓ EcoCash checkout with admin verification</li>
      </ul>
      <p className="mt-5 text-3xl font-extrabold text-[#FBB03B]">${price} <span className="text-base font-semibold text-slate-400">/ month</span></p>
      <Link href="/signals/pay" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#FBB03B] px-5 text-sm font-bold text-[#0B1220]">
        {expired ? "Renew with EcoCash" : "Upgrade with EcoCash"}
      </Link>
    </section>
  );
}
