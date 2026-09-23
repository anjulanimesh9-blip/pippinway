import { getRawExchangeInfo, getTicker24hrAll, type RawExchangeSymbol } from './binance';
import { SCAN_SYMBOLS, isValidSymbol, type CoinScan, type ScanMode, type ScannerCounts } from './types';

export { isValidSymbol };

export const CORE_WATCHLIST: string[] = [...SCAN_SYMBOLS];
export const DEFAULT_LIVE_SCAN_MODE: ScanMode = '50';
export const MIN_LIQUID_QUOTE_VOLUME = 1_000_000;
const UNIVERSE_TTL_MS = 15 * 60_000;

export type EligibleUniverse = {
  symbols: string[];
  count: number;
  fetchedAt: string;
};

export type UniverseSelection = {
  mode: ScanMode;
  symbols: string[];
  eligible: number;
  listedAt: string;
};

type CachedUniverse = { value: EligibleUniverse; expires: number };
let universeCache: CachedUniverse | null = null;
let universeInflight: Promise<EligibleUniverse> | null = null;

export function parseScanMode(value: string | null | undefined): ScanMode {
  if (value === '15' || value === '50' || value === '100' || value === 'all' || value === 'custom') return value;
  return DEFAULT_LIVE_SCAN_MODE;
}

export function clampWatchlist(input: unknown, max = 100): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of input) {
    if (typeof item !== 'string') continue;
    const symbol = item.trim().toUpperCase();
    if (!isValidSymbol(symbol) || seen.has(symbol)) continue;
    seen.add(symbol);
    out.push(symbol);
    if (out.length >= max) break;
  }
  return out;
}

export function isEligiblePerpetual(row: Pick<RawExchangeSymbol, 'symbol' | 'status' | 'contractType' | 'quoteAsset'>): boolean {
  const quote = row.quoteAsset || (row.symbol.endsWith('USDT') ? 'USDT' : '');
  return row.status === 'TRADING' && row.contractType === 'PERPETUAL' && quote === 'USDT';
}

export function eligibleSymbolsFromExchange(rows: Array<Pick<RawExchangeSymbol, 'symbol' | 'status' | 'contractType' | 'quoteAsset'>>): string[] {
  return rows
    .filter(isEligiblePerpetual)
    .map((row) => row.symbol)
    .filter(isValidSymbol)
    .sort((a, b) => a.localeCompare(b));
}

export function rankByQuoteVolume(symbols: string[], quoteVolume: Record<string, number>): string[] {
  return [...symbols].sort((a, b) => {
    const delta = (quoteVolume[b] || 0) - (quoteVolume[a] || 0);
    if (delta !== 0) return delta;
    return a.localeCompare(b);
  });
}

export function liquidSymbols(
  symbols: string[],
  quoteVolume: Record<string, number>,
  minVolume = MIN_LIQUID_QUOTE_VOLUME,
): string[] {
  return symbols.filter((symbol) => (quoteVolume[symbol] || 0) >= minVolume);
}

export function selectUniverse(input: {
  mode: ScanMode;
  eligible: string[];
  quoteVolume: Record<string, number>;
  custom?: string[];
}): UniverseSelection {
  const listedAt = new Date().toISOString();
  const eligible = [...input.eligible];
  const eligibleSet = new Set(eligible);

  if (input.mode === '15') {
    const listedCore = CORE_WATCHLIST.filter((symbol) => eligibleSet.has(symbol));
    return { mode: '15', symbols: listedCore.length ? listedCore : [...CORE_WATCHLIST], eligible: eligible.length, listedAt };
  }

  if (input.mode === 'custom') {
    const symbols = clampWatchlist(input.custom).filter((symbol) => eligibleSet.has(symbol));
    return { mode: 'custom', symbols: symbols.length ? symbols : CORE_WATCHLIST.filter((symbol) => eligibleSet.has(symbol)), eligible: eligible.length, listedAt };
  }

  const liquid = liquidSymbols(eligible, input.quoteVolume);
  const ranked = rankByQuoteVolume(liquid, input.quoteVolume);
  if (input.mode === 'all') {
    return { mode: 'all', symbols: ranked, eligible: eligible.length, listedAt };
  }
  const cap = input.mode === '50' ? 50 : 100;
  return { mode: input.mode, symbols: ranked.slice(0, cap), eligible: eligible.length, listedAt };
}

