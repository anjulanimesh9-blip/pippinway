import { promises as fs } from "fs";
import path from "path";
import {
  encodeDocumentId,
  fromFirestoreFields,
  resolveOfficialRemote,
  toFirestoreFields,
} from "@/lib/signals/firestore-official";
import { readFirebaseAdminAccount } from "@/lib/signals/admin-credentials";
import type { CoinScan, ScannerResponse, ScanMode } from "@/lib/signals-engine/types";
import { DEFAULT_SETTINGS } from "@/lib/signals-engine/types";
import { CORE_WATCHLIST, selectUniverse } from "@/lib/signals-engine/universe";
import { selectNearSetups } from "@/lib/signals-engine/near-setups";
import { createSign } from "crypto";

export const SCAN_SNAPSHOT_COLLECTION = "signalsScanSnapshot";
export const SCAN_SNAPSHOT_LIVE_ID = "live";

export type PublishedScanSnapshot = {
  id: typeof SCAN_SNAPSHOT_LIVE_ID;
  publishedAt: string;
  source: "persistent-worker" | "local" | "unknown";
  processId: string | null;
  response: ScannerResponse;
};

function filePath() {
  return path.join(process.cwd(), "data", "scan-snapshot.json");
}

function compactCoin(coin: CoinScan): CoinScan {
  return {
    ...coin,
    timeframes: [],
    context: null,
  };
}

export function compactScannerResponse(response: ScannerResponse): ScannerResponse {
  return {
    ...response,
    coins: (response.coins || []).map(compactCoin),
    nearSetups: response.nearSetups?.length
      ? response.nearSetups
      : selectNearSetups(response.coins || []),
    officialLive: (response.officialLive || []).map(compactCoin),
  };
}

function projectId() {
  return process.env.FIREBASE_PROJECT_ID || "pippinway-e9719";
}

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

let tokenCache: { value: string; exp: number } | null = null;

async function serviceAccountToken(account: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.exp - 60 > now) return tokenCache.value;
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(
    JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/datastore",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  ).toString("base64url");
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${signer.sign(account.private_key, "base64url")}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!response.ok) throw new Error(`Firestore token exchange failed (${response.status})`);
  const body = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) throw new Error("Firestore token exchange returned no access_token");
  tokenCache = { value: body.access_token, exp: now + (body.expires_in || 3600) };
  return body.access_token;
}

function firestoreBase() {
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  if (emulatorHost) {
    const host = emulatorHost.startsWith("http") ? emulatorHost : `http://${emulatorHost}`;
    return `${host}/v1/projects/${projectId()}/databases/(default)/documents`;
  }
  return `https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents`;
}

async function firestoreHeaders() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.FIRESTORE_EMULATOR_HOST) return headers;
  const account = readFirebaseAdminAccount();
  if (!account) throw new Error("Firebase Admin credentials are required to publish/read scan snapshots remotely.");
  headers.Authorization = `Bearer ${await serviceAccountToken(account)}`;
  return headers;
}

async function putSnapshotDoc(record: PublishedScanSnapshot) {
  const response = await fetch(
    `${firestoreBase()}/${SCAN_SNAPSHOT_COLLECTION}/${encodeDocumentId(SCAN_SNAPSHOT_LIVE_ID)}`,
    {
      method: "PATCH",
      headers: await firestoreHeaders(),
      body: JSON.stringify({ fields: toFirestoreFields(record as unknown as Record<string, unknown>) }),
    },
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Firestore scan snapshot write failed (${response.status})${detail ? `: ${detail.slice(0, 160)}` : ""}`);
  }
}

async function getSnapshotDoc(): Promise<PublishedScanSnapshot | null> {
  const response = await fetch(
    `${firestoreBase()}/${SCAN_SNAPSHOT_COLLECTION}/${encodeDocumentId(SCAN_SNAPSHOT_LIVE_ID)}`,
    { headers: await firestoreHeaders(), cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Firestore scan snapshot read failed (${response.status})`);
  const body = (await response.json()) as { fields?: Record<string, FirestoreValue> };
  return fromFirestoreFields(body.fields) as PublishedScanSnapshot;
}

async function writeLocalFile(snapshot: PublishedScanSnapshot) {
  await fs.mkdir(path.dirname(filePath()), { recursive: true });
  await fs.writeFile(filePath(), JSON.stringify(snapshot));
}

