import { describe, expect, it } from "vitest";
import { buildClassifierPrompt, classifyInboxText, createBalanceCoach, createDailyPlan, generateSuggestionCloud, heuristicClassify } from "./index";

describe("ai package", () => {
  it("keeps prompts language-aware and safe", () => {
    const prompt = buildClassifierPrompt("ru");
    expect(prompt).toContain("Russian");
    expect(prompt).toContain("Do not make medical");
    expect(prompt).toContain("strict JSON");
  });

  it("classifies RU examples from the brief", () => {
    expect(heuristicClassify("надо разобраться с деньгами", "ru").items[0]).toMatchObject({ type: "task", life_area: "finance" });
    expect(heuristicClassify("позвонить маме завтра", "ru").items[0]).toMatchObject({ type: "calendar_event", life_area: "family" });
    expect(heuristicClassify("хочу учить английский", "ru").items[0]).toMatchObject({ type: "goal", life_area: "learning" });
  });

  it("classifies EN equivalents and suggestions", () => {
    const result = heuristicClassify("learn English every day", "en");
    expect(result.items[0]?.type).toBe("habit");
    expect(generateSuggestionCloud({ locale: "en", lowBalanceAreas: ["health"] })[0]?.lifeArea).toBe("health");
  });

  it("plans and coaches deterministically", () => {
    expect(createDailyPlan([{ title: "A", priority: "low" }, { title: "B", priority: "high" }], { dailyTaskCount: 1 })).toEqual(["1. B"]);
    expect(createBalanceCoach({ scores: { rest: 2, finance: 5 }, locale: "en" })[0]).toContain("Rest");
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
