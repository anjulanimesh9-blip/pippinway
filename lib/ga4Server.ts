import { createSign } from "crypto";

const ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CUSTOM_EVENTS = [
  "view_listing",
  "contact_seller",
  "click_featured_listing",
  "post_listing",
  "sign_up",
  "login",
  "search",
  "select_category",
] as const;

export type Ga4WindowMetrics = {
  activeUsers: number | null;
  sessions: number | null;
  pageViews: number | null;
};

export type Ga4Report = {
  connected: boolean;
  reason?: string;
  windows?: {
    today: Ga4WindowMetrics;
    days7: Ga4WindowMetrics;
    days30: Ga4WindowMetrics;
  };
  events30d?: Record<string, number>;
};

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

type CredentialSource = "base64" | "legacy" | "none";

type FailStage =
  | "base64_decode"
  | "json_parse"
  | "credential_validation"
  | "google_auth"
  | "ga4_data_api";

type Base64Diagnostics = {
  rawLength: number;
  strippedQuotes: boolean;
  hadInternalWhitespace: boolean;
  looksLikeJsonObject: boolean;
  decodedStartsWithBrace?: boolean;
  decodedEndsWithBrace?: boolean;
};

type ReadAccountResult =
  | {
      account: ServiceAccount;
      source: CredentialSource;
      diagnostics?: Base64Diagnostics;
    }
  | {
      account: null;
      source: CredentialSource;
      failStage?: FailStage;
      diagnostics?: Base64Diagnostics;
    };

type Ga4FailError = Error & { code?: string; stage?: FailStage };

const GENERIC_REASON = "Analytics connection required";
const INVALID_BASE64_REASON = "GA4 Base64 credentials are invalid";
const MISSING_PROPERTY_REASON = "GA4_PROPERTY_ID is missing";
const AUTH_REASON = "GA4 Google authentication failed";
const DATA_API_REASON = "GA4 Data API request failed";

function stripWrappingQuotes(value: string): string {
  let result = value.trim();
  for (let i = 0; i < 4 && result.length >= 2; i++) {
    const first = result[0];
    const last = result[result.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      result = result.slice(1, -1).trim();
      continue;
    }
    break;
  }
  return result;
}

function unescapePemNewlines(value: string): string {
  let key = value;
  for (let i = 0; i < 4; i++) {
    if (!key.includes("\\n") && !key.includes("\\r")) break;
    if (key.includes("\\\\n") || key.includes("\\\\r")) {
      key = key.replace(/\\\\r\\\\n/g, "\\r\\n").replace(/\\\\n/g, "\\n").replace(/\\\\r/g, "\\r");
    } else {
      key = key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n");
    }
  }
  return key.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function extractPrivateKeyFromJsonBlob(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.includes("private_key")) return null;
  try {
    const parsed = JSON.parse(trimmed) as { private_key?: unknown };
    return typeof parsed.private_key === "string" ? parsed.private_key : null;
  } catch {
    return null;
  }
}

/** Normalize a Vercel/env PEM. Does not re-wrap or rewrite the base64 body. */
function normalizePrivateKey(raw: string): string {
  let key = stripWrappingQuotes(raw);
  const fromJson = extractPrivateKeyFromJsonBlob(key);
  if (fromJson) {
    key = stripWrappingQuotes(fromJson);
  }
  return unescapePemNewlines(key).trim();
}

function isPemPrivateKey(key: string): boolean {
  const markers = [
    ["-----BEGIN PRIVATE KEY-----", "-----END PRIVATE KEY-----"],
    ["-----BEGIN RSA PRIVATE KEY-----", "-----END RSA PRIVATE KEY-----"],
  ] as const;
  return markers.some(([begin, end]) => {
    const start = key.indexOf(begin);
    const stop = key.indexOf(end);
    return start !== -1 && stop !== -1 && start < stop;
  });
}

