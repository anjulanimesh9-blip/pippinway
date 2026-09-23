import { createSign } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { firebaseConfig } from "@/app/firebase";
import {
  allowLocalBillingFallback,
  hasFirebaseAdminCredentials,
  readFirebaseAdminAccount,
} from "@/lib/signals/admin-credentials";
import { encodeFirestoreValue, fromFirestoreFields, toFirestoreFields } from "@/lib/signals/firestore-official";
import { DEFAULT_SUBSCRIPTION_DAYS, type SignalsConfig } from "./config";
import { applyPaymentDecision, normalizeTxRef, type SignalsPayment } from "./payments";
import { allowanceFromRecord, applyReveal, utcDate, type RevealRecord } from "./quota";
import { pickDailyFreeSignals, type DailyCandidate } from "./daily-set";

export { firebaseAdminStatus, hasFirebaseAdminCredentials } from "@/lib/signals/admin-credentials";
type StoreFile = {
  reveals: RevealRecord[];
  payments: SignalsPayment[];
  refs: Record<string, string>;
  receipts: Record<string, { mime: string; base64: string }>;
};

const g = globalThis as typeof globalThis & { __pipSignalsBilling?: StoreFile };
let writeQueue = Promise.resolve();

function memory(): StoreFile {
  if (!g.__pipSignalsBilling) g.__pipSignalsBilling = { reveals: [], payments: [], refs: {}, receipts: {} };
  return g.__pipSignalsBilling;
}

function filePath() {
  return path.join(process.cwd(), "data", "signals-billing.json");
}

async function loadFile(): Promise<StoreFile> {
  const current = memory();
  try {
    const raw = JSON.parse(await fs.readFile(filePath(), "utf8")) as StoreFile;
    current.reveals = raw.reveals || [];
    current.payments = raw.payments || [];
    current.refs = raw.refs || {};
    current.receipts = raw.receipts || {};
  } catch {
    // first run
  }
  return current;
}

async function saveFile(store: StoreFile) {
  await fs.mkdir(path.dirname(filePath()), { recursive: true });
  await fs.writeFile(filePath(), JSON.stringify({ ...store, receipts: store.receipts }, null, 2));
}

function queued<T>(work: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(work, work);
  writeQueue = next.then(() => undefined, () => undefined);
  return next;
}

function requireCloudBilling(operation: string) {
  if (hasFirebaseAdminCredentials()) return;
  if (!allowLocalBillingFallback()) {
    throw new Error(`Firebase Admin credentials are required for ${operation} in production. Set GOOGLE_APPLICATION_CREDENTIALS to the service-account JSON path outside this repo.`);
  }
}

export function billingBackend(): "firestore" | "local-file" {
  return hasFirebaseAdminCredentials() ? "firestore" : "local-file";
}

export type SignalsUserRow = {
  id: string;
  email?: string;
  signalsMembership?: string;
  signalsProExpiresAt?: string | null;
  signalsProStartedAt?: string | null;
};

function idFromDocumentName(name?: string) {
  if (!name) return "";
  const marker = "/documents/";
  const idx = name.indexOf(marker);
  const path = idx >= 0 ? name.slice(idx + marker.length) : name;
  const parts = path.split("/");
  return decodeURIComponent(parts[parts.length - 1] || "");
}

function userRow(id: string, data: Record<string, unknown>): SignalsUserRow {
  return {
    id,
    email: typeof data.email === "string" ? data.email : undefined,
    signalsMembership: data.signalsMembership === "pro" ? "pro" : "free",
    signalsProExpiresAt: typeof data.signalsProExpiresAt === "string" ? data.signalsProExpiresAt : null,
    signalsProStartedAt: typeof data.signalsProStartedAt === "string" ? data.signalsProStartedAt : null,
  };
}

let tokenCache: { value: string; exp: number } | null = null;
async function googleToken(scopes: string[]): Promise<string | null> {
  const account = readFirebaseAdminAccount();
  if (!account) return null;
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.exp - 60 > now) return tokenCache.value;
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(JSON.stringify({
    iss: account.client_email,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })).toString("base64url");
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${signer.sign(account.private_key, "base64url")}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!response.ok) throw new Error(`Firebase Admin token exchange failed (${response.status}).`);
  const body = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) throw new Error("Firebase Admin token exchange returned no access token.");
  tokenCache = { value: body.access_token, exp: now + (body.expires_in || 3600) };
  return body.access_token;
}

