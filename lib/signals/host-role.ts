/**
 * Host role for Pippinway Signals.
 *
 * Continuous Binance market-data scanning belongs on the persistent worker host.
 * Vercel Production egress is blocked by Binance (HTTP 451), so Vercel must not
 * run the continuous scanner unless an explicit override is set for emergency labs.
 */

export function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
}

/** True when this process is allowed to call Binance for scanning / universe / prices. */
export function binanceScanningAllowed(): boolean {
  if (process.env.SIGNALS_ALLOW_BINANCE_ON_VERCEL === "1") return true;
  if (isVercelRuntime()) return false;
  return true;
}

/** Prefer Firestore (or file) scanner snapshots published by the persistent worker. */
export function preferPublishedScanSnapshot(): boolean {
  if (process.env.SIGNALS_FORCE_LIVE_SCAN === "1") return false;
  return !binanceScanningAllowed() || process.env.SIGNALS_READ_PUBLISHED_SNAPSHOT === "1";
}
