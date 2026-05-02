import { describe, expect, it } from "vitest";
import { persistClassifiedInbox } from "./inbox-persistence";

function fakeSupabase() {
  const inserts: Array<{ table: string; values: unknown }> = [];
  return {
    inserts,
    client: {
      from(table: string) {
        return {
          insert(values: unknown) {
            inserts.push({ table, values });
            return { select: () => ({ single: async () => ({ data: { id: `${table}_1` }, error: null }) }) };
          },
        };
      },
    },
  };
}

describe("persistClassifiedInbox", () => {
  it("persists inbox item and derived entities", async () => {
    const supabase = fakeSupabase();
    const result = await persistClassifiedInbox(supabase.client, {
      userId: "user_1",
      text: "купить молоко",
      classification: {
        status: "classified",
        source: "heuristic",
        locale: "ru",
        language: "ru",
        retryable: true,
        suggestions: [],
        items: [{ type: "task", title: "купить молоко", priority: "medium", effort: "small", confidence: 0.7, needsClarification: false }],
      },
    });

    expect(result).toEqual({ inboxId: "inbox_items_1", created: 1 });
    expect(supabase.inserts.map((insert) => insert.table)).toEqual(["inbox_items", "tasks"]);
  });
});
