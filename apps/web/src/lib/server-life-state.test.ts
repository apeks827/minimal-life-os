import { describe, expect, it } from "vitest";
import { loadServerLifeState } from "./server-life-state";

function fakeReader(tables: Record<string, unknown[]>) {
  return {
    from(table: string) {
      return {
        select() {
          return {
            order: async () => ({ data: tables[table] ?? [], error: null }),
          };
        },
      };
    },
  };
}

describe("loadServerLifeState", () => {
  it("maps Supabase rows into dashboard state", async () => {
    const state = await loadServerLifeState(fakeReader({
      profiles: [{ locale: "en" }],
      settings: [{ aiTone: "coach", dailyPlanHour: 9 }],
      inbox_items: [{ id: "inbox_1", raw_text: "buy milk", classification: null, created_at: "2026-01-01T10:00:00.000Z" }],
      tasks: [{ id: "task_1", inbox_item_id: "inbox_1", title: "buy milk", priority: "high", due_at: null }],
    }));

    expect(state.settings.locale).toBe("en");
    expect(state.settings.aiTone).toBe("coach");
    expect(state.inbox[0]?.text).toBe("buy milk");
    expect(state.records[0]?.type).toBe("task");
  });
});
