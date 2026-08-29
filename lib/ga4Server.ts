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

function readServiceAccount(): ServiceAccount | null {
  const json = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    try {
      const parsed = JSON.parse(json) as Partial<ServiceAccount>;
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: parsed.private_key,
        };
      }
    } catch {
      return null;
    }
  }

  const email = process.env.GA4_CLIENT_EMAIL?.trim();
  const key = process.env.GA4_PRIVATE_KEY?.trim();
  if (!email || !key) return null;

  return {
    client_email: email,
    private_key: key.replace(/\\n/g, "\n"),
  };
}

export function getGa4PropertyId(): string | null {
  const raw = process.env.GA4_PROPERTY_ID?.trim() ?? "";
  if (!raw) return null;
  const id = raw.replace(/^properties\//, "");
  if (!/^\d+$/.test(id)) return null;
  return id;
}

export function getGa4ConnectionStatus(): { connected: false; reason: string } | {
  connected: true;
  propertyId: string;
  account: ServiceAccount;
} {
  const propertyId = getGa4PropertyId();
  const account = readServiceAccount();
  if (!propertyId || !account) {
    return {
      connected: false,
      reason: "Analytics connection required",
    };
  }
  return { connected: true, propertyId, account };
}

function signServiceAccountJwt(account: ServiceAccount): string {
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
    throw new Error("GA4 token exchange failed");
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("GA4 token missing");
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
    throw new Error(`GA4 report failed (${res.status})`);
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
  } catch {
    return {
      connected: false,
      reason: "Analytics connection required",
    };
  }
}
