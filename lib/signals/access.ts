import { firebaseConfig } from "@/app/firebase";
import {
  DEFAULT_SIGNALS_CONFIG,
  DEFAULT_SIGNALS_SETTINGS,
  clampSettings,
  sanitizeConfig,
  type SignalsConfig,
  type SignalsPlan,
  type SignalsUserSettings,
} from "@/lib/signals/config";

type LookupResponse = {
  users?: Array<{ localId?: string; email?: string }>;
};

function firestoreString(fields: Record<string, { stringValue?: string } | undefined>, key: string) {
  return fields[key]?.stringValue;
}

function firestoreNumber(fields: Record<string, { doubleValue?: number; integerValue?: string } | undefined>, key: string) {
  const field = fields[key];
  if (!field) return undefined;
  if (typeof field.doubleValue === "number") return field.doubleValue;
  if (field.integerValue != null) return Number(field.integerValue);
  return undefined;
}

function firestoreBool(fields: Record<string, { booleanValue?: boolean } | undefined>, key: string) {
  return fields[key]?.booleanValue;
}

function firestoreList(fields: Record<string, { arrayValue?: { values?: Array<{ stringValue?: string }> } } | undefined>, key: string) {
  return (fields[key]?.arrayValue?.values || []).map((item) => item.stringValue).filter((item): item is string => Boolean(item));
}

export async function lookupUid(token: string): Promise<{ uid: string; email?: string } | null> {
  const lookup = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    },
  );
  if (!lookup.ok) return null;
  const data = (await lookup.json()) as LookupResponse;
  const uid = data.users?.[0]?.localId;
  if (!uid) return null;
  return { uid, email: data.users?.[0]?.email };
}

export function readBearer(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

export async function getSignalsConfig(): Promise<SignalsConfig> {
  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/siteSettings/signals`,
      { cache: "no-store" },
    );
    if (!response.ok) return DEFAULT_SIGNALS_CONFIG;
    const doc = (await response.json()) as { fields?: Record<string, any> };
    const fields = doc.fields || {};
    return sanitizeConfig({
      betaMode: firestoreBool(fields, "betaMode"),
      billingEnabled: firestoreBool(fields, "billingEnabled"),
      proPriceMonthly: firestoreNumber(fields, "proPriceMonthly"),
      currency: firestoreString(fields, "currency"),
      freeSymbols: firestoreList(fields, "freeSymbols"),
      freeShowFullDetails: firestoreBool(fields, "freeShowFullDetails"),
      alertsEnabled: firestoreBool(fields, "alertsEnabled"),
      freeDailyReveals: firestoreNumber(fields, "freeDailyReveals"),
      subscriptionDays: firestoreNumber(fields, "subscriptionDays"),
      ecocashRecipientNumber: firestoreString(fields, "ecocashRecipientNumber"),
      ecocashRecipientName: firestoreString(fields, "ecocashRecipientName"),
      ecocashInstructions: firestoreString(fields, "ecocashInstructions"),
    });
  } catch {
    return DEFAULT_SIGNALS_CONFIG;
  }
}

export type SignalsAccess = {
  uid: string;
  email?: string;
  isAdmin: boolean;
  plan: SignalsPlan;
  settings: SignalsUserSettings;
  config: SignalsConfig;
  subscription: {
    membership: SignalsPlan;
    active: boolean;
    startedAt: string | null;
    expiresAt: string | null;
    expired: boolean;
    paymentId: string | null;
  };
};

export function resolvePlan(input: {
  isAdmin: boolean;
  membership?: string | null;
  expiresAt?: string | null;
  now?: number;
}): { plan: SignalsPlan; expired: boolean; active: boolean } {
  if (input.isAdmin) return { plan: "pro", expired: false, active: true };
  const expiresAt = input.expiresAt ? Date.parse(input.expiresAt) : NaN;
  const expired = Number.isFinite(expiresAt) && expiresAt <= (input.now ?? Date.now());
  const membership = input.membership === "pro";
  const active = membership && !expired;
  return { plan: active ? "pro" : "free", expired: membership && expired, active };
}

export async function getSignalsAccess(request: Request): Promise<SignalsAccess | null> {
  const token = readBearer(request);
  if (!token) return null;
  const identity = await lookupUid(token);
  if (!identity) return null;

  const [userDoc, config] = await Promise.all([
    fetch(
      `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${identity.uid}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    ),
    getSignalsConfig(),
  ]);

  let plan: SignalsPlan = "free";
  let isAdmin = false;
  let settings = DEFAULT_SIGNALS_SETTINGS;
  let subscription = {
    membership: "free" as SignalsPlan,
    active: false,
    startedAt: null as string | null,
    expiresAt: null as string | null,
    expired: false,
    paymentId: null as string | null,
  };
  if (userDoc.ok) {
    const doc = (await userDoc.json()) as { fields?: Record<string, any> };
    const fields = doc.fields || {};
    isAdmin = firestoreString(fields, "role") === "admin" || identity.email === "anjulanimesh9@gmail.com";
    const membership = firestoreString(fields, "signalsMembership") === "pro" ? "pro" : "free";
    const expiresAt = firestoreString(fields, "signalsProExpiresAt") || null;
    const startedAt = firestoreString(fields, "signalsProStartedAt") || null;
    const resolved = resolvePlan({ isAdmin, membership, expiresAt });
    plan = resolved.plan;
    subscription = {
      membership,
      active: resolved.active,
      startedAt,
      expiresAt,
      expired: resolved.expired,
      paymentId: firestoreString(fields, "signalsProPaymentId") || null,
    };
    const settingsMap = fields.signalsSettings?.mapValue?.fields as Record<string, any> | undefined;
    if (settingsMap) {
      settings = clampSettings({
        marginUSDT: firestoreNumber(settingsMap, "marginUSDT"),
        leverage: firestoreNumber(settingsMap, "leverage"),
        marginMode: firestoreString(settingsMap, "marginMode") === "CROSS" ? "CROSS" : "ISOLATED",
        scanMode: firestoreString(settingsMap, "scanMode") as SignalsUserSettings["scanMode"],
        watchlist: firestoreList(settingsMap, "watchlist"),
      });
    }
  }

  return { uid: identity.uid, email: identity.email, isAdmin, plan, settings, config, subscription };
}
