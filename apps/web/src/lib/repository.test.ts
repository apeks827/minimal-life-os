import { describe, expect, it, vi } from "vitest";
import { initialLifeState } from "./life-store";
import { createLocalInboxRepository } from "./repository";
import type { LifeStorage } from "./storage";

describe("inbox repository", () => {
  it("persists local classification through storage", async () => {
    const save = vi.fn();
    const storage: LifeStorage = { load: () => initialLifeState, save };
    const repository = createLocalInboxRepository(storage);
    const classification = {
      status: "classified" as const,
      source: "heuristic" as const,
      locale: "ru" as const,
      language: "ru" as const,
      retryable: true,
      items: [{ type: "task" as const, title: "купить молоко", priority: "medium" as const, confidence: 0.7, needsClarification: false }],
    };

    const next = await repository.saveClassification(initialLifeState, "купить молоко", classification);

    expect(next.inbox).toHaveLength(1);
    expect(save).toHaveBeenCalledWith(next);
  });
});
