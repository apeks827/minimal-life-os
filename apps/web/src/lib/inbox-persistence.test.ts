import { describe, expect, it } from "vitest";
import type { AiClassification } from "@life/shared";
import { persistClassifiedInbox } from "./inbox-persistence";

function fakeSupabase(existingId?: string) {
  const inserts: Array<{ table: string; values: Record<string, unknown> }> = [];
  return {
    inserts,
    client: {
      from(table: string) {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: existingId ? { id: existingId } : null, error: null }),
              }),
            }),
          }),
          insert(values: Record<string, unknown>) {
            inserts.push({ table, values });
            return { select: () => ({ single: async () => ({ data: { id: `${table}_1` }, error: null }) }) };
          },
        };
      },
    },
  };
}

const classification: AiClassification = {
  status: "classified" as const,
  source: "heuristic" as const,
  locale: "ru" as const,
  language: "ru",
  retryable: true,
  suggestions: [],
  items: [{ type: "task" as const, title: "купить молоко", priority: "medium" as const, effort: "small" as const, confidence: 0.7, needsClarification: false }],
};

describe("persistClassifiedInbox", () => {
  it("persists inbox item and derived entities", async () => {
    const supabase = fakeSupabase();
    const result = await persistClassifiedInbox(supabase.client, {
      userId: "user_1",
      text: "купить молоко",
      idempotencyKey: "idem-12345678",
      classification,
    });

    expect(result).toEqual({ inboxId: "inbox_items_1", created: 1, reused: false });
    expect(supabase.inserts.map((insert) => insert.table)).toEqual(["inbox_items", "tasks"]);
    expect(supabase.inserts[0]?.values).toMatchObject({ idempotency_key: "idem-12345678" });
  });

  it("reuses existing inbox row for repeated idempotency key", async () => {
    const supabase = fakeSupabase("inbox_existing");
    const result = await persistClassifiedInbox(supabase.client, {
      userId: "user_1",
      text: "купить молоко",
      idempotencyKey: "idem-12345678",
      classification,
    });

    expect(result).toEqual({ inboxId: "inbox_existing", created: 0, reused: true });
    expect(supabase.inserts).toEqual([]);
  });

  it("reuses the retry inbox id instead of creating duplicates", async () => {
    const supabase = fakeSupabase();
    const result = await persistClassifiedInbox(supabase.client, {
      userId: "user_1",
      text: "купить молоко",
      existingInboxId: "retry_inbox",
      classification,
    });

    expect(result).toEqual({ inboxId: "retry_inbox", created: 0, reused: true });
    expect(supabase.inserts).toEqual([]);
  });
});