function safeDiagnosticFields(
  diagnostics?: Base64Diagnostics
): Record<string, boolean | number> {
  if (!diagnostics) return {};
  const fields: Record<string, boolean | number> = {
    rawLength: diagnostics.rawLength,
    strippedQuotes: diagnostics.strippedQuotes,
    hadInternalWhitespace: diagnostics.hadInternalWhitespace,
    looksLikeJsonObject: diagnostics.looksLikeJsonObject,
  };
  if (typeof diagnostics.decodedStartsWithBrace === "boolean") {
    fields.decodedStartsWithBrace = diagnostics.decodedStartsWithBrace;
  }
  if (typeof diagnostics.decodedEndsWithBrace === "boolean") {
    fields.decodedEndsWithBrace = diagnostics.decodedEndsWithBrace;
  }
  return fields;
}

function logCredentialDiagnostic(
  source: CredentialSource,
  diagnostics?: Base64Diagnostics
): void {
  console.info("GA4 credentials", {
    hasBase64: Boolean(process.env.GA4_SERVICE_ACCOUNT_BASE64),
    hasLegacyEmail: Boolean(process.env.GA4_CLIENT_EMAIL),
    hasLegacyPrivateKey: Boolean(process.env.GA4_PRIVATE_KEY),
    credentialSource: source,
    ...safeDiagnosticFields(diagnostics),
  });
}

function logGa4Stage(stage: FailStage, diagnostics?: Base64Diagnostics): void {
  console.error("GA4 fetch failed", {
    stage,
    ...safeDiagnosticFields(diagnostics),
  });
}

function stripSingleWrappingQuotes(value: string): {
  value: string;
  strippedQuotes: boolean;
} {
  if (value.length < 2) return { value, strippedQuotes: false };
  const first = value[0];
  const last = value[value.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return { value: value.slice(1, -1).trim(), strippedQuotes: true };
  }
  return { value, strippedQuotes: false };
}

function stripDataBase64Prefix(value: string): string {
  const match = /^data:[^;]*;base64,/i.exec(value);
  return match ? value.slice(match[0].length) : value;
}

function decodeUtf8FromBase64(payload: string): string | null {
  const compact = payload.replace(/[\t\n\r ]/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!compact) return null;

  const withoutPad = compact.replace(/=+$/, "");
  if (!/^[A-Za-z0-9+/]+$/.test(withoutPad)) return null;
  if (withoutPad.length % 4 === 1) return null;

  const rem = withoutPad.length % 4;
  const padded = rem === 0 ? withoutPad : withoutPad + "=".repeat(4 - rem);
  const buf = Buffer.from(padded, "base64");
  if (buf.length === 0) return null;
  return buf.toString("utf8");
}

type Base64ReadResult =
  | { ok: true; account: ServiceAccount; diagnostics: Base64Diagnostics }
  | { ok: false; stage: FailStage; diagnostics: Base64Diagnostics };

