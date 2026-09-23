import { FREE_DAILY_REVEALS } from "./config";

export type RevealRecord = {
  uid: string;
  date: string;
  symbols: string[];
  dailySet?: string[];
  updatedAt: string;
};

export type RevealAllowance = {
  used: number;
  limit: number;
  remaining: number;
  date: string;
  resetAt: string;
  timezone: "UTC";
  symbols: string[];
};

export function utcDate(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function utcResetAt(date = utcDate()): string {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString();
}

export function revealKey(symbol: string): string {
  return String(symbol || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
}

export function allowanceFromRecord(record: RevealRecord | null, limit = FREE_DAILY_REVEALS, now = Date.now()): RevealAllowance {
  const date = utcDate(now);
  const symbols = record && record.date === date ? [...new Set(record.symbols.map(revealKey).filter(Boolean))] : [];
  const used = symbols.length;
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    date,
    resetAt: utcResetAt(date),
    timezone: "UTC",
    symbols,
  };
}

export function applyReveal(record: RevealRecord | null, uid: string, symbol: string, limit = FREE_DAILY_REVEALS, now = Date.now()): {
  record: RevealRecord;
  allowance: RevealAllowance;
  consumed: boolean;
  allowed: boolean;
  already: boolean;
} {
  const key = revealKey(symbol);
  const current = allowanceFromRecord(record, limit, now);
  const already = current.symbols.includes(key);
  const dailySet = record?.date === current.date ? record.dailySet : undefined;
  if (!key) {
    return { record: record || { uid, date: current.date, symbols: [], dailySet, updatedAt: new Date(now).toISOString() }, allowance: current, consumed: false, allowed: false, already: false };
  }
  if (already) {
    return {
      record: { uid, date: current.date, symbols: current.symbols, dailySet, updatedAt: record?.updatedAt || new Date(now).toISOString() },
      allowance: current,
      consumed: false,
      allowed: true,
      already: true,
    };
  }
  if (current.used >= limit) {
    return {
      record: { uid, date: current.date, symbols: current.symbols, dailySet, updatedAt: record?.updatedAt || new Date(now).toISOString() },
      allowance: current,
      consumed: false,
      allowed: false,
      already: false,
    };
  }
  const symbols = [...current.symbols, key];
  const next: RevealRecord = { uid, date: current.date, symbols, dailySet, updatedAt: new Date(now).toISOString() };
  return { record: next, allowance: allowanceFromRecord(next, limit, now), consumed: true, allowed: true, already: false };
}
