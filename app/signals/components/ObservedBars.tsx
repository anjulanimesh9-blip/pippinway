export type ObservedBar = {
  label: string;
  value: number;
  color: string;
};

export function ObservedBars({ items, empty = "No observed counts yet." }: { items: ObservedBar[]; empty?: string }) {
  const max = Math.max(...items.map((item) => item.value), 0);
  if (!items.length || max === 0) {
    return <p className="text-sm text-gray-500">{empty}</p>;
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
            <span>{item.label}</span>
            <span className="tabular-nums text-gray-200">{item.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%`, backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SourceBadge({ kind }: { kind: "backtested" | "observed" | "brokerage" }) {
  const copy = {
    backtested: { label: "Backtested", className: "border-sky-500/30 bg-sky-500/10 text-sky-200" },
    observed: { label: "Observed", className: "border-amber-500/30 bg-amber-500/10 text-amber-200" },
    brokerage: { label: "Brokerage verified", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" },
  }[kind];
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${copy.className}`}>
      {copy.label}
    </span>
  );
}
