import { existsSync, readFileSync } from "fs";
import path from "path";

export type FirebaseAdminAccount = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

export type FirebaseAdminSource =
  | "none"
  | "FIREBASE_SERVICE_ACCOUNT_JSON"
  | "GOOGLE_APPLICATION_CREDENTIALS"
  | "FIREBASE_SERVICE_ACCOUNT_FILE"
  | "default-local-path";

export type FirebaseAdminStatus = {
  configured: boolean;
  source: FirebaseAdminSource;
  projectId: string | null;
  expectedPath: string;
  filePresent: boolean;
};

type LoadedAdmin = {
  account: FirebaseAdminAccount | null;
  source: FirebaseAdminSource;
};

let cached: LoadedAdmin | null = null;

function isTestEnv() {
  return process.env.VITEST === "true" || process.env.NODE_ENV === "test";
}

export function defaultFirebaseAdminPath() {
  const base = process.env.LOCALAPPDATA || process.env.HOME || "";
  if (!base) return "";
  return path.join(base, "pippinway", "firebase-adminsdk.json");
}

function looksLikeJsonObject(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("{") && trimmed.endsWith("}");
}

function parseAccount(raw: string): FirebaseAdminAccount | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const client_email = typeof parsed.client_email === "string" ? parsed.client_email.trim() : "";
    const private_key = typeof parsed.private_key === "string"
      ? parsed.private_key.replace(/\\n/g, "\n")
      : "";
    if (!client_email || !private_key.includes("PRIVATE KEY")) return null;
    return {
      client_email,
      private_key,
      project_id: typeof parsed.project_id === "string" ? parsed.project_id : undefined,
    };
  } catch {
    return null;
  }
}

function readAccountFile(filePath: string): FirebaseAdminAccount | null {
  if (!filePath || !existsSync(filePath)) return null;
  try {
    return parseAccount(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function configuredPath() {
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() || "";
  if (jsonEnv && !looksLikeJsonObject(jsonEnv)) return jsonEnv;
  return (
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() ||
    process.env.FIREBASE_SERVICE_ACCOUNT_FILE?.trim() ||
    defaultFirebaseAdminPath()
  );
}

function loadFirebaseAdmin(): LoadedAdmin {
  if (cached?.account) return cached;

  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() || "";
  if (jsonEnv) {
    const account = looksLikeJsonObject(jsonEnv) ? parseAccount(jsonEnv) : readAccountFile(jsonEnv);
    const loaded = { account, source: account ? "FIREBASE_SERVICE_ACCOUNT_JSON" as const : "none" as const };
    if (account) cached = loaded;
    return loaded;
  }

  const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() || "";
  if (gac) {
    const account = readAccountFile(gac);
    const loaded = { account, source: account ? "GOOGLE_APPLICATION_CREDENTIALS" as const : "none" as const };
    if (account) cached = loaded;
    return loaded;
  }

  const explicit = process.env.FIREBASE_SERVICE_ACCOUNT_FILE?.trim() || "";
  if (explicit) {
    const account = readAccountFile(explicit);
    const loaded = { account, source: account ? "FIREBASE_SERVICE_ACCOUNT_FILE" as const : "none" as const };
    if (account) cached = loaded;
    return loaded;
  }

  if (!isTestEnv()) {
    const fallback = defaultFirebaseAdminPath();
    const account = readAccountFile(fallback);
    if (account) {
      cached = { account, source: "default-local-path" };
      return cached;
    }
  }

  return { account: null, source: "none" };
}

export function resetFirebaseAdminCredentialsForTests() {
  cached = null;
}

export function readFirebaseAdminAccount(): FirebaseAdminAccount | null {
  return loadFirebaseAdmin().account;
}

export function hasFirebaseAdminCredentials() {
  return Boolean(readFirebaseAdminAccount());
}

export function firebaseAdminStatus(): FirebaseAdminStatus {
  const loaded = loadFirebaseAdmin();
  const expectedPath = configuredPath();
  return {
    configured: Boolean(loaded.account),
    source: loaded.source,
    projectId: loaded.account?.project_id || null,
    expectedPath,
    filePresent: Boolean(expectedPath && existsSync(expectedPath)),
  };
}

export function allowLocalBillingFallback() {
  return process.env.NODE_ENV !== "production";
}