function firestoreBase() {
  return `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
}

async function firestoreGet(docPath: string): Promise<Record<string, unknown> | null> {
  const token = await googleToken(["https://www.googleapis.com/auth/datastore"]);
  if (!token) return null;
  const response = await fetch(`${firestoreBase()}/${docPath}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Firestore read failed (${response.status})`);
  const body = (await response.json()) as { fields?: Record<string, { stringValue?: string }> };
  return fromFirestoreFields(body.fields as never);
}

async function firestoreSet(docPath: string, record: Record<string, unknown>) {
  const token = await googleToken(["https://www.googleapis.com/auth/datastore"]);
  if (!token) return false;
  const response = await fetch(`${firestoreBase()}/${docPath}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: toFirestoreFields(record) }),
  });
  return response.ok;
}

async function firestoreList(collection: string): Promise<Record<string, unknown>[]> {
  const token = await googleToken(["https://www.googleapis.com/auth/datastore"]);
  if (!token) return [];
  const items: Record<string, unknown>[] = [];
  let pageToken = "";
  do {
    const query = new URLSearchParams({ pageSize: "200" });
    if (pageToken) query.set("pageToken", pageToken);
    const response = await fetch(`${firestoreBase()}/${collection}?${query}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (response.status === 404) return items;
    if (!response.ok) throw new Error(`Firestore list failed (${response.status})`);
    const body = (await response.json()) as { documents?: Array<{ fields?: Record<string, unknown> }>; nextPageToken?: string };
    for (const doc of body.documents || []) items.push(fromFirestoreFields(doc.fields as never));
    pageToken = body.nextPageToken || "";
  } while (pageToken);
  return items;
}

async function firestoreCommit(writes: Array<Record<string, unknown>>) {
  const token = await googleToken(["https://www.googleapis.com/auth/datastore"]);
  if (!token) return false;
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents:commit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ writes }),
  });
  return response.ok;
}

function asRevealRecord(uid: string, date: string, data: Record<string, unknown>): RevealRecord {
  return {
    uid,
    date,
    symbols: Array.isArray(data.symbols) ? (data.symbols as string[]) : [],
    dailySet: Array.isArray(data.dailySet) ? (data.dailySet as string[]) : undefined,
    updatedAt: String(data.updatedAt || ""),
  };
}

export async function getRevealRecord(uid: string): Promise<RevealRecord | null> {
  const date = utcDate();
  const remote = await firestoreGet(`users/${uid}/signalsReveals/${date}`).catch(() => null);
  if (remote && (Array.isArray(remote.symbols) || Array.isArray(remote.dailySet))) {
    return asRevealRecord(uid, date, remote);
  }
  const store = await loadFile();
  return store.reveals.find((item) => item.uid === uid && item.date === date) || null;
}

export async function freezeDailySet(
  uid: string,
  candidates: DailyCandidate[],
  limit: number,
  ready: boolean,
) {
  return queued(async () => {
    const current = await getRevealRecord(uid);
    const date = utcDate();
    const alreadyFrozen = Boolean(current && current.date === date && Array.isArray(current.dailySet));
    let dailySet: string[] = [];
    let frozen = alreadyFrozen;
    if (alreadyFrozen) {
      dailySet = (current?.dailySet || []).slice(0, limit);
      return {
        dailySet,
        frozen: true,
        record: current!,
        allowance: allowanceFromRecord(current!, limit),
      };
    } else if (current && current.date === date && current.symbols.length) {
      dailySet = pickDailyFreeSignals(candidates, current.symbols, limit);
      frozen = true;
    } else if (ready) {
      dailySet = pickDailyFreeSignals(candidates, [], limit);
      frozen = true;
    }

    let record: RevealRecord = current && current.date === date
      ? current
      : { uid, date, symbols: [], updatedAt: new Date().toISOString() };
    if (frozen) {
      for (const symbol of dailySet) {
        record = applyReveal(record, uid, symbol, limit).record;
      }
      record = { ...record, dailySet, date, uid };
      await firestoreSet(`users/${uid}/signalsReveals/${date}`, record);
      const store = await loadFile();
      store.reveals = store.reveals.filter((item) => !(item.uid === uid && item.date === date));
      store.reveals.push(record);
      await saveFile(store);
    }
    return {
      dailySet,
      frozen,
      record,
      allowance: allowanceFromRecord(record, limit),
    };
  });
}

export async function revealSymbol(uid: string, symbol: string, limit: number) {
  return queued(async () => {
    const current = await getRevealRecord(uid);
    const result = applyReveal(current, uid, symbol, limit);
    if (result.allowed && result.consumed) {
      await firestoreSet(`users/${uid}/signalsReveals/${result.record.date}`, result.record);
      const store = await loadFile();
      store.reveals = store.reveals.filter((item) => !(item.uid === uid && item.date === result.record.date));
      store.reveals.push(result.record);
      await saveFile(store);
    }
    return result;
  });
}

export async function saveReceipt(pathName: string, bytes: Uint8Array, mime: string): Promise<string> {
  requireCloudBilling("receipt uploads");
  const token = await googleToken(["https://www.googleapis.com/auth/devstorage.full_control", "https://www.googleapis.com/auth/cloud-platform"]);
  if (token) {
    const bucket = firebaseConfig.storageBucket;
    const encoded = encodeURIComponent(pathName);
    const response = await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encoded}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": mime },
      body: Buffer.from(bytes),
    });
    if (!response.ok) throw new Error(`Failed to store receipt in Firebase Storage (${response.status}).`);
    return pathName;
  }
  const store = await loadFile();
  store.receipts[pathName] = { mime, base64: Buffer.from(bytes).toString("base64") };
  await saveFile(store);
  return pathName;
}

export async function readReceipt(pathName: string): Promise<{ mime: string; bytes: Buffer } | null> {
  const token = await googleToken(["https://www.googleapis.com/auth/devstorage.full_control", "https://www.googleapis.com/auth/cloud-platform"]);
  if (token) {
    const bucket = firebaseConfig.storageBucket;
    const response = await fetch(`https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(pathName)}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      return { mime: response.headers.get("content-type") || "application/octet-stream", bytes: Buffer.from(await response.arrayBuffer()) };
    }
  }
  const store = await loadFile();
  const local = store.receipts[pathName];
  if (!local) return null;
  return { mime: local.mime, bytes: Buffer.from(local.base64, "base64") };
}

