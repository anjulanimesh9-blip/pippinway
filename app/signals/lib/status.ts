import type { CoinScan } from "@/lib/signals-engine/types";

const CLOSED = new Set(["EXPIRED", "INVALIDATED", "MISSED_ENTRY", "TARGET_HIT", "STOP_HIT"]);

export function isClosed(coin: CoinScan) {
  return Boolean(coin.lifecycle?.status && CLOSED.has(coin.lifecycle.status));
}

export function hasValidatedSetup(coin: CoinScan) {
  return Boolean(
    (coin.direction === "LONG" || coin.direction === "SHORT")
    && coin.setup
    && coin.setup.entry != null
    && coin.setup.stop != null
    && coin.setup.target != null,
  );
}

export function isActionableSetup(coin: CoinScan) {
  return hasValidatedSetup(coin) && !isClosed(coin) && coin.scanState !== "pending";
}

export type StatusBucket = "LONG" | "SHORT" | "WAIT" | "PENDING" | "EXPIRED" | "STALE" | "INVALIDATED";

export function statusBucket(coin: CoinScan): StatusBucket {
  if (coin.scanState === "pending") return "PENDING";
  const life = coin.lifecycle?.status;
  if (life === "INVALIDATED") return "INVALIDATED";
  if (life === "EXPIRED" || life === "MISSED_ENTRY") return "EXPIRED";
  if (coin.stale || coin.scanState === "failed" || coin.scanState === "timeout") return "STALE";
  if (coin.direction === "LONG") return "LONG";
  if (coin.direction === "SHORT") return "SHORT";
  return "WAIT";
}

export function matchesStatusFilter(coin: CoinScan, filter: string) {
  if (!filter || filter === "SETUPS") return isActionableSetup(coin);
  if (filter === "LONG") return statusBucket(coin) === "LONG" && !isClosed(coin);
  if (filter === "SHORT") return statusBucket(coin) === "SHORT" && !isClosed(coin);
  if (filter === "WAIT") return statusBucket(coin) === "WAIT";
  if (filter === "PENDING") return statusBucket(coin) === "PENDING";
  if (filter === "STALE") return statusBucket(coin) === "STALE" || coin.stale === true;
  if (filter === "INVALIDATED") return coin.lifecycle?.status === "INVALIDATED";
  if (filter === "EXPIRED") return statusBucket(coin) === "EXPIRED" || isClosed(coin);
  return true;
}
