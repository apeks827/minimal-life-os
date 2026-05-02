import { describe, expect, it } from "vitest";
import { buildClassifierPrompt, classifyInboxText, heuristicClassify } from "./index";

describe("ai package", () => {
  it("keeps prompts language-aware and safe", () => {
    const prompt = buildClassifierPrompt("ru");
    expect(prompt).toContain("Russian");
    expect(prompt).toContain("Do not make medical");
  });

  it("classifies tasks with deterministic fallback", () => {
    const result = heuristicClassify("купить молоко завтра", "ru");
    expect(result.items[0]?.type).toBe("event");
    expect(result.source).toBe("heuristic");
  });

  it("falls back when provider fails", async () => {
    const result = await classifyInboxText({
      text: "call Anna",
      locale: "en",
      provider: async () => {
        throw new Error("offline");
      },
    });
    expect(result.source).toBe("heuristic");
  });
});