function readBase64ServiceAccount(
  encoded: string,
  rawLength: number
): Base64ReadResult {
  const quoted = stripSingleWrappingQuotes(encoded);
  const prepared = quoted.value;
  const looksLikeJsonObject = prepared.startsWith("{");
  const isRawJsonObject = looksLikeJsonObject && prepared.endsWith("}");

  let jsonText: string;
  let hadInternalWhitespace = false;
  let decodedStartsWithBrace: boolean | undefined;
  let decodedEndsWithBrace: boolean | undefined;

  if (isRawJsonObject) {
    jsonText = prepared;
    decodedStartsWithBrace = true;
    decodedEndsWithBrace = true;
  } else {
    const payload = stripDataBase64Prefix(prepared);
    hadInternalWhitespace = /[\t\n\r ]/.test(payload);
    const decoded = decodeUtf8FromBase64(payload);
    if (decoded === null) {
      return {
        ok: false,
        stage: "base64_decode",
        diagnostics: {
          rawLength,
          strippedQuotes: quoted.strippedQuotes,
          hadInternalWhitespace,
          looksLikeJsonObject,
        },
      };
    }
    jsonText = decoded;
    decodedStartsWithBrace = decoded.startsWith("{");
    decodedEndsWithBrace = decoded.endsWith("}");
  }

  const diagnostics: Base64Diagnostics = {
    rawLength,
    strippedQuotes: quoted.strippedQuotes,
    hadInternalWhitespace,
    looksLikeJsonObject,
    decodedStartsWithBrace,
    decodedEndsWithBrace,
  };

  let credentials: unknown;
  try {
    credentials = JSON.parse(jsonText);
  } catch {
    return { ok: false, stage: "json_parse", diagnostics };
  }

  if (!credentials || typeof credentials !== "object") {
    return { ok: false, stage: "credential_validation", diagnostics };
  }

  const obj = credentials as Record<string, unknown>;
  const client_email = typeof obj.client_email === "string" ? obj.client_email : "";
  const private_key = typeof obj.private_key === "string" ? obj.private_key : "";
  if (!client_email || !private_key || !isPemPrivateKey(private_key)) {
    return { ok: false, stage: "credential_validation", diagnostics };
  }

  // JSON.parse already turns escaped \n into real newlines — use fields directly.
  return { ok: true, account: { client_email, private_key }, diagnostics };
}

function readServiceAccount(): ReadAccountResult {
  const rawEnv = process.env.GA4_SERVICE_ACCOUNT_BASE64 ?? "";
  const encoded = rawEnv.trim();
  if (encoded) {
    const parsed = readBase64ServiceAccount(encoded, rawEnv.length);
    if (!parsed.ok) {
      return {
        account: null,
        source: "base64",
        failStage: parsed.stage,
        diagnostics: parsed.diagnostics,
      };
    }
    return {
      account: parsed.account,
      source: "base64",
      diagnostics: parsed.diagnostics,
    };
  }

  const email = stripWrappingQuotes(process.env.GA4_CLIENT_EMAIL ?? "");
  const key = process.env.GA4_PRIVATE_KEY;
  if (email && key) {
    return {
      account: {
        client_email: email,
        private_key: normalizePrivateKey(key),
      },
      source: "legacy",
    };
  }

  return { account: null, source: "none" };
}

export function getGa4PropertyId(): string | null {
  const raw = stripWrappingQuotes(process.env.GA4_PROPERTY_ID ?? "");
  if (!raw) return null;
  const id = raw.replace(/^properties\//, "");
  if (!/^\d+$/.test(id)) return null;
  return id;
}

export function getGa4ConnectionStatus(): { connected: false; reason: string } | {
  connected: true;
  propertyId: string;
  account: ServiceAccount;
  source: CredentialSource;
} {
  const propertyId = getGa4PropertyId();
  const result = readServiceAccount();
  logCredentialDiagnostic(result.source, result.diagnostics);

  if (!propertyId) {
    return { connected: false, reason: MISSING_PROPERTY_REASON };
  }

  if (!result.account) {
    if (result.source === "base64") {
      logGa4Stage(result.failStage ?? "credential_validation", result.diagnostics);
      return { connected: false, reason: INVALID_BASE64_REASON };
    }
    return { connected: false, reason: GENERIC_REASON };
  }

  if (result.source === "legacy" && !isPemPrivateKey(result.account.private_key)) {
    logGa4Stage("credential_validation");
    return { connected: false, reason: GENERIC_REASON };
  }

  return {
    connected: true,
    propertyId,
    account: result.account,
    source: result.source,
  };
}

function signServiceAccountJwt(account: ServiceAccount): string {
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({ alg: "RS256", typ: "JWT" })
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        iss: account.client_email,
        scope: ANALYTICS_SCOPE,
        aud: TOKEN_URL,
        iat: now,
        exp: now + 3600,
      })
    ).toString("base64url");
    const unsigned = `${header}.${payload}`;
    const signer = createSign("RSA-SHA256");
    signer.update(unsigned);
    signer.end();
    const signature = signer.sign(account.private_key, "base64url");
    return `${unsigned}.${signature}`;
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err && err.code != null
        ? String(err.code)
        : "SIGN_FAILED";
    throwGa4Error("google_auth", code, AUTH_REASON);
  }
}

