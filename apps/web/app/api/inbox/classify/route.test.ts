import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/inbox/classify", () => {
  it("classifies valid text", async () => {
    const response = await POST(new Request("http://test", { method: "POST", body: JSON.stringify({ text: "купить молоко", locale: "ru" }) }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items[0].title).toBe("купить молоко");
    expect(body.suggestions.length).toBeGreaterThan(0);
  });

  it("rejects empty text", async () => {
    const response = await POST(new Request("http://test", { method: "POST", body: JSON.stringify({ text: "" }) }));
    expect(response.status).toBe(400);
  });
});
