import { describe, expect, it } from "vitest";
import { sniffImage, validateReceipt } from "./image";

describe("receipt image validation", () => {
  it("accepts JPEG magic bytes and rejects mismatched claims", () => {
    const jpeg = new Uint8Array(64);
    jpeg[0] = 0xff; jpeg[1] = 0xd8; jpeg[2] = 0xff;
    expect(sniffImage(jpeg)?.mime).toBe("image/jpeg");
    expect(validateReceipt(jpeg, "image/jpeg").ok).toBe(true);
    expect(validateReceipt(jpeg, "image/png").ok).toBe(false);
  });

  it("rejects tiny or unknown files", () => {
    expect(validateReceipt(new Uint8Array([1, 2, 3]), "image/jpeg").ok).toBe(false);
    const random = new Uint8Array(64);
    random.fill(7);
    expect(validateReceipt(random).ok).toBe(false);
  });
});
