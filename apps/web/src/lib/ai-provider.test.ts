import { afterEach, describe, expect, it, vi } from "vitest";
import { callConfiguredAiProvider, hasAiProviderEnv } from "./ai-provider";

const originalEnv = process.env;

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...originalEnv };
});

describe("ai provider helpers", () => {
  it("detects configured provider env", () => {
    process.env = { ...originalEnv, AI_PROVIDER_API_KEY: "test-key" };
    expect(hasAiProviderEnv()).toBe(true);
  });

  it("parses OpenAI-compatible JSON content", async () => {
    process.env = { ...originalEnv, AI_PROVIDER_API_KEY: "test-key", AI_PROVIDER_BASE_URL: "https://provider.test" };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: '{"status":"classified","items":[]}' } }] }), { status: 200 }));
    await expect(callConfiguredAiProvider("text", "prompt")).resolves.toEqual({ status: "classified", items: [] });
  });
});
