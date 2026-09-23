import { createSign } from "crypto";
import { readFirebaseAdminAccount, type FirebaseAdminAccount } from "@/lib/signals/admin-credentials";
import {
  LIFECYCLE_EVENTS_COLLECTION,
  OBSERVED_OUTCOMES_COLLECTION,
  OFFICIAL_SIGNALS_COLLECTION,
  SCANNER_HEALTH_COLLECTION,
  SCANNER_HEALTH_ID,
  type LifecycleEvent,
  type ObservedOutcome,
  type OfficialSignal,
  type OfficialStoreSnapshot,
  type ScannerHealth,
  emptyHealth,
} from "@/lib/signals/official-types";

export const MUTABLE_SIGNAL_KEYS = [
  "lifecycleStatus",
  "observedTrigger",
  "lastPrice",
  "lastPriceAt",
  "closedAt",
  "updatedAt",
] as const;

export type OfficialRemote = {
  enabled: true;
  label: "firestore" | "function";
  listSignals(): Promise<OfficialSignal[]>;
  listEvents(): Promise<LifecycleEvent[]>;
  listOutcomes(): Promise<ObservedOutcome[]>;
  getHealth(): Promise<ScannerHealth | null>;
  createSignal(record: OfficialSignal): Promise<OfficialSignal>;
  patchSignal(id: string, patch: Partial<OfficialSignal>): Promise<void>;
  createEvent(event: LifecycleEvent): Promise<boolean>;
  createOutcome(outcome: ObservedOutcome): Promise<boolean>;
  setHealth(health: ScannerHealth): Promise<void>;
};

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

export function encodeFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return { doubleValue: value };
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeFirestoreValue) } };
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([key, nested]) => [key, encodeFirestoreValue(nested)]),
        ),
      },
    };
  }
  return { stringValue: String(value) };
}

export function decodeFirestoreValue(value: FirestoreValue | undefined): unknown {
  if (!value) return null;
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("doubleValue" in value) return value.doubleValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("stringValue" in value) return value.stringValue;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map((item) => decodeFirestoreValue(item));
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, nested]) => [key, decodeFirestoreValue(nested)]),
    );
  }
  return null;
}

export function toFirestoreFields(record: Record<string, unknown>): Record<string, FirestoreValue> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, encodeFirestoreValue(value)]));
}

export function fromFirestoreFields(fields: Record<string, FirestoreValue> | undefined): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

export function encodeDocumentId(id: string): string {
  return encodeURIComponent(id);
}

export function mergeOfficialSnapshots(local: OfficialStoreSnapshot, remote: OfficialStoreSnapshot): OfficialStoreSnapshot {
  const signals = new Map(local.signals.map((item) => [item.id, item]));
  for (const item of remote.signals) {
    const current = signals.get(item.id);
    if (!current) {
      signals.set(item.id, item);
      continue;
    }
    signals.set(item.id, {
      ...item,
      originalEntry: current.originalEntry,
      stop: current.stop,
      target: current.target,
      quantity: current.quantity,
      marginUSDT: current.marginUSDT,
      leverage: current.leverage,
      marginMode: current.marginMode,
      totalFeesUSDT: current.totalFeesUSDT,
      notionalUSDT: current.notionalUSDT,
      requiredMarginUSDT: current.requiredMarginUSDT,
      calculationVersion: current.calculationVersion,
      openedAt: current.openedAt,
      createdAt: current.createdAt,
      fillConfirmed: false,
      brokerageVerified: false,
      snapshotFrozen: true,
      lifecycleStatus: item.updatedAt >= current.updatedAt ? item.lifecycleStatus : current.lifecycleStatus,
      lastPrice: item.updatedAt >= current.updatedAt ? item.lastPrice : current.lastPrice,
      lastPriceAt: item.updatedAt >= current.updatedAt ? item.lastPriceAt : current.lastPriceAt,
      closedAt: item.updatedAt >= current.updatedAt ? item.closedAt : current.closedAt,
      observedTrigger: item.updatedAt >= current.updatedAt ? item.observedTrigger : current.observedTrigger,
      updatedAt: item.updatedAt >= current.updatedAt ? item.updatedAt : current.updatedAt,
    });
  }
  const events = new Map([...local.events, ...remote.events].map((item) => [item.id, item]));
  const outcomes = new Map([...local.outcomes, ...remote.outcomes].map((item) => [`${item.signalId}:${item.kind}`, item]));
  return {
    signals: [...signals.values()],
    events: [...events.values()],
    outcomes: [...outcomes.values()],
    health: remote.health?.updatedAt >= local.health.updatedAt ? remote.health : local.health,
  };
}

type ServiceAccount = FirebaseAdminAccount;

function readServiceAccount(): ServiceAccount | null {
  return readFirebaseAdminAccount();
}

let tokenCache: { value: string; exp: number } | null = null;

