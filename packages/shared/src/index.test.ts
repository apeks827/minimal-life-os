import { describe, expect, it } from "vitest";
import { aiClassificationSchema, detectLocale } from "./index";

describe("shared schemas", () => {
  it("detects Russian input", () => {
    expect(detectLocale("купить молоко завтра")).toBe("ru");
  });

  it("validates classification payload", () => {
    const result = aiClassificationSchema.parse({
      status: "classified",
      source: "heuristic",
      locale: "ru",
      language: "ru",
      items: [{ type: "task", title: "Купить молоко", confidence: 0.7 }],
    });
    expect(result.items[0]?.priority).toBe("medium");
  });
});
