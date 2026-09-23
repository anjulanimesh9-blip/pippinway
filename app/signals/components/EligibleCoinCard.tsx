"use client";

import { changeClass, fmtChange, fmtPrice } from "@/lib/signals/client";
import { CoinLogo } from "./CoinLogo";
import { pairLabel } from "../lib/format";
import type { FreeEligibleCoin } from "@/lib/signals/free-daily";

export default function EligibleCoinCard({
  coin,
  remaining,
  onReveal,
  busy,
}: {
  coin: FreeEligibleCoin;
  remaining: number;
  onReveal: (symbol: string) => void;
  busy?: boolean;
}) {
  return (
    <article className="pw-signals-card flex h-full flex-col rounded-[22px] p-5">
      <div className="flex items-center gap-3">
        <CoinLogo symbol={coin.symbol} size={44} />
        <div>
          <h3 className="text-lg font-bold">{pairLabel(coin.symbol)}</h3>
          <p className="text-xs text-slate-500">{coin.symbol}</p>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Live price</p>
          <p className="text-xl font-semibold tabular-nums">{fmtPrice(coin.price)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">24h change</p>
          <p className={`text-sm font-semibold ${changeClass(coin.changePct)}`}>{fmtChange(coin.changePct)}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-400">Complete entry, stop and target stay locked until you reveal this coin.</p>
      {coin.stale && <p className="mt-2 text-xs text-amber-200">Price feed is stale.</p>}
      <button
        type="button"
        disabled={busy || remaining <= 0 || !coin.available}
        onClick={() => onReveal(coin.symbol)}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#FBB03B] px-4 text-sm font-bold text-[#0B1220] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {remaining <= 0 ? "Daily limit reached" : busy ? "Revealing…" : "Reveal signal"}
      </button>
    </article>
  );
}
