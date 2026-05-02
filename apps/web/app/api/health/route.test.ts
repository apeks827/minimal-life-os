import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns readiness metadata without secrets", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ ok: true, service: "lifeinbox-web" });
    expect(body.buildSha).toBeTruthy();
    expect(body.dependencies.retry).toHaveProperty("cronProtected");
    expect(JSON.stringify(body)).not.toContain(process.env.OPENAI_API_KEY ?? "__missing_secret__");
  });
});