export async function createPayment(payment: SignalsPayment) {
  requireCloudBilling("EcoCash payments");
  if (hasFirebaseAdminCredentials()) {
    const ok = await firestoreSet(`signalsPayments/${payment.id}`, payment);
    if (!ok) throw new Error("Failed to persist EcoCash payment to Firestore.");
    return payment;
  }
  const store = await loadFile();
  store.payments.push(payment);
  await saveFile(store);
  return payment;
}

export async function listPayments(uid?: string): Promise<SignalsPayment[]> {
  requireCloudBilling("EcoCash payment listing");
  if (hasFirebaseAdminCredentials()) {
    const remote = await firestoreList("signalsPayments");
    const all = (remote as SignalsPayment[])
      .filter((item) => Boolean(item?.id))
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    return uid ? all.filter((item) => item.uid === uid) : all;
  }
  const store = await loadFile();
  const all = store.payments.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return uid ? all.filter((item) => item.uid === uid) : all;
}

export async function getPayment(id: string): Promise<SignalsPayment | null> {
  requireCloudBilling("EcoCash payment reads");
  if (hasFirebaseAdminCredentials()) {
    const remote = await firestoreGet(`signalsPayments/${id}`);
    return remote?.id ? remote as SignalsPayment : null;
  }
  const store = await loadFile();
  return store.payments.find((item) => item.id === id) || null;
}

