export function pairLabel(symbol: string) {
  const upper = symbol.toUpperCase();
  if (upper.endsWith("USDT")) return `${upper.slice(0, -4)}/USDT`;
  return upper;
}

export function relativeTime(iso?: string | null) {
  if (!iso) return "—";
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return "just now";
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function primaryTimeframe(coin: { timeframes?: Array<{ interval: string }> }) {
  return coin.timeframes?.find((item) => item.interval === "15m")?.interval
    || coin.timeframes?.[0]?.interval
    || "15m";
}
