"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import { DEFAULT_SIGNALS_SETTINGS, clampSettings, type SignalsUserSettings } from "@/lib/signals/config";
import { EXCHANGE_FILTER_FIXTURES } from "@/lib/signals-engine/exchange-fixtures";
import { SCAN_SYMBOLS } from "@/lib/signals-engine/types";
import { sizePosition } from "@/lib/signals-engine/trading";
import { fmt, fmtPrice, signalsFetch } from "@/lib/signals/client";
import { CoinLogo } from "../components/CoinLogo";
import { VisualBand } from "../components/VisualBand";

export default function SignalsSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [marginUSDT, setMarginUSDT] = useState(String(DEFAULT_SIGNALS_SETTINGS.marginUSDT));
  const [leverage, setLeverage] = useState(String(DEFAULT_SIGNALS_SETTINGS.leverage));
  const [marginMode, setMarginMode] = useState<SignalsUserSettings["marginMode"]>(DEFAULT_SIGNALS_SETTINGS.marginMode);
  const [scanMode, setScanMode] = useState<SignalsUserSettings["scanMode"]>(DEFAULT_SIGNALS_SETTINGS.scanMode);
  const [watchlist, setWatchlist] = useState("");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!user) return;
    void getDoc(doc(db, "users", user.uid)).then((snap) => {
      const settings = snap.data()?.signalsSettings;
      if (settings) {
        const next = clampSettings(settings);
        setMarginUSDT(String(next.marginUSDT));
        setLeverage(String(next.leverage));
        setMarginMode(next.marginMode);
        setScanMode(next.scanMode);
        setWatchlist(next.watchlist.join(", "));
      }
    });
    void signalsFetch("/api/signals/prices", user).then(async (response) => {
      if (!response.ok) return;
      const body = await response.json();
      const next: Record<string, number> = {};
      for (const row of body.prices || []) {
        if (typeof row.price === "number") next[row.symbol] = row.price;
      }
      setPrices(next);
    });
  }, [user]);

  const preview = clampSettings({
    marginUSDT: Number(marginUSDT),
    leverage: Number(leverage),
    marginMode,
    scanMode,
    watchlist: watchlist.split(/[\s,]+/).filter(Boolean),
  });
  const rows = useMemo(
    () =>
      SCAN_SYMBOLS.map((symbol) => {
        const filters = EXCHANGE_FILTER_FIXTURES[symbol];
        const price = prices[symbol];
        if (!filters) return { symbol, ok: false, reason: "No filter fixture", qty: 0, notional: 0, margin: 0, fees: 0, price: null, tickSize: undefined as number | undefined, pricePrecision: undefined as number | undefined };
        if (!price) {
          return {
            symbol,
            ok: false,
            reason: `Need live price. Exchange min notional $${filters.minNotional}.`,
            qty: 0,
            notional: 0,
            margin: 0,
            fees: 0,
            price: null,
            tickSize: filters.tickSize,
            pricePrecision: filters.pricePrecision,
          };
        }
        const sized = sizePosition(price, preview, filters);
        return {
          symbol,
          ok: sized.reasons.length === 0,
          reason: sized.reasons[0] || "Meets current filters",
          qty: sized.quantity,
          notional: sized.notionalUSDT,
          margin: sized.requiredMarginUSDT,
          fees: sized.totalFeesUSDT,
          price,
          tickSize: filters.tickSize,
          pricePrecision: filters.pricePrecision,
        };
      }),
    [preview, prices],
  );

  async function save() {
    if (!user) return;
    setError("");
    try {
      await setDoc(doc(db, "users", user.uid), { signalsSettings: preview }, { merge: true });
      setSaved("Preferences saved. The scanner will resize every coin with these values and leave LONG / SHORT / WAIT unchanged.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings");
    }
  }

  if (!user) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#0B1220] p-6">
        <h2 className="text-xl font-bold">Sign in to edit preferences</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-300">
          Margin, leverage and preview sizing stay on your Pippinway account. Changing them does not rewrite published signal math.
        </p>
        <Link href="/login?returnUrl=/signals/settings" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#FBB03B] px-5 text-sm font-semibold text-[#0B1220]">
          Sign in
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-5">
    <VisualBand
      src="/signals/education.png"
      alt="Decorative educational chart artwork for trading preferences"
      eyebrow="Preferences"
      title="Trading preferences"
    >
      <p>Margin and leverage change size and fees only. They never change LONG / SHORT / WAIT or pattern detection. Artwork here is decorative.</p>
    </VisualBand>
    <section className="pw-signals-card rounded-3xl p-5">
      <h2 className="text-xl font-bold">Position sizing</h2>
      <p className="mt-2 text-sm text-gray-400">
        Margin, leverage, and margin mode change position size, fees, P/L, and eligibility only. They never change LONG / SHORT / WAIT or pattern detection.
        Automatic order execution is not available.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-gray-300">
          Margin (USDT)
          <input
            type="number"
            min={1}
            max={10000}
            value={marginUSDT}
            onChange={(event) => setMarginUSDT(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B1220] px-3 py-2 text-white"
          />
        </label>
        <label className="text-sm text-gray-300">
          Leverage (1–125x, exchange max still applies)
          <input
            type="number"
            min={1}
            max={125}
            value={leverage}
            onChange={(event) => setLeverage(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B1220] px-3 py-2 text-white"
          />
        </label>
        <label className="text-sm text-gray-300">
          Margin mode
          <select
            value={marginMode}
            onChange={(event) => setMarginMode(event.target.value === "CROSS" ? "CROSS" : "ISOLATED")}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B1220] px-3 py-2 text-white"
          >
            <option value="ISOLATED">Isolated</option>
            <option value="CROSS">Cross</option>
          </select>
        </label>
        <label className="text-sm text-gray-300">
          Venue
          <input value="Binance USDT-M Futures" readOnly className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B1220] px-3 py-2 text-gray-400" />
        </label>
        <label className="text-sm text-gray-300">
          Scanner mode
          <select
            value={scanMode}
            onChange={(event) => setScanMode(event.target.value as SignalsUserSettings["scanMode"])}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B1220] px-3 py-2 text-white"
          >
            <option value="15">15 coins (original watchlist)</option>
            <option value="50">Top 50 by 24h volume (default)</option>
            <option value="100">100 coins by 24h volume</option>
            <option value="all">All eligible USDT-M perpetuals</option>
            <option value="custom">Custom watchlist</option>
          </select>
        </label>
        <label className="text-sm text-gray-300 sm:col-span-2">
          Custom watchlist
          <textarea
            value={watchlist}
            onChange={(event) => setWatchlist(event.target.value)}
            placeholder="BTCUSDT, ETHUSDT, SOLUSDT"
            className="mt-2 min-h-20 w-full rounded-xl border border-white/10 bg-[#0B1220] px-3 py-2 text-white"
          />
          <span className="mt-1 block text-xs text-gray-500">Pro required for 50 / 100 / All. Free stays on BTC, ETH and BNB details. Server enforces the plan.</span>
        </label>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-gray-400">
            <tr>
              <th className="py-2">Coin</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Notional</th>
              <th>Req. margin</th>
              <th>Fees</th>
              <th>Eligibility</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.symbol} className="border-t border-white/10">
                <td className="py-2">
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <CoinLogo symbol={row.symbol} size={20} />
                    {row.symbol.replace("USDT", "")}
                  </span>
                </td>
                <td>{fmtPrice(row.price, row.tickSize, row.pricePrecision)}</td>
                <td>{fmt(row.qty, 6)}</td>
                <td>${fmt(row.notional, 2)}</td>
                <td>${fmt(row.margin, 4)}</td>
                <td>${fmt(row.fees, 4)}</td>
                <td className={row.ok ? "text-emerald-300" : "text-rose-300"}>{row.ok ? "Eligible" : row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Quantities use each pair&apos;s live step size and min notional. Cross-margin liquidation is not estimated because it depends on the whole account. Isolated liquidation is only estimated when maintenance margin is known.
      </p>
      <button type="button" onClick={() => void save()} className="mt-5 rounded-xl bg-[#FBB03B] px-4 py-2 text-sm font-semibold text-[#0B1220]">
        Save preferences
      </button>
      {saved && <p className="mt-3 text-sm text-emerald-300">{saved}</p>}
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    </section>
    </div>
  );
}