function throwGa4Error(stage: FailStage, code: string, message: string): never {
  const err: Ga4FailError = new Error(message);
  err.code = code;
  err.stage = stage;
  throw err;
}

function logGa4Failure(err: unknown, source: CredentialSource): void {
  const stage: FailStage =
    err && typeof err === "object" && "stage" in err && err.stage != null
      ? (err.stage as FailStage)
      : "google_auth";
  const code =
    err && typeof err === "object" && "code" in err && err.code != null
      ? String(err.code)
      : undefined;
  console.error("GA4 fetch failed", {
    stage,
    code,
    credentialSource: source,
  });
}

function clientReasonForFailure(err: unknown): string {
  const stage =
    err && typeof err === "object" && "stage" in err ? err.stage : undefined;
  if (stage === "ga4_data_api") return DATA_API_REASON;
  return AUTH_REASON;
}

async function getAccessToken(account: ServiceAccount): Promise<string> {
  const assertion = signServiceAccountJwt(account);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throwGa4Error("google_auth", String(res.status), AUTH_REASON);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throwGa4Error("google_auth", "TOKEN_MISSING", AUTH_REASON);
  }
  return data.access_token;
}

function metricValue(
  row: { metricValues?: Array<{ value?: string }> } | undefined,
  index: number
): number | null {
  const raw = row?.metricValues?.[index]?.value;
  if (raw === undefined || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

async function runReport(
  propertyId: string,
  token: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    let code = String(res.status);
    try {
      const errBody = (await res.json()) as {
        error?: { status?: string };
      };
      if (errBody.error?.status) code = errBody.error.status;
    } catch {
      // Keep status-only code if the error body is not JSON.
    }
    throwGa4Error("ga4_data_api", code, DATA_API_REASON);
  }
  return res.json();
}

export async function fetchGa4Report(): Promise<Ga4Report> {
  const status = getGa4ConnectionStatus();
  if (!status.connected) {
    return { connected: false, reason: status.reason };
  }

  try {
    const token = await getAccessToken(status.account);

    const readWindow = async (
      startDate: string
    ): Promise<Ga4WindowMetrics> => {
      const report = (await runReport(status.propertyId, token, {
        dateRanges: [{ startDate, endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
      })) as {
        rows?: Array<{ metricValues?: Array<{ value?: string }> }>;
      };
      const row = report.rows?.[0];
      if (!row) {
        return { activeUsers: 0, sessions: 0, pageViews: 0 };
      }
      return {
        activeUsers: metricValue(row, 0),
        sessions: metricValue(row, 1),
        pageViews: metricValue(row, 2),
      };
    };

    const windows = {
      today: await readWindow("today"),
      days7: await readWindow("7daysAgo"),
      days30: await readWindow("30daysAgo"),
    };

    const eventsRaw = (await runReport(status.propertyId, token, {
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: { values: [...CUSTOM_EVENTS] },
        },
      },
    })) as {
      rows?: Array<{
        dimensionValues?: Array<{ value?: string }>;
        metricValues?: Array<{ value?: string }>;
      }>;
    };

    const events30d: Record<string, number> = {};
    for (const row of eventsRaw.rows ?? []) {
      const name = row.dimensionValues?.[0]?.value;
      const count = metricValue(row, 0);
      if (name && count !== null) events30d[name] = count;
    }

    return { connected: true, windows, events30d };
  } catch (err) {
    logGa4Failure(err, status.source);
    return {
      connected: false,
      reason: clientReasonForFailure(err),
    };
  }
}
