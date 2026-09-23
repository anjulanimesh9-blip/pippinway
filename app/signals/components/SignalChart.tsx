"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";
import type { UTCTimestamp } from "lightweight-charts";
import { SCAN_INTERVALS } from "@/lib/signals-engine/types";
import { signalsFetch } from "@/lib/signals/client";

const LABELS: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "1h": "1H",
  "4h": "4H",
};

type ChartProps = {
  user: User;
  symbol: string;
  locked?: boolean;
  entry?: number | null;
  stop?: number | null;
  target?: number | null;
  support?: number | null;
  resistance?: number | null;
  pattern?: string;
  lastCandleCloseAt?: string | null;
  neckline?: number | null;
};

export default function SignalChart({
  user,
  symbol,
  locked,
  entry,
  stop,
  target,
  support,
  resistance,
  pattern,
  lastCandleCloseAt,
  neckline,
}: ChartProps) {
  const host = useRef<HTMLDivElement>(null);
  const [interval, setIntervalName] = useState<(typeof SCAN_INTERVALS)[number]>("15m");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!host.current || locked) {
      setLoading(false);
      return;
    }
    const el = host.current;
    let disposed = false;
    let chart: { remove: () => void; applyOptions: (opts: { width: number }) => void } | null = null;
    const observer = new ResizeObserver(() => {
      if (chart && el.clientWidth > 0) chart.applyOptions({ width: el.clientWidth });
    });

    void (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await signalsFetch(`/api/signals/chart?symbol=${symbol}&interval=${interval}`, user);
        const body = await response.json();
        if (!response.ok) throw Error(body.error || "Chart failed");
        if (body.locked) {
          setError(body.error || "Chart locked on the Free plan.");
          return;
        }
        const candles = Array.isArray(body.candles) ? body.candles : [];
        if (!candles.length) {
          setError("No Binance candles were returned for this timeframe.");
          return;
        }
        if (disposed || !el) return;
        const {
          createChart,
          CandlestickSeries,
          ColorType,
          LineStyle,
          createSeriesMarkers,
        } = await import("lightweight-charts");
        if (disposed || !el) return;
        el.replaceChildren();
        const next = createChart(el, {
          width: el.clientWidth,
          height: el.clientWidth < 640 ? 260 : 340,
          layout: {
            background: { type: ColorType.Solid, color: "#0B1220" },
            textColor: "#94a3b8",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          },
          grid: {
            vertLines: { color: "rgba(255,255,255,0.05)" },
            horzLines: { color: "rgba(255,255,255,0.05)" },
          },
          rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
          timeScale: { borderColor: "rgba(255,255,255,0.08)", timeVisible: true, secondsVisible: false },
          handleScroll: { vertTouchDrag: false },
          crosshair: { mode: 0 },
        });
        const series = next.addSeries(CandlestickSeries, {
          upColor: "#10b981",
          downColor: "#f43f5e",
          borderVisible: false,
          wickUpColor: "#34d399",
          wickDownColor: "#fb7185",
        });
        series.setData(
          candles.map((row: { time: number; open: number; high: number; low: number; close: number }) => ({
            time: row.time as UTCTimestamp,
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
          })),
        );
        const lines = [
          { price: entry, color: "#3B82F6", title: "Entry", style: LineStyle.Solid },
          { price: stop, color: "#f43f5e", title: "SL", style: LineStyle.Dashed },
          { price: target, color: "#10b981", title: "TP", style: LineStyle.Dashed },
          { price: support, color: "#FBB03B", title: "Support", style: LineStyle.Dotted },
          { price: resistance, color: "#FBB03B", title: "Resistance", style: LineStyle.Dotted },
          { price: neckline, color: "#a78bfa", title: "Neckline", style: LineStyle.Dashed },
        ];
        for (const line of lines) {
          if (line.price == null || !Number.isFinite(line.price) || line.price <= 0) continue;
          series.createPriceLine({
            price: line.price,
            color: line.color,
            lineWidth: 1,
            lineStyle: line.style,
            title: line.title,
            axisLabelVisible: true,
          });
        }
        if (pattern && lastCandleCloseAt) {
          const stamp = Math.floor(new Date(lastCandleCloseAt).getTime() / 1000);
          if (Number.isFinite(stamp)) {
            createSeriesMarkers(series, [
              {
                time: stamp as UTCTimestamp,
                position: "aboveBar",
                color: "#FBB03B",
                shape: "arrowDown",
                text: pattern,
              },
            ]);
          }
        }
        next.timeScale().fitContent();
        chart = next;
        observer.observe(el);
      } catch (err) {
        if (!disposed) setError(err instanceof Error ? err.message : "Chart data unavailable");
      } finally {
        if (!disposed) setLoading(false);
      }
    })();

    return () => {
      disposed = true;
      observer.disconnect();
      chart?.remove();
    };
  }, [entry, interval, lastCandleCloseAt, locked, neckline, pattern, resistance, stop, support, symbol, target, user]);

  if (locked) {
    return (
      <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
        Interactive charts for this pair are included with Pro.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <p className="text-xs font-semibold text-gray-300">Binance USDT-M · {symbol}</p>
        <div className="flex flex-wrap gap-1">
          {SCAN_INTERVALS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setIntervalName(item)}
              className={`min-h-9 min-w-10 rounded-lg px-2.5 text-xs font-bold ${
                interval === item ? "bg-[#FBB03B] text-[#0B1220]" : "bg-white/5 text-gray-300"
              }`}
            >
              {LABELS[item] || item}
            </button>
          ))}
        </div>
      </div>
      {loading && <div className="h-[260px] animate-pulse bg-white/5 sm:h-[340px]" />}
      {error && (
        <p className="px-3 py-3 text-sm text-rose-200">{error}</p>
      )}
      <div ref={host} className={`w-full max-w-full ${loading || error ? "hidden" : ""}`} />
    </div>
  );
}
