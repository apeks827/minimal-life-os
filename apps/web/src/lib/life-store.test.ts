import { describe, expect, it } from "vitest";
import {
  appendClassification,
  initialLifeState,
  parseState,
  recordsByType,
  todayPlan,
  updateOnboarding,
  updateSettings,
} from "./life-store";

describe("life store", () => {
  it("appends classification into inbox and records", () => {
    const state = appendClassification(initialLifeState, "купить молоко", {
      status: "classified",
      source: "heuristic",
      locale: "ru",
      language: "ru",
      retryable: true,
      suggestions: [],
      items: [{ type: "task", title: "купить молоко", priority: "medium", effort: "small", confidence: 0.7, needsClarification: false }],
    });

    expect(state.inbox).toHaveLength(1);
    expect(recordsByType(state.records, "task")).toHaveLength(1);
    expect(todayPlan(state.records)[0]?.title).toBe("купить молоко");
  });

  it("updates settings and onboarding", () => {
    const withSettings = updateSettings(initialLifeState, { locale: "en", dailyPlanHour: 9 });
    const withOnboarding = updateOnboarding(withSettings, {
      focus: "Ship MVP",
      painPoints: [],
      preferredTone: "coach",
      balanceScores: { health: 6 },
      choices: [],
      energyLevel: "medium",
    });

    expect(withOnboarding.settings.locale).toBe("en");
    expect(withOnboarding.settings.aiTone).toBe("coach");
    expect(withOnboarding.onboarding?.focus).toBe("Ship MVP");
  });

  it("recovers from broken local storage", () => {
    expect(parseState("not-json")).toEqual(initialLifeState);
  });
});
