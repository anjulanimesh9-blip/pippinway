"use client";

import { Check, Minus } from "lucide-react";
import PricingStrip from "../components/PricingStrip";

const FEATURES = [
  { label: "Live market overview", free: true, pro: true },
  { label: "BTC, ETH and BNB scanner", free: true, pro: true },
  { label: "4 complete signal reveals per UTC day", free: true, pro: "Unlimited" },
  { label: "Full 15-coin scanner", free: true, pro: true },
  { label: "50, 100 and All Coins scanners", free: false, pro: true },
  { label: "Educational pattern labels", free: true, pro: true },
  { label: "Entry, stop and take-profit levels", free: "4/day", pro: true },
  { label: "Interactive Binance charts", free: "Limited", pro: true },
  { label: "Full signal history", free: false, pro: true },
  { label: "Observed performance analytics", free: false, pro: true },
  { label: "Alerts after beta", free: false, pro: true },
];

export default function SignalsPricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Simple Pricing. More Opportunities.</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Choose the plan that fits your scanning needs. Paid checkout stays disabled until approved. Pro does not promise higher accuracy or guaranteed profits.
        </p>
      </div>
      <PricingStrip />
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0B1220]">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="font-bold">Feature comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-gray-400">
              <tr>
                <th className="px-5 py-3 font-medium">Feature</th>
                <th className="px-5 py-3 font-medium">Free $0</th>
                <th className="px-5 py-3 font-medium text-[#FBB03B]">Pro</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((row) => (
                <tr key={row.label} className="border-t border-white/5">
                  <td className="px-5 py-3 text-gray-200">{row.label}</td>
                  <td className="px-5 py-3 text-gray-400">
                    {row.free === true ? <Check className="h-4 w-4 text-emerald-400" /> : row.free === false ? <Minus className="h-4 w-4 text-gray-600" /> : row.free}
                  </td>
                  <td className="px-5 py-3 text-gray-200">
                    {row.pro === true ? <Check className="h-4 w-4 text-[#FBB03B]" /> : <Minus className="h-4 w-4 text-gray-600" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
