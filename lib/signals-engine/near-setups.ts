import { isRrPublicationReject, MIN_NET_RISK_REWARD } from './trading';
import type { CoinScan, Direction, PatternStatus, QualityLabel } from './types';

/** Informational only — never published as an official LONG/SHORT signal. */
export type NearSetupCategory =
  | 'rr_gate'
  | 'missing_confirmation'
  | 'mtf_volume_block'
  | 'developing_pattern';

export type NearSetup = {
  symbol: string;
  bias: 'LONG' | 'SHORT' | 'UNKNOWN';
  nearSetupScore: number;
  category: NearSetupCategory;
  headline: string;
  blockers: string[];
  pattern: string;
  patternStatus: PatternStatus;
  qualityLabel: QualityLabel | null;
  price: number | null;
  changePct: number | null;
  grossRr: number | null;
  netRr: number | null;
  netRrRequired: number;
  netRrGap: number | null;
  analyzedAt: string;
  informationalOnly: true;
};

export const NEAR_SETUP_LIMIT = 8;
const MIN_SCORE = 45;

function parseRrFromReason(reason?: string | null): { net: number | null; gross: number | null } {
  if (!reason) return { net: null, gross: null };
  const match = reason.match(/Net risk\/reward is 1:([0-9.]+).*gross 1:([0-9.]+)/i);
  if (!match) return { net: null, gross: null };
  const net = Number(match[1]);
  const gross = Number(match[2]);
  return {
    net: Number.isFinite(net) ? net : null,
    gross: Number.isFinite(gross) ? gross : null,
  };
}

function inferBias(coin: CoinScan): 'LONG' | 'SHORT' | 'UNKNOWN' {
  const text = `${coin.reason || ''} ${coin.nextStep || ''} ${(coin.quality?.supporting || []).join(' ')}`;
  if (/possible LONG|A LONG idea|saw a possible LONG/i.test(text)) return 'LONG';
  if (/possible SHORT|A SHORT idea|saw a possible SHORT/i.test(text)) return 'SHORT';
  const mid = coin.timeframes?.find((item) => item.interval === '15m');
  if (mid?.trend === 'BULLISH') return 'LONG';
  if (mid?.trend === 'BEARISH') return 'SHORT';
  const patternBias = coin.timeframes
    ?.flatMap((tf) => tf.patterns || [])
    .find((p) => p.name === coin.pattern && (p.status === 'CONFIRMED' || p.status === 'FORMING'));
  if (patternBias?.bias === 'BULLISH') return 'LONG';
  if (patternBias?.bias === 'BEARISH') return 'SHORT';
  return 'UNKNOWN';
}

function hasDirectionalEvidence(coin: CoinScan): boolean {
  if (coin.direction !== 'WAIT') return false;
  if (!coin.available || coin.scanState === 'pending' || coin.scanState === 'failed' || coin.scanState === 'timeout') {
    return false;
  }
  if (isRrPublicationReject(coin.reason)) return true;
  if (coin.patternStatus === 'CONFIRMED' || coin.patternStatus === 'FORMING') {
    if (coin.pattern && coin.pattern !== 'None') return true;
  }
  if (/Stage A saw a possible (LONG|SHORT)|A (LONG|SHORT) idea is developing/i.test(coin.reason || '')) {
    return true;
  }
  if (coin.quality?.label === 'DEVELOPING SETUP' || coin.quality?.label === 'CONFLICTING EVIDENCE') {
    return Boolean(coin.pattern && coin.pattern !== 'None');
  }
  return false;
}

function categoryFor(coin: CoinScan, rrReject: boolean): NearSetupCategory {
  if (rrReject) return 'rr_gate';
  const reason = coin.reason || '';
  if (/Higher timeframe|opposes|conflicts with/i.test(reason) || /volume-backed|No confirmed 15m/i.test(reason)) {
    return 'mtf_volume_block';
  }
  if (/Missing confirmation|developing\. Missing|FORMING/i.test(reason) || coin.patternStatus === 'FORMING') {
    return 'missing_confirmation';
  }
  return 'developing_pattern';
}

