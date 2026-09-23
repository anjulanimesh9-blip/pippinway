"use client";

import { useEffect, useState } from "react";
import { changeClass, fmtChange, fmtPrice } from "@/lib/signals/client";
import { CoinLogo } from "./CoinLogo";

type TickerRow = {
  symbol: string;
  price: number | null;
  changePct: number | null;
  sparkline?: number[];
};

export default function MarketTicker() {
  const [rows, setRows] = useState<TickerRow[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/signals/ticker", { cache: "no-store" });
        const body = await response.json();
        if (!response.ok || !active) return;
        setRows(Array.isArray(body.rows) ? body.rows : []);
      } catch {
        // Keep last ticker.
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0B1220] px-3 py-2 [scrollbar-width:thin] [-ms-overflow-style:auto]">
      <div className="flex min-w-max items-center gap-5">
        {rows.slice(0, 15).map((row) => (
          <div key={row.symbol} className="flex items-center gap-2 text-xs">
            <CoinLogo symbol={row.symbol} size={18} />
            <span className="font-semibold text-white">{row.symbol.replace("USDT", "")}</span>
            <span className="tabular-nums text-slate-200">{fmtPrice(row.price)}</span>
            <span className={`tabular-nums ${changeClass(row.changePct)}`}>{fmtChange(row.changePct)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
