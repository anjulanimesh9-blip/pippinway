import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import {
  allowLocalBillingFallback,
  firebaseAdminStatus,
  hasFirebaseAdminCredentials,
  readFirebaseAdminAccount,
  resetFirebaseAdminCredentialsForTests,
} from "./admin-credentials";

const keys = [
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "GOOGLE_APPLICATION_CREDENTIALS",
  "FIREBASE_SERVICE_ACCOUNT_FILE",
  "NODE_ENV",
] as const;

const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
const env = process.env as Record<string, string | undefined>;

function setEnv(key: string, value: string | undefined) {
  if (value == null) delete env[key];
  else env[key] = value;
}

function writeAccount(filePath: string) {
  writeFileSync(filePath, JSON.stringify({
    type: "service_account",
    project_id: "pippinway-e9719",
    client_email: "admin-sdk@pippinway-e9719.iam.gserviceaccount.com",
    private_key: "-----BEGIN PRIVATE KEY-----\\nTESTKEY\\n-----END PRIVATE KEY-----\\n",
  }));
}

afterEach(() => {
  for (const key of keys) {
    setEnv(key, original[key]);
  }
  resetFirebaseAdminCredentialsForTests();
});

describe("Firebase Admin credential loading", () => {
  it("loads a JSON file from GOOGLE_APPLICATION_CREDENTIALS without exposing the key in status", () => {
    const filePath = path.join(mkdtempSync(path.join(tmpdir(), "pw-admin-")), "firebase-adminsdk.json");
    writeAccount(filePath);
    setEnv("GOOGLE_APPLICATION_CREDENTIALS", filePath);
    setEnv("FIREBASE_SERVICE_ACCOUNT_JSON", undefined);
    resetFirebaseAdminCredentialsForTests();

    const account = readFirebaseAdminAccount();
    const status = firebaseAdminStatus();
    expect(hasFirebaseAdminCredentials()).toBe(true);
    expect(account?.client_email).toContain("@pippinway-e9719.iam.gserviceaccount.com");
    expect(status.configured).toBe(true);
    expect(status.source).toBe("GOOGLE_APPLICATION_CREDENTIALS");
    expect(status.projectId).toBe("pippinway-e9719");
    expect(status.filePresent).toBe(true);
    expect(JSON.stringify(status)).not.toContain("PRIVATE KEY");
    expect(JSON.stringify(status)).not.toContain("TESTKEY");
  });

  it("treats FIREBASE_SERVICE_ACCOUNT_JSON as a file path when it is not raw JSON", () => {
    const filePath = path.join(mkdtempSync(path.join(tmpdir(), "pw-admin-")), "sa.json");
    writeAccount(filePath);
    setEnv("FIREBASE_SERVICE_ACCOUNT_JSON", filePath);
    resetFirebaseAdminCredentialsForTests();
    expect(firebaseAdminStatus().source).toBe("FIREBASE_SERVICE_ACCOUNT_JSON");
    expect(hasFirebaseAdminCredentials()).toBe(true);
  });

  it("disables the local billing fallback in production", () => {
    setEnv("NODE_ENV", "production");
    expect(allowLocalBillingFallback()).toBe(false);
    setEnv("NODE_ENV", "development");
    expect(allowLocalBillingFallback()).toBe(true);
  });
});
