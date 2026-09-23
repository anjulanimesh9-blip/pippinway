import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const rules = readFileSync(path.join(process.cwd(), "firestore.rules"), "utf8");
const PROJECT = process.env.FIREBASE_PROJECT_ID || "pippinway-e9719";
const HOST = process.env.FIRESTORE_EMULATOR_HOST;

function emulatorUrl(collection: string, id: string) {
  return `http://${HOST}/v1/projects/${PROJECT}/databases/(default)/documents/${collection}/${encodeURIComponent(id)}`;
}

describe("Firestore official signal rules", () => {
  it("denies client writes to official signals and observed outcomes", () => {
    expect(rules).toContain("match /signalsOfficial/{id}");
    expect(rules).toContain("match /signalsLifecycleEvents/{id}");
    expect(rules).toContain("match /signalsObserved/{id}");
    expect(rules).toContain("match /signalsHealth/{id}");
    const officialBlock = rules.slice(rules.indexOf("match /signalsOfficial/{id}"));
    expect(officialBlock).toContain("allow create, update, delete: if false;");
    expect(rules).toContain("match /signalsPayments/{id}");
    expect(rules).toContain("match /signalsPaymentRefs/{id}");
    expect(rules).toContain("allow update, delete: if false;");
    expect(rules).toContain("signalsProExpiresAt");
  });

  it("keeps health reads admin-only", () => {
    const health = rules.slice(rules.indexOf("match /signalsHealth/{id}"));
    expect(health).toContain("allow read: if isAdmin()");
    expect(health).toContain("allow create, update, delete: if false;");
  });
});

describe("Firebase emulator official writes", () => {
  it("rejects unauthenticated official signal creates when the emulator is running", async () => {
    if (!HOST) {
      expect(process.env.FIRESTORE_EMULATOR_HOST || "").toBe("");
      return;
    }
    const response = await fetch(emulatorUrl("signalsOfficial", "emulator-deny-test"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          originalEntry: { doubleValue: 1 },
          fillConfirmed: { booleanValue: false },
        },
      }),
    });
    expect(response.ok).toBe(false);
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("rejects unauthenticated observed-outcome writes when the emulator is running", async () => {
    if (!HOST) {
      expect(process.env.FIRESTORE_EMULATOR_HOST || "").toBe("");
      return;
    }
    const response = await fetch(emulatorUrl("signalsObserved", "emulator-deny-outcome"), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          kind: { stringValue: "TARGET_HIT" },
          brokerageVerified: { booleanValue: false },
        },
      }),
    });
    expect(response.ok).toBe(false);
  });

  it("allows privileged backend writes with the emulator owner token", async () => {
    if (!HOST) {
      expect(process.env.FIRESTORE_EMULATOR_HOST || "").toBe("");
      return;
    }
    const response = await fetch(emulatorUrl("signalsOfficial", "emulator-backend-ok"), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer owner",
      },
      body: JSON.stringify({
        fields: {
          originalEntry: { doubleValue: 100 },
          fillConfirmed: { booleanValue: false },
          brokerageVerified: { booleanValue: false },
        },
      }),
    });
    expect(response.ok).toBe(true);
  });
});
