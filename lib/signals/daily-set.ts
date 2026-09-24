import { revealKey } from "./quota";

export type DailyCandidate = {
  symbol: string;
  direction?: string;
  available?: boolean;
  scanState?: string;
  patternStatus?: string;
  quoteVolume?: number | null;
  analyzedAt?: string;
  setup?: { entry?: number; stop?: number; target?: number } | null;
  lifecycle?: { status?: string } | null;
};

const CLOSED = new Set(["EXPIRED", "INVALIDATED", "MISSED_ENTRY", "TARGET_HIT", "STOP_HIT", "AMBIGUOUS"]);

export function isActionableFreeSignal(coin: DailyCandidate): boolean {
  if (!coin.available) return false;
  if (coin.scanState === "pending" || coin.scanState === "failed" || coin.scanState === "skipped") return false;
  if (coin.direction !== "LONG" && coin.direction !== "SHORT") return false;
  if (!coin.setup || coin.setup.entry == null || coin.setup.stop == null || coin.setup.target == null) return false;
  if (coin.lifecycle?.status && CLOSED.has(coin.lifecycle.status)) return false;
  return true;
}

function rank(coin: DailyCandidate): number {
  let score = 0;
  const status = coin.lifecycle?.status || "";
  if (status === "ACTIVE" || status === "TRIGGERED") score += 80;
  else if (status === "WAITING_FOR_ENTRY") score += 50;
  if (coin.patternStatus === "CONFIRMED") score += 30;
  else if (coin.patternStatus === "FORMING") score += 10;
  score += Math.min(20, Math.log10((coin.quoteVolume || 0) + 1));
  return score;
}

export function pickDailyFreeSignals(coins: DailyCandidate[], existing: string[], limit: number): string[] {
  const frozen = [...new Set(existing.map(revealKey).filter(Boolean))].slice(0, limit);
  if (frozen.length) return frozen;
  return coins
    .filter(isActionableFreeSignal)
    .sort((a, b) => {
      const delta = rank(b) - rank(a);
      if (delta !== 0) return delta;
      return (Date.parse(b.analyzedAt || "") || 0) - (Date.parse(a.analyzedAt || "") || 0);
    })
    .slice(0, limit)
    .map((coin) => revealKey(coin.symbol));
}

export function isScanReadyForFreeze(scan: {
  coins?: unknown[];
  progress?: { pending?: number; scanned?: number; failed?: number; skipped?: number; running?: boolean };
  universe?: { selected?: number };
}): boolean {
  const selected = scan.universe?.selected || scan.coins?.length || 0;
  const pending = scan.progress?.pending ?? 0;
  const finished = (scan.progress?.scanned || 0) + (scan.progress?.failed || 0) + (scan.progress?.skipped || 0);
  if (selected > 0 && pending === 0 && !scan.progress?.running) return true;
  if (selected > 0 && finished >= selected) return true;
  return false;
}

export function lockedPreviewSymbols(coins: DailyCandidate[], dailySet: string[], limit = 3): string[] {
  const taken = new Set(dailySet.map(revealKey));
  return coins
    .filter((coin) => coin.available && !taken.has(revealKey(coin.symbol)))
    .sort((a, b) => (b.quoteVolume || 0) - (a.quoteVolume || 0))
    .slice(0, limit)
    .map((coin) => revealKey(coin.symbol));
}
