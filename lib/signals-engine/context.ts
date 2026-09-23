import { pearsonCorrelation } from './indicators';
import type { MarketContext, TimeframeSnapshot, Trend } from './types';

export function btcTrendFromSnapshots(snapshots: TimeframeSnapshot[]): Trend | null {
  const four = snapshots.find((item) => item.interval === '4h');
  const hourly = snapshots.find((item) => item.interval === '1h');
  if (four?.trend && hourly?.trend && four.trend !== 'MIXED' && hourly.trend !== 'MIXED' && four.trend !== hourly.trend) {
    return 'MIXED';
  }
  return four?.trend || hourly?.trend || null;
}

export function buildMarketContext(input: {
  symbol: string;
  livePrice?: number | null;
  markPrice?: number | null;
  fundingRate?: number | null;
  openInterest?: number | null;
  atr?: number | null;
  volumeRatio?: number | null;
  btcSnapshots?: TimeframeSnapshot[];
  symbolCloses?: number[];
  btcCloses?: number[];
}): MarketContext {
  const notes: string[] = [];
  const btcTrend = input.btcSnapshots?.length ? btcTrendFromSnapshots(input.btcSnapshots) : null;
  const correlation = input.symbolCloses && input.btcCloses ? pearsonCorrelation(input.symbolCloses, input.btcCloses) : null;
  let estimatedSpreadBps: number | null = null;
  if (input.livePrice != null && input.markPrice != null && input.livePrice > 0) {
    estimatedSpreadBps = Number((Math.abs(input.livePrice - input.markPrice) / input.livePrice * 10_000).toFixed(2));
  } else {
    notes.push('Mark/last spread was not available and was not invented.');
  }
  let estimatedSlippageBps: number | null = null;
  if (input.atr != null && input.livePrice != null && input.livePrice > 0) {
    estimatedSlippageBps = Number(((input.atr / input.livePrice) * 0.15 * 10_000).toFixed(2));
  } else {
    notes.push('Slippage is an ATR-based estimate only when ATR is present.');
  }
  if (input.fundingRate == null) notes.push('Funding rate was not available and was not invented.');
  if (input.openInterest == null) notes.push('Open interest was not available and was not invented.');
  if (input.symbol === 'BTCUSDT') notes.push('BTC is the reference market; self-correlation is skipped.');
  return {
    btcAvailable: Boolean(input.btcSnapshots?.length) || input.symbol === 'BTCUSDT',
    btcTrend: input.symbol === 'BTCUSDT' ? btcTrendFromSnapshots(input.btcSnapshots || []) : btcTrend,
    correlationToBtc: input.symbol === 'BTCUSDT' ? 1 : correlation,
    fundingRate: input.fundingRate ?? null,
    openInterest: input.openInterest ?? null,
    markPrice: input.markPrice ?? null,
    estimatedSpreadBps,
    estimatedSlippageBps,
    volumeRatio: input.volumeRatio ?? null,
    notes,
  };
}
