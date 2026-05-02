import { afterEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const originalEnv = process.env;

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("POST /api/inbox/retry", () => {
  it("rejects invalid cron token", async () => {
    process.env = { ...originalEnv, CRON_SECRET: "secret" };
    const response = await POST(new Request("http://test", { method: "POST", headers: { authorization: "Bearer nope" } }));
    expect(response.status).toBe(401);
  });

  it("skips safely without AI provider", async () => {
    process.env = { ...originalEnv, OPENAI_API_KEY: "", AI_PROVIDER_API_KEY: "", CRON_SECRET: "" };
    const response = await POST(new Request("http://test", { method: "POST" }));
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toMatchObject({ processed: 0, failed: 0 });
  });
});
