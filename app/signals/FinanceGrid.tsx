import { fmt, fmtPrice } from "@/lib/signals/client";

export type FinanceSetup = {
  executable: boolean;
  executableReason: string;
  validationReasons?: string[];
  entry: number;
  stop: number;
  target: number;
  riskReward: number;
  grossRiskReward?: number;
  netRiskReward?: number;
  quantity: number;
  notionalUSDT: number;
  requiredMarginUSDT?: number;
  allocatedMarginUSDT?: number;
  estimatedProfitUSDT: number;
  estimatedLossUSDT: number;
  estimatedFeesUSDT: number;
  entryFeeUSDT?: number;
  exitFeeUSDT?: number;
  grossProfitUSDT?: number;
  grossLossUSDT?: number;
  netProfitUSDT?: number;
  netLossUSDT?: number;
  minNotional: number;
  minQty?: number;
  tickSize?: number;
  stepSize?: number;
  pricePrecision?: number;
  marginUSDT: number;
  leverage: number;
  marginMode?: string;
  liquidationEstimateUSDT?: number | null;
  liquidationRisk?: string;
  liquidationNote?: string;
};

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-gray-100">{value}</p>
    </div>
  );
}

export function FinanceGrid({ setup }: { setup: FinanceSetup }) {
  const netRR = setup.netRiskReward ?? setup.riskReward;
  const grossRR = setup.grossRiskReward;
  const netProfit = setup.netProfitUSDT ?? setup.estimatedProfitUSDT;
  const netLoss = setup.netLossUSDT ?? setup.estimatedLossUSDT;
  return (
    <div className="space-y-3">
      <div className={`rounded-xl border px-3 py-2 text-sm ${setup.executable ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100" : "border-rose-500/40 bg-rose-500/10 text-rose-100"}`}>
        <strong>{setup.executable ? "EXECUTABLE" : "NOT EXECUTABLE"}</strong>
        <p className="mt-1 text-xs opacity-90">{setup.executableReason}</p>
        {!setup.executable && setup.validationReasons && setup.validationReasons.length > 1 && (
          <ul className="mt-1 list-disc pl-4 text-xs">
            {setup.validationReasons.slice(1).map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Cell label="Entry" value={fmtPrice(setup.entry, setup.tickSize, setup.pricePrecision)} />
        <Cell label="Stop loss" value={fmtPrice(setup.stop, setup.tickSize, setup.pricePrecision)} />
        <Cell label="Target" value={fmtPrice(setup.target, setup.tickSize, setup.pricePrecision)} />
        <Cell label="Qty" value={fmt(setup.quantity, 6)} />
        <Cell label="Notional" value={`$${fmt(setup.notionalUSDT, 2)}`} />
        <Cell label="Required margin" value={`$${fmt(setup.requiredMarginUSDT ?? setup.marginUSDT, 4)}`} />
        <Cell label="Allocated" value={`$${fmt(setup.allocatedMarginUSDT ?? setup.marginUSDT, 2)} · ${setup.leverage}x`} />
        <Cell label="Mode" value={setup.marginMode || "ISOLATED"} />
        <Cell label="Entry fee" value={`$${fmt(setup.entryFeeUSDT, 4)}`} />
        <Cell label="Exit fee" value={`$${fmt(setup.exitFeeUSDT, 4)}`} />
        <Cell label="Round-trip fees" value={`$${fmt(setup.estimatedFeesUSDT, 4)}`} />
        <Cell label="Gross P/L" value={`$${fmt(setup.grossProfitUSDT, 4)} / $${fmt(setup.grossLossUSDT, 4)}`} />
        <Cell label="Net P/L" value={`$${fmt(netProfit, 4)} / $${fmt(netLoss, 4)}`} />
        <Cell label="Gross R/R" value={fmt(grossRR, 2)} />
        <Cell label="Net R/R" value={fmt(netRR, 2)} />
        <Cell label="Tick / step" value={`${fmt(setup.tickSize)} / ${fmt(setup.stepSize)}`} />
        <Cell label="Min qty / notional" value={`${fmt(setup.minQty, 6)} / $${fmt(setup.minNotional, 2)}`} />
        <Cell label="Liq risk" value={setup.liquidationRisk || "UNKNOWN"} />
        <Cell label="Liq est." value={setup.liquidationEstimateUSDT == null ? "not invented" : fmtPrice(setup.liquidationEstimateUSDT, setup.tickSize, setup.pricePrecision)} />
      </div>
      {setup.liquidationNote && <p className="text-xs text-gray-500">{setup.liquidationNote}</p>}
    </div>
  );
}
