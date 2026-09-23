import { Activity, Brain, Layers, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    copy: "Rule-based pattern and trend labels from live candles. Not a profit forecast.",
  },
  {
    icon: Activity,
    title: "Real Market Data",
    copy: "Live Binance USDT-M prices and charts. Missing data is shown as unavailable.",
  },
  {
    icon: Layers,
    title: "Multiple Timeframes",
    copy: "1m, 5m, 15m, 1H and 4H scans stay aligned with the existing engine.",
  },
  {
    icon: Shield,
    title: "Risk Management",
    copy: "Entry, stop and target are recorded levels. Manual signals only.",
  },
];

export default function FeatureRow() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map((item) => (
        <article key={item.title} className="rounded-2xl border border-white/10 bg-[#0B1220] px-4 py-5">
          <item.icon className="h-6 w-6 text-[#FBB03B]" />
          <h3 className="mt-3 text-sm font-bold">{item.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">{item.copy}</p>
        </article>
      ))}
    </section>
  );
}
