import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { GET as adminGet, POST as adminPost } from "@/app/api/signals/admin/route";
import { GET as paymentsGet, POST as paymentsPost } from "@/app/api/signals/payments/admin/route";

function req(path: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(`http://localhost:3012${path}`, init);
}

describe("admin signals authorization", () => {
  it("rejects missing tokens for admin overview, settings, payments, and decisions", async () => {
    const overview = await adminGet(req("/api/signals/admin"));
    expect(overview.status).toBe(403);
    const save = await adminPost(req("/api/signals/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "saveConfig", config: { billingEnabled: true } }),
    }));
    expect(save.status).toBe(403);
    const grant = await adminPost(req("/api/signals/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setPlan", userId: "user-1", plan: "pro" }),
    }));
    expect(grant.status).toBe(403);
    const payments = await paymentsGet(req("/api/signals/payments/admin"));
    expect(payments.status).toBe(403);
    const approve = await paymentsPost(req("/api/signals/payments/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: "pay-1", action: "APPROVE", confirmReceived: true }),
    }));
    expect(approve.status).toBe(403);
  });
});