function headlineFor(coin: CoinScan, bias: NearSetup['bias'], category: NearSetupCategory, netRr: number | null): string {
  const side = bias === 'UNKNOWN' ? 'directional' : bias;
  if (category === 'rr_gate' && netRr != null) {
    return `${side} structure cleared validation; net R/R 1:${netRr.toFixed(2)} is below the 1:${MIN_NET_RISK_REWARD} publication floor.`;
  }
  if (category === 'mtf_volume_block') {
    return `${side} idea is forming but MTF / volume / confirmation still blocks publication.`;
  }
  if (category === 'missing_confirmation') {
    return `${coin.pattern} is developing — waiting for an independent confirmation close.`;
  }
  return `${coin.pattern || 'Setup'} is watching; not an official ${side === 'directional' ? 'LONG/SHORT' : side} signal.`;
}

/**
 * Deterministic ranking score for Near Setups only.
 * Must never be used to publish official LONG/SHORT.
 */
export function nearSetupScore(coin: CoinScan): number {
  if (!hasDirectionalEvidence(coin)) return 0;
  let score = 0;
  const rrReject = isRrPublicationReject(coin.reason);
  const { net, gross } = parseRrFromReason(coin.reason);

  if (rrReject) {
    score += 100;
    if (net != null) {
      // Closer to 3.0 ranks higher; ASTER ~1.04 beats ZEC ~0.03.
      score += Math.max(0, Math.min(50, (net / MIN_NET_RISK_REWARD) * 50));
    }
    if (gross != null) score += Math.min(10, gross);
  }

  if (coin.patternStatus === 'CONFIRMED') score += 50;
  else if (coin.patternStatus === 'FORMING') score += 28;
  else if (coin.pattern && coin.pattern !== 'None') score += 10;

  if (/Stage A saw a possible (LONG|SHORT)/i.test(coin.reason || '')) score += 35;
  if (/A (LONG|SHORT) idea is developing/i.test(coin.reason || '')) score += 22;

  const votes = coin.quality?.timeframeVotes || [];
  for (const vote of votes) {
    if (vote.interval === '15m' || vote.interval === '1h' || vote.interval === '4h') {
      if (vote.vote === 'SUPPORT') score += 8;
      if (vote.vote === 'CONTRADICT') score -= 12;
    }
  }

  if (coin.quality?.label === 'DEVELOPING SETUP') score += 8;
  if (coin.quality?.label === 'CONFLICTING EVIDENCE') score -= 5;
  if (coin.quality?.label === 'INSUFFICIENT DATA') score -= 40;

  const blockers = coin.quality?.contradictory || [];
  for (const item of blockers) {
    if (/opposes|No confirmed|conflicts/i.test(item)) score -= 6;
  }

  if (coin.stale) score -= 15;
  return Math.round(score * 10) / 10;
}

export function buildNearSetup(coin: CoinScan): NearSetup | null {
  if (!hasDirectionalEvidence(coin)) return null;
  const score = nearSetupScore(coin);
  if (score < MIN_SCORE) return null;

  const rrReject = isRrPublicationReject(coin.reason);
  const { net, gross } = parseRrFromReason(coin.reason);
  const bias = inferBias(coin);
  const category = categoryFor(coin, rrReject);
  const blockers = [
    ...(rrReject && net != null
      ? [`Net R/R 1:${net.toFixed(2)} below required 1:${MIN_NET_RISK_REWARD}`]
      : []),
    ...(coin.quality?.contradictory || []).slice(0, 4),
  ];
  if (!blockers.length && coin.reason) blockers.push(coin.reason);

  return {
    symbol: coin.symbol,
    bias,
    nearSetupScore: score,
    category,
    headline: headlineFor(coin, bias, category, net),
    blockers,
    pattern: coin.pattern || 'None',
    patternStatus: coin.patternStatus,
    qualityLabel: coin.quality?.label ?? null,
    price: coin.price,
    changePct: coin.changePct ?? null,
    grossRr: gross,
    netRr: net,
    netRrRequired: MIN_NET_RISK_REWARD,
    netRrGap: net != null ? Math.max(0, MIN_NET_RISK_REWARD - net) : null,
    analyzedAt: coin.analyzedAt,
    informationalOnly: true,
  };
}

export function selectNearSetups(coins: CoinScan[], limit = NEAR_SETUP_LIMIT): NearSetup[] {
  return coins
    .map((coin) => buildNearSetup(coin))
    .filter((item): item is NearSetup => Boolean(item))
    .sort((a, b) => b.nearSetupScore - a.nearSetupScore || a.symbol.localeCompare(b.symbol))
    .slice(0, limit);
}

/** Guard: Near Setups must never alter official direction. */
export function nearSetupsAreInformationalOnly(direction: Direction, near: NearSetup | null | undefined): boolean {
  if (!near) return true;
  return direction === 'WAIT' && near.informationalOnly === true;
}