export async function decidePayment(input: {
  paymentId: string;
  action: "APPROVE" | "REJECT" | "REQUEST_REVIEW";
  adminUid: string;
  adminEmail?: string;
  adminNote?: string;
  config: SignalsConfig;
}) {
  return queued(async () => {
    const payment = await getPayment(input.paymentId);
    if (!payment) return { error: "Payment request not found.", status: 404 as const };
    const store = allowLocalBillingFallback() ? await loadFile() : null;
    const ref = normalizeTxRef(payment.transactionRef);
    const remoteRef = hasFirebaseAdminCredentials()
      ? await firestoreGet(`signalsPaymentRefs/${ref}`).catch(() => null)
      : null;
    const existingId = typeof remoteRef?.paymentId === "string" ? remoteRef.paymentId : store?.refs[ref];
    const alreadyApprovedRef = Boolean(existingId && existingId !== payment.id);
    const result = applyPaymentDecision({
      payment,
      action: input.action,
      adminUid: input.adminUid,
      adminEmail: input.adminEmail,
      adminNote: input.adminNote,
      subscriptionDays: input.config.subscriptionDays || DEFAULT_SUBSCRIPTION_DAYS,
      alreadyApprovedRef,
    });
    if (result.error) return { error: result.error, status: 409 as const };
    if (result.activate && !result.idempotent) {
      if (store) store.refs[ref] = payment.id;
      if (hasFirebaseAdminCredentials()) {
        const ok = await firestoreCommit([
          {
            update: {
              name: `projects/${firebaseConfig.projectId}/databases/(default)/documents/signalsPayments/${payment.id}`,
              fields: toFirestoreFields(result.payment),
            },
          },
          {
            update: {
              name: `projects/${firebaseConfig.projectId}/databases/(default)/documents/signalsPaymentRefs/${ref}`,
              fields: toFirestoreFields({ paymentId: payment.id, uid: payment.uid, approvedAt: result.payment.decisionAt }),
            },
          },
          {
            update: {
              name: `projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${payment.uid}`,
              fields: {
                signalsMembership: encodeFirestoreValue("pro"),
                signalsProStartedAt: encodeFirestoreValue(result.payment.subscriptionStart),
                signalsProExpiresAt: encodeFirestoreValue(result.payment.subscriptionExpires),
                signalsProPaymentId: encodeFirestoreValue(payment.id),
              },
            },
            updateMask: { fieldPaths: ["signalsMembership", "signalsProStartedAt", "signalsProExpiresAt", "signalsProPaymentId"] },
          },
        ]);
        if (!ok) throw new Error("Failed to persist payment decision to Firestore.");
      } else {
        requireCloudBilling("payment decisions");
      }
    } else if (hasFirebaseAdminCredentials()) {
      const ok = await firestoreSet(`signalsPayments/${payment.id}`, result.payment);
      if (!ok) throw new Error("Failed to persist payment decision to Firestore.");
    } else {
      requireCloudBilling("payment decisions");
    }
    if (store) {
      store.payments = store.payments.map((item) => (item.id === payment.id ? result.payment : item));
      await saveFile(store);
    }
    return { payment: result.payment, activate: result.activate, idempotent: result.idempotent };
  });
}

async function firestorePatchWithToken(
  token: string,
  docPath: string,
  record: Record<string, unknown>,
  fieldPaths: string[],
) {
  const query = new URLSearchParams();
  for (const field of fieldPaths) query.append("updateMask.fieldPaths", field);
  if (!hasFirebaseAdminCredentials()) query.set("key", firebaseConfig.apiKey);
  const response = await fetch(`${firestoreBase()}/${docPath}?${query}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: toFirestoreFields(record) }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Firestore write denied for ${docPath} (${response.status}).${detail ? ` ${detail.slice(0, 240)}` : ""}`);
  }
}

async function firestoreGetWithUserToken(token: string, docPath: string): Promise<Record<string, unknown> | null> {
  const response = await fetch(`${firestoreBase()}/${docPath}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Firestore read failed for ${docPath} (${response.status})`);
  const body = (await response.json()) as { fields?: Record<string, unknown> };
  return fromFirestoreFields(body.fields as never);
}

