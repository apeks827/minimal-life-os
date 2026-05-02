import { describe, expect, it } from "vitest";
import { PayloadTooLargeError, rateLimit, readJsonWithLimit } from "./http-guards";

describe("http guards", () => {
  it("limits repeated requests within a window", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    expect(rateLimit(key, 1, 1_000)).toEqual({ ok: true });
    expect(rateLimit(key, 1, 1_000)).toMatchObject({ ok: false });
  });

  it("rejects oversized json payloads", async () => {
    await expect(readJsonWithLimit(new Request("http://test", { method: "POST", body: JSON.stringify({ text: "12345" }) }), 4)).rejects.toBeInstanceOf(PayloadTooLargeError);
  });
});
