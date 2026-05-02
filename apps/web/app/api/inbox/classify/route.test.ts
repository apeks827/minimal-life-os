import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/inbox/classify", () => {
  it("classifies valid text with requested locale", async () => {
    const response = await POST(new Request("http://test", { method: "POST", body: JSON.stringify({ text: "купить молоко", locale: "ru" }) }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items[0].title).toBe("купить молоко");
    expect(body.locale).toBe("ru");
    expect(body.suggestions.length).toBeGreaterThan(0);
  });

  it("uses English when selected by the client", async () => {
    const response = await POST(new Request("http://test", { method: "POST", body: JSON.stringify({ text: "buy milk", locale: "en" }) }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.locale).toBe("en");
    expect(body.user_message).toMatch(/Classified|Need|AI provider/);
  });

  it("rejects empty text", async () => {
    const response = await POST(new Request("http://test", { method: "POST", body: JSON.stringify({ text: "" }) }));
    expect(response.status).toBe(400);
  });
});
