import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/inbox/classify", () => {
  it("returns heuristic classification for json input", async () => {
    const response = await POST(
      new Request("http://localhost/api/inbox/classify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "купить молоко завтра", locale: "ru" }),
      }),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.source).toBe("heuristic");
    expect(body.items[0].title).toContain("купить молоко");
  });

  it("rejects empty input", async () => {
    const response = await POST(
      new Request("http://localhost/api/inbox/classify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "" }),
      }),
    );
    expect(response.status).toBe(400);
  });
});