async function readLocalFile(): Promise<PublishedScanSnapshot | null> {
  try {
    const raw = await fs.readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as PublishedScanSnapshot;
    if (!parsed?.response?.coins) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function publishScanSnapshot(
  response: ScannerResponse,
  meta?: { processId?: string | null; source?: PublishedScanSnapshot["source"] },
): Promise<PublishedScanSnapshot> {
  const snapshot: PublishedScanSnapshot = {
    id: SCAN_SNAPSHOT_LIVE_ID,
    publishedAt: new Date().toISOString(),
    source: meta?.source || "persistent-worker",
    processId: meta?.processId ?? null,
    response: compactScannerResponse(response),
  };
  await writeLocalFile(snapshot);
  const remoteReady = Boolean(readFirebaseAdminAccount() || process.env.FIRESTORE_EMULATOR_HOST || resolveOfficialRemote());
  if (remoteReady) {
    try {
      await putSnapshotDoc(snapshot);
    } catch (error) {
      console.warn(JSON.stringify({
        event: "scan_snapshot_remote_write_failed",
        reason: error instanceof Error ? error.message.slice(0, 200) : "unknown",
      }));
    }
  }
  return snapshot;
}

export async function loadPublishedScanSnapshot(): Promise<PublishedScanSnapshot | null> {
  try {
    if (readFirebaseAdminAccount() || process.env.FIRESTORE_EMULATOR_HOST) {
      const remote = await getSnapshotDoc();
      if (remote?.response?.coins) return remote;
    }
  } catch (error) {
    console.warn(JSON.stringify({
      event: "scan_snapshot_remote_read_failed",
      reason: error instanceof Error ? error.message.slice(0, 200) : "unknown",
    }));
  }
  return readLocalFile();
}

export function filterSnapshotForMode(response: ScannerResponse, mode: ScanMode, custom?: string[]): ScannerResponse {
  const volume: Record<string, number> = {};
  for (const coin of response.coins) {
    volume[coin.symbol] = coin.quoteVolume || 0;
  }
  const eligible = response.universe?.eligible
    ? response.coins.map((c) => c.symbol)
    : response.coins.map((c) => c.symbol);
  // Prefer symbols already in the published board; for mode 15 use core watchlist intersection.
  if (mode === "15") {
    const wanted = new Set(CORE_WATCHLIST);
    const coins = response.coins.filter((coin) => wanted.has(coin.symbol));
    const ordered = CORE_WATCHLIST.map((symbol) => coins.find((c) => c.symbol === symbol)).filter(
      (coin): coin is CoinScan => Boolean(coin),
    );
    return {
      ...response,
      coins: ordered.length ? ordered : coins,
      universe: {
        mode: "15",
        eligible: response.universe?.eligible ?? eligible.length,
        selected: ordered.length || coins.length,
        listedAt: response.universe?.listedAt || response.fetchedAt,
      },
    };
  }
  if (mode === "50" || mode === "100" || mode === "all") {
    const selection = selectUniverse({
      mode: mode === "all" ? "all" : mode,
      eligible: response.coins.map((c) => c.symbol),
      quoteVolume: volume,
    });
    const bySymbol = new Map(response.coins.map((coin) => [coin.symbol, coin]));
    const coins = selection.symbols.map((symbol) => bySymbol.get(symbol)).filter((coin): coin is CoinScan => Boolean(coin));
    return {
      ...response,
      coins,
      universe: {
        mode,
        eligible: response.universe?.eligible ?? response.coins.length,
        selected: coins.length,
        listedAt: response.universe?.listedAt || response.fetchedAt,
      },
    };
  }
  if (mode === "custom") {
    const selection = selectUniverse({
      mode: "custom",
      eligible: response.coins.map((c) => c.symbol),
      quoteVolume: volume,
      custom,
    });
    const bySymbol = new Map(response.coins.map((coin) => [coin.symbol, coin]));
    const coins = selection.symbols.map((symbol) => bySymbol.get(symbol)).filter((coin): coin is CoinScan => Boolean(coin));
    return {
      ...response,
      coins,
      universe: {
        mode: "custom",
        eligible: response.universe?.eligible ?? response.coins.length,
        selected: coins.length,
        listedAt: response.universe?.listedAt || response.fetchedAt,
      },
    };
  }
  return response;
}

export function emptyOfflineScannerResponse(message: string): ScannerResponse {
  return {
    settings: DEFAULT_SETTINGS,
    fetchedAt: new Date().toISOString(),
    pricesUpdatedAt: new Date().toISOString(),
    stale: true,
    error: message,
    warnings: [message],
    coins: [],
    universe: { mode: "50", eligible: 0, selected: 0, listedAt: new Date().toISOString() },
    counts: { long: 0, short: 0, wait: 0, invalid: 0, expired: 0, pending: 0 },
    nearSetups: [],
    officialLive: [],
    health: {
      priceFeed: "error",
      analysisFeed: "error",
      lastScanAt: null,
      lastPriceAt: null,
      monitoring: "idle",
      workerStatus: "offline",
      coverageNote: message,
    },
  };
}

export function snapshotAgeMs(snapshot: PublishedScanSnapshot | null): number | null {
  if (!snapshot?.publishedAt) return null;
  const at = Date.parse(snapshot.publishedAt);
  if (!Number.isFinite(at)) return null;
  return Math.max(0, Date.now() - at);
}
