import { describe, expect, it } from "vitest";
import { areaOptions, dictionaries, inboxTypeLabels, screenLinks } from "./i18n";

describe("web i18n", () => {
  it("keeps dictionaries aligned", () => {
    expect(Object.keys(dictionaries.en).sort()).toEqual(Object.keys(dictionaries.ru).sort());
  });

  it("exposes localized navigation and area labels", () => {
    expect(screenLinks.map((link) => link.label.en)).toContain("Today");
    expect(areaOptions("en")[0]?.label).toBe("Health");
    expect(inboxTypeLabels.task.ru).toBe("Задачи");
  });
});
