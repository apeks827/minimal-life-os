import type { AiClassification, AiEntity } from "@life/shared";
import { mapInboxItemTypeToEntityType, normalizeLifeArea } from "@life/shared";

export type SupabaseLike = {
  from(table: string): {
    insert(values: unknown): { select(columns?: string): { single(): PromiseLike<{ data: unknown; error: { message: string } | null }> } };
    select?(columns?: string): { eq(column: string, value: string): { eq(column: string, value: string): { maybeSingle(): PromiseLike<{ data: unknown; error: { message: string } | null }> } } };
  };
};

export type PersistInboxInput = {
  userId: string;
  text: string;
  classification: AiClassification;
  idempotencyKey?: string | undefined;
  existingInboxId?: string | undefined;
};

export async function persistClassifiedInbox(supabase: SupabaseLike, input: PersistInboxInput): Promise<{ inboxId: string; created: number; reused: boolean }> {
  const existing = input.existingInboxId ? { id: input.existingInboxId } : await findExistingInbox(supabase, input.userId, input.idempotencyKey);
  const inboxId = existing?.id;
  if (inboxId) return { inboxId, created: 0, reused: true };

  const inboxInsert = await supabase
    .from("inbox_items")
    .insert({
      user_id: input.userId,
      raw_text: input.text,
      status: input.classification.status,
      classification: input.classification,
      retryable: input.classification.retryable,
      idempotency_key: input.idempotencyKey ?? null,
    })
    .select("id")
    .single();

  if (inboxInsert.error) throw new Error(inboxInsert.error.message);
  const insertedInboxId = readId(inboxInsert.data);
  let created = 0;

  for (const item of input.classification.items) {
    await persistEntity(supabase, input.userId, insertedInboxId, item);
    created += 1;
  }

  return { inboxId: insertedInboxId, created, reused: false };
}

async function persistEntity(supabase: SupabaseLike, userId: string, inboxId: string, item: AiEntity) {
  const entityType = mapInboxItemTypeToEntityType(item.type);
  const table = tableForType(entityType);
  const values = valuesForEntity(userId, inboxId, item);
  const result = await supabase.from(table).insert(values).select("id").single();
  if (result.error) throw new Error(result.error.message);
}

function tableForType(type: ReturnType<typeof mapInboxItemTypeToEntityType>): string {
  switch (type) {
    case "task":
      return "tasks";
    case "goal":
      return "goals";
    case "habit":
      return "habits";
    case "event":
      return "events";
    case "memory":
      return "memories";
    case "note":
      return "memories";
  }
}

function valuesForEntity(userId: string, inboxId: string, item: AiEntity): Record<string, unknown> {
  const entityType = mapInboxItemTypeToEntityType(item.type);
  const lifeArea = normalizeLifeArea(item.life_area ?? item.lifeArea);
  switch (entityType) {
    case "task":
      return { user_id: userId, inbox_item_id: inboxId, title: item.title, priority: item.priority, due_at: item.dueAt ?? null };
    case "goal":
      return { user_id: userId, inbox_item_id: inboxId, title: item.title, area: lifeArea ?? null };
    case "habit":
      return { user_id: userId, inbox_item_id: inboxId, title: item.title, recurrence: item.recurrence ?? "daily" };
    case "event":
      return { user_id: userId, inbox_item_id: inboxId, title: item.title, starts_at: item.dueAt ?? null };
    case "memory":
      return { user_id: userId, inbox_item_id: inboxId, content: item.summary ?? item.title, tags: [item.type] };
    case "note":
      return { user_id: userId, inbox_item_id: inboxId, content: item.summary ?? item.title, tags: ["note"] };
  }
}

function readId(data: unknown): string {
  if (data && typeof data === "object" && "id" in data && typeof data.id === "string") return data.id;
  throw new Error("Supabase insert did not return an id");
}

async function findExistingInbox(supabase: SupabaseLike, userId: string, idempotencyKey: string | undefined): Promise<{ id: string } | null> {
  if (!idempotencyKey) return null;
  const table = supabase.from("inbox_items");
  if (!table.select) return null;
  const result = await table.select("id").eq("user_id", userId).eq("idempotency_key", idempotencyKey).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  if (result.data && typeof result.data === "object" && "id" in result.data && typeof result.data.id === "string") return { id: result.data.id };
  return null;
}