export function selectTop50(eligible: string[], quoteVolume: Record<string, number>): UniverseSelection {
  return selectUniverse({ mode: '50', eligible, quoteVolume });
}

export function scannerCounts(coins: CoinScan[]): ScannerCounts {
  const counted = coins.filter((coin) => coin.scanState && coin.scanState !== 'pending');
  return {
    long: counted.filter((coin) => coin.direction === 'LONG').length,
    short: counted.filter((coin) => coin.direction === 'SHORT').length,
    wait: counted.filter((coin) => coin.direction === 'WAIT' && coin.scanState !== 'failed' && coin.scanState !== 'skipped' && coin.scanState !== 'timeout').length,
    invalid: counted.filter((coin) => coin.lifecycle?.status === 'INVALIDATED' || coin.scanState === 'failed' || coin.scanState === 'timeout' || !coin.available).length,
    expired: counted.filter((coin) => coin.lifecycle?.status === 'EXPIRED').length,
    pending: coins.filter((coin) => !coin.scanState || coin.scanState === 'pending').length,
  };
}

export function markAnalysisStale(coin: CoinScan, reason = 'Cached analysis is stale after a process restart. Not a current trading opportunity.'): CoinScan {
  return {
    ...coin,
    stale: true,
    scanState: coin.scanState === 'pending' ? 'pending' : coin.scanState,
    setup: coin.setup
      ? {
          ...coin.setup,
          executable: false,
          executableReason: `NOT EXECUTABLE: ${reason}`,
          validationReasons: [reason, ...(coin.setup.validationReasons || [])],
        }
      : null,
    nextStep: reason,
  };
}

export function jobFingerprint(mode: string, symbols: string[]): string {
  return `${mode}:${symbols.join(',')}`;
}

export function invalidateUniverse() {
  universeCache = null;
}

export async function listEligiblePerpetuals(force = false): Promise<EligibleUniverse> {
  if (!force && universeCache && universeCache.expires > Date.now()) return universeCache.value;
  if (!force && universeInflight) return universeInflight;
  universeInflight = getRawExchangeInfo(force)
    .then((rows) => {
      const symbols = eligibleSymbolsFromExchange(rows);
      const value: EligibleUniverse = {
        symbols,
        count: symbols.length,
        fetchedAt: new Date().toISOString(),
      };
      universeCache = { value, expires: Date.now() + UNIVERSE_TTL_MS };
      return value;
    })
    .finally(() => {
      universeInflight = null;
    });
  return universeInflight;
}

export async function quoteVolumeMap(): Promise<Record<string, number>> {
  const rows = await getTicker24hrAll();
  const out: Record<string, number> = {};
  for (const [symbol, row] of rows) out[symbol] = row.quoteVolume;
  return out;
}

export async function resolveUniverse(mode: ScanMode, custom?: string[]): Promise<UniverseSelection> {
  const [listed, volume] = await Promise.all([listEligiblePerpetuals(), quoteVolumeMap().catch(() => ({} as Record<string, number>))]);
  return selectUniverse({ mode, eligible: listed.symbols, quoteVolume: volume, custom });
}

export function allowedScanMode(plan: 'free' | 'pro', requested: ScanMode): { mode: ScanMode; warning?: string } {
  if (plan === 'pro') return { mode: requested };
  if (requested === '15') return { mode: '15' };
  return { mode: '15', warning: '50, 100 and All Coins scanners are Pro features. Free accounts keep the BTC, ETH and BNB overview.' };
}
