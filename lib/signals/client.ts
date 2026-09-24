import type { User } from "firebase/auth";
import { formatPriceByTick } from "@/lib/signals-engine/trading";

const DEFAULT_TIMEOUT_MS = 45_000;

export async function signalsFetch(path: string, user: User | null, init?: RequestInit & { timeoutMs?: number }) {
  const token = user ? await user.getIdToken() : "";
  const timeoutMs = init?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { timeoutMs: _omit, ...rest } = init || {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (rest.signal) {
    rest.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  try {
    return await fetch(path, {
      ...rest,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        ...(rest.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Signals request timed out after ${Math.round(timeoutMs / 1000)}s. The scanner API did not respond.`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function fmtPrice(value: number | null | undefined, tickSize?: number | null, pricePrecision?: number) {
  if (value == null || Number.isNaN(value)) return "—";
  if (tickSize != null && tickSize > 0) return `$${formatPriceByTick(value, tickSize, pricePrecision)}`;
  const digits = value >= 1000 ? 2 : value >= 1 ? 4 : 6;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: digits })}`;
}

export function fmt(value: number | null | undefined, digits = 4) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export function dirClass(direction: string) {
  if (direction === "LONG") return "text-emerald-400";
  if (direction === "SHORT") return "text-rose-400";
  return "text-amber-300";
}

export function dirBadgeClass(direction: string) {
  if (direction === "LONG") return "border-emerald-500/30 bg-emerald-500/15 text-emerald-300";
  if (direction === "SHORT") return "border-rose-500/30 bg-rose-500/15 text-rose-300";
  return "border-amber-500/35 bg-amber-500/10 text-amber-300";
}

export function dirCardClass(direction: string) {
  if (direction === "LONG") return "border-emerald-500/25";
  if (direction === "SHORT") return "border-rose-500/25";
  return "border-amber-500/25";
}

export function fmtChange(changePct: number | null | undefined) {
  if (changePct == null || Number.isNaN(changePct)) return "—";
  const sign = changePct > 0 ? "+" : "";
  return `${sign}${changePct.toFixed(2)}%`;
}

export function changeClass(changePct: number | null | undefined) {
  if (changePct == null || Number.isNaN(changePct) || changePct === 0) return "text-gray-400";
  return changePct > 0 ? "text-emerald-400" : "text-rose-400";
}