async function firestoreListUsersAdmin(): Promise<SignalsUserRow[] | null> {
  const token = await googleToken(["https://www.googleapis.com/auth/datastore"]);
  if (!token) return null;
  const items: SignalsUserRow[] = [];
  let pageToken = "";
  do {
    const query = new URLSearchParams({ pageSize: "200" });
    if (pageToken) query.set("pageToken", pageToken);
    const response = await fetch(`${firestoreBase()}/users?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (response.status === 404) return items;
    if (!response.ok) throw new Error(`Firestore list failed for /users (${response.status})`);
    const body = (await response.json()) as {
      documents?: Array<{ name?: string; fields?: Record<string, unknown> }>;
      nextPageToken?: string;
    };
    for (const doc of body.documents || []) {
      const id = idFromDocumentName(doc.name);
      if (!id) continue;
      items.push(userRow(id, fromFirestoreFields(doc.fields as never)));
    }
    pageToken = body.nextPageToken || "";
  } while (pageToken && items.length < 800);
  return items;
}

export async function listSignalsUsers(adminToken: string, extraUids: string[] = []): Promise<{
  users: SignalsUserRow[];
  error?: string;
  backend: "firestore-admin" | "admin-token-subset";
}> {
  try {
    const listed = await firestoreListUsersAdmin();
    if (listed) return { users: listed, backend: "firestore-admin" };
  } catch (error) {
    return {
      users: [],
      backend: "admin-token-subset",
      error: error instanceof Error ? error.message : "Failed to list /users with the service account.",
    };
  }

  const uids = [...new Set(extraUids.filter(Boolean))];
  const users: SignalsUserRow[] = [];
  let failed = 0;
  for (const uid of uids) {
    try {
      const data = await firestoreGetWithUserToken(adminToken, `users/${encodeURIComponent(uid)}`);
      users.push(data ? userRow(uid, data) : { id: uid, signalsMembership: "free" });
    } catch {
      failed += 1;
    }
  }
  return {
    users,
    backend: "admin-token-subset",
    error: `Firebase Admin credentials are required to list the full /users collection. Set GOOGLE_APPLICATION_CREDENTIALS to the service-account JSON path outside this repo. Showing ${users.length} admin/payment account(s) loaded with the signed-in admin token.${failed ? ` ${failed} document(s) failed.` : ""}`,
  };
}

export async function saveSignalsConfigDoc(_adminToken: string, config: SignalsConfig) {
  if (!hasFirebaseAdminCredentials()) {
    throw new Error("Firebase Admin credentials are required to save Signals settings.");
  }
  const record = { ...config };
  const ok = await firestoreSet("siteSettings/signals", record);
  if (!ok) throw new Error("Failed to save Signals settings to Firestore.");
  return record;
}

export async function setSignalsUserPlan(
  _adminToken: string,
  userId: string,
  plan: "free" | "pro",
  days: number,
) {
  if (!userId || /[/?#]/.test(userId)) throw new Error("Invalid user id.");
  if (!hasFirebaseAdminCredentials()) {
    throw new Error("Firebase Admin credentials are required to update membership.");
  }
  const saToken = await googleToken(["https://www.googleapis.com/auth/datastore"]);
  const token = saToken;
  if (!token) throw new Error("Firebase Admin token was not issued.");
  const now = new Date();
  const expires = new Date(now.getTime() + Math.max(1, days) * 86_400_000);
  const record = plan === "pro"
    ? {
        signalsMembership: "pro",
        signalsProStartedAt: now.toISOString(),
        signalsProExpiresAt: expires.toISOString(),
        signalsProPaymentId: "admin-grant",
      }
    : {
        signalsMembership: "free",
        signalsProStartedAt: null,
        signalsProExpiresAt: null,
        signalsProPaymentId: null,
      };
  await firestorePatchWithToken(
    token,
    `users/${encodeURIComponent(userId)}`,
    record,
    ["signalsMembership", "signalsProStartedAt", "signalsProExpiresAt", "signalsProPaymentId"],
  );
  return record;
}

export function resetBillingStoreForTests() {
  g.__pipSignalsBilling = { reveals: [], payments: [], refs: {}, receipts: {} };
}
