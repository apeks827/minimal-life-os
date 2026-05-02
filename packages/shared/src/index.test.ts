import { describe, expect, it } from "vitest";
import { aiClassificationSchema, detectLocale, lifeAreaLabels, mapInboxItemTypeToEntityType, userSettingsSchema } from "./index";

describe("shared schemas", () => {
  it("detects Russian input", () => {
    expect(detectLocale("купить молоко завтра")).toBe("ru");
  });

  it("validates expanded classification payload", () => {
    const result = aiClassificationSchema.parse({
      status: "classified",
      source: "heuristic",
      locale: "ru",
      language: "ru",
      user_message: "Готово",
      suggestions: [{ title: "Позвонить маме", action: "Добавить задачу", life_area: "family" }],
      items: [{ type: "calendar_event", title: "Купить молоко", confidence: 0.7, life_area: "home", effort: "small", suggested_next_action: "Добавить" }],
    });
    expect(result.items[0]?.priority).toBe("medium");
    expect(mapInboxItemTypeToEntityType(result.items[0]!.type)).toBe("event");
  });

  it("contains 12 life areas and advanced settings defaults", () => {
    expect(Object.keys(lifeAreaLabels)).toHaveLength(12);
    const settings = userSettingsSchema.parse({});
    expect(settings.dailyTaskCount).toBe(5);
    expect(settings.protectedAreas).toContain("rest");
  });
});