async function serviceAccountToken(account: ServiceAccount): Promise<string> {
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

export class MemoryOfficialRemote implements OfficialRemote {
  enabled = true as const;
  label: OfficialRemote["label"] = "firestore";
  signals = new Map<string, OfficialSignal>();
  events = new Map<string, LifecycleEvent>();
  outcomes = new Map<string, ObservedOutcome>();
  healthDoc: ScannerHealth | null = null;

  async listSignals() {
    return [...this.signals.values()];
  }
  async listEvents() {
    return [...this.events.values()];
  }
  async listOutcomes() {
    return [...this.outcomes.values()];
  }
  async getHealth() {
    return this.healthDoc;
  }
  async createSignal(record: OfficialSignal) {
    const existing = this.signals.get(record.id);
    if (existing) return existing;
    this.signals.set(record.id, record);
    return record;
  }
  async patchSignal(id: string, patch: Partial<OfficialSignal>) {
    const current = this.signals.get(id);
    if (!current) return;
    const next = { ...current };
    for (const key of MUTABLE_SIGNAL_KEYS) {
      if (key in patch) (next as Record<string, unknown>)[key] = patch[key];
    }
    next.fillConfirmed = false;
    next.brokerageVerified = false;
    this.signals.set(id, next);
  }
  async createEvent(event: LifecycleEvent) {
    if (this.events.has(event.id)) return false;
    this.events.set(event.id, event);
    return true;
  }
  async createOutcome(outcome: ObservedOutcome) {
    const key = `${outcome.signalId}:${outcome.kind}`;
    if ([...this.outcomes.values()].some((item) => `${item.signalId}:${item.kind}` === key)) return false;
    this.outcomes.set(key, outcome);
    return true;
  }
  async setHealth(health: ScannerHealth) {
    this.healthDoc = health;
  }
}

class FirestoreRestRemote implements OfficialRemote {
  enabled = true as const;
  label: OfficialRemote["label"] = "firestore";
  constructor(
    private projectId: string,
    private emulatorHost: string | undefined,
    private account: ServiceAccount | null,
  ) {}

  private base() {
    if (this.emulatorHost) {
      const host = this.emulatorHost.startsWith("http") ? this.emulatorHost : `http://${this.emulatorHost}`;
      return `${host}/v1/projects/${this.projectId}/databases/(default)/documents`;
    }
    return `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
  }

  private async headers() {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (!this.emulatorHost && this.account) {
      headers.Authorization = `Bearer ${await serviceAccountToken(this.account)}`;
    }
    return headers;
  }

  private async request(path: string, init?: RequestInit) {
    const response = await fetch(`${this.base()}${path}`, {
      ...init,
      headers: { ...(await this.headers()), ...(init?.headers || {}) },
    });
    return response;
  }

  private async listCollection<T>(collection: string): Promise<T[]> {
    const items: T[] = [];
    let pageToken = "";
    do {
      const query = new URLSearchParams({ pageSize: "300" });
      if (pageToken) query.set("pageToken", pageToken);
      const response = await this.request(`/${collection}?${query.toString()}`);
      if (response.status === 404) return items;
      if (!response.ok) throw new Error(`Firestore list ${collection} failed (${response.status})`);
      const body = (await response.json()) as {
        documents?: Array<{ fields?: Record<string, FirestoreValue> }>;
        nextPageToken?: string;
      };
      for (const doc of body.documents || []) {
        items.push(fromFirestoreFields(doc.fields) as T);
      }
      pageToken = body.nextPageToken || "";
    } while (pageToken);
    return items;
  }

  async listSignals() {
    return this.listCollection<OfficialSignal>(OFFICIAL_SIGNALS_COLLECTION);
  }
  async listEvents() {
    return this.listCollection<LifecycleEvent>(LIFECYCLE_EVENTS_COLLECTION);
  }
  async listOutcomes() {
    return this.listCollection<ObservedOutcome>(OBSERVED_OUTCOMES_COLLECTION);
  }
  async getHealth() {
    const response = await this.request(`/${SCANNER_HEALTH_COLLECTION}/${SCANNER_HEALTH_ID}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Firestore health read failed (${response.status})`);
    const body = (await response.json()) as { fields?: Record<string, FirestoreValue> };
    return fromFirestoreFields(body.fields) as ScannerHealth;
  }

  private async getDoc<T>(collection: string, id: string): Promise<T | null> {
    const response = await this.request(`/${collection}/${encodeDocumentId(id)}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Firestore get ${collection} failed (${response.status})`);
    const body = (await response.json()) as { fields?: Record<string, FirestoreValue> };
    return fromFirestoreFields(body.fields) as T;
  }

  private async putDoc(collection: string, id: string, record: Record<string, unknown>, updateMask?: string[]) {
    const query = new URLSearchParams();
    for (const field of updateMask || []) query.append("updateMask.fieldPaths", field);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await this.request(`/${collection}/${encodeDocumentId(id)}${suffix}`, {
      method: "PATCH",
      body: JSON.stringify({ fields: toFirestoreFields(record) }),
    });
    if (!response.ok) throw new Error(`Firestore write ${collection} failed (${response.status})`);
  }

  async createSignal(record: OfficialSignal) {
    const existing = await this.getDoc<OfficialSignal>(OFFICIAL_SIGNALS_COLLECTION, record.id);
    if (existing) return existing;
    const create = await this.request(`/${OFFICIAL_SIGNALS_COLLECTION}?documentId=${encodeDocumentId(record.id)}`, {
      method: "POST",
      body: JSON.stringify({ fields: toFirestoreFields(record as unknown as Record<string, unknown>) }),
    });
    if (create.status === 409) {
      const raced = await this.getDoc<OfficialSignal>(OFFICIAL_SIGNALS_COLLECTION, record.id);
      if (raced) return raced;
    }
    if (!create.ok) {
      await this.putDoc(OFFICIAL_SIGNALS_COLLECTION, record.id, record as unknown as Record<string, unknown>);
      const written = await this.getDoc<OfficialSignal>(OFFICIAL_SIGNALS_COLLECTION, record.id);
      if (written) return written;
      throw new Error(`Firestore create signal failed (${create.status})`);
    }
    return record;
  }

  async patchSignal(id: string, patch: Partial<OfficialSignal>) {
    const safe: Record<string, unknown> = {};
    for (const key of MUTABLE_SIGNAL_KEYS) {
      if (key in patch) safe[key] = patch[key];
    }
    safe.fillConfirmed = false;
    safe.brokerageVerified = false;
    await this.putDoc(OFFICIAL_SIGNALS_COLLECTION, id, safe, [...MUTABLE_SIGNAL_KEYS, "fillConfirmed", "brokerageVerified"]);
  }

  async createEvent(event: LifecycleEvent) {
    const existing = await this.getDoc<LifecycleEvent>(LIFECYCLE_EVENTS_COLLECTION, event.id);
    if (existing) return false;
    await this.putDoc(LIFECYCLE_EVENTS_COLLECTION, event.id, event as unknown as Record<string, unknown>);
    return true;
  }

  async createOutcome(outcome: ObservedOutcome) {
    const id = `${outcome.signalId}-${outcome.kind}`;
    const existing = await this.getDoc<ObservedOutcome>(OBSERVED_OUTCOMES_COLLECTION, id);
    if (existing) return false;
    await this.putDoc(OBSERVED_OUTCOMES_COLLECTION, id, outcome as unknown as Record<string, unknown>);
    return true;
  }

  async setHealth(health: ScannerHealth) {
    await this.putDoc(SCANNER_HEALTH_COLLECTION, SCANNER_HEALTH_ID, health as unknown as Record<string, unknown>);
  }
}

class FunctionOfficialRemote implements OfficialRemote {
  enabled = true as const;
  label: OfficialRemote["label"] = "function";
  constructor(
    private url: string,
    private secret: string,
  ) {}

  private async call<T>(body: Record<string, unknown>): Promise<T> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signals-monitor-secret": this.secret,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Official sync function failed (${response.status})`);
    return (await response.json()) as T;
  }

  async listSignals() {
    const body = await this.call<{ signals?: OfficialSignal[] }>({ op: "list" });
    return body.signals || [];
  }
  async listEvents() {
    const body = await this.call<{ events?: LifecycleEvent[] }>({ op: "list" });
    return body.events || [];
  }
  async listOutcomes() {
    const body = await this.call<{ outcomes?: ObservedOutcome[] }>({ op: "list" });
    return body.outcomes || [];
  }
  async getHealth() {
    const body = await this.call<{ health?: ScannerHealth | null }>({ op: "list" });
    return body.health || null;
  }
  async createSignal(record: OfficialSignal) {
    const body = await this.call<{ record: OfficialSignal }>({ op: "create", signal: record });
    return body.record;
  }
  async patchSignal(id: string, patch: Partial<OfficialSignal>) {
    await this.call({ op: "patch", id, patch });
  }
  async createEvent(event: LifecycleEvent) {
    const body = await this.call<{ created?: boolean }>({ op: "event", event });
    return Boolean(body.created);
  }
  async createOutcome(outcome: ObservedOutcome) {
    const body = await this.call<{ created?: boolean }>({ op: "outcome", outcome });
    return Boolean(body.created);
  }
  async setHealth(health: ScannerHealth) {
    await this.call({ op: "health", health });
  }
}

export function resolveOfficialRemote(): OfficialRemote | null {
  const projectId = process.env.FIREBASE_PROJECT_ID || "pippinway-e9719";
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  const account = readServiceAccount();
  if (emulatorHost || account) {
    return new FirestoreRestRemote(projectId, emulatorHost, account);
  }
  const syncUrl = process.env.SIGNALS_OFFICIAL_SYNC_URL;
  const secret = process.env.SIGNALS_MONITOR_SECRET;
  if (syncUrl && secret) {
    return new FunctionOfficialRemote(syncUrl, secret);
  }
  return null;
}

export async function loadRemoteSnapshot(remote: OfficialRemote): Promise<OfficialStoreSnapshot> {
  const [signals, events, outcomes, health] = await Promise.all([
    remote.listSignals(),
    remote.listEvents(),
    remote.listOutcomes(),
    remote.getHealth(),
  ]);
  return {
    signals,
    events,
    outcomes,
    health: health || emptyHealth("firestore"),
  };
}
