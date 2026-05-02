import { classifyInboxText } from "@life/ai";
import { callConfiguredAiProvider, hasAiProviderEnv } from "./ai-provider";
import { persistClassifiedInbox } from "./inbox-persistence";
import { logError, logInfo } from "./logger";

type PendingInboxItem = { id: string; user_id: string; raw_text: string; attempts: number | null };

export type SupabaseRetryClient = {
  from(table: string): {
    select(columns?: string): { in(column: string, values: string[]): { lte(column: string, value: string): { limit(count: number): PromiseLike<{ data: unknown[] | null; error: { message: string } | null }> } } };
    update(values: Record<string, unknown>): { eq(column: string, value: string): PromiseLike<{ error: { message: string } | null }> };
  };
};

type PersistClient = Parameters<typeof persistClassifiedInbox>[0];
export type RetryPersistClient = SupabaseRetryClient & PersistClient;

export async function retryInboxBatch(supabase: RetryPersistClient, limit = 10): Promise<{ processed: number; failed: number }> {
  if (!hasAiProviderEnv()) return { processed: 0, failed: 0 };
  const { data, error } = await supabase
    .from("inbox_items")
    .select("id,user_id,raw_text,attempts")
    .in("status", ["pending", "failed"])
    .lte("next_retry_at", new Date().toISOString())
    .limit(limit);
  if (error) throw new Error(error.message);

  let processed = 0;
  let failed = 0;
  for (const item of (data ?? []) as PendingInboxItem[]) {
    try {
      const classification = await classifyInboxText({ text: item.raw_text, provider: callConfiguredAiProvider });
      await persistClassifiedInbox(supabase, { userId: item.user_id, text: item.raw_text, classification });
      await supabase.from("inbox_items").update({ status: classification.status, classification, attempts: (item.attempts ?? 0) + 1, last_error: null, next_retry_at: null }).eq("id", item.id);
      processed += 1;
      logInfo("inbox_retry_processed", { inboxId: item.id });
    } catch (cause) {
      failed += 1;
      const attempts = (item.attempts ?? 0) + 1;
      const nextRetryAt = new Date(Date.now() + Math.min(60, attempts * 10) * 60_000).toISOString();
      await supabase.from("inbox_items").update({ attempts, last_error: cause instanceof Error ? cause.message : String(cause), next_retry_at: nextRetryAt }).eq("id", item.id);
      logError("inbox_retry_failed", cause, { inboxId: item.id, attempts });
    }
  }
  return { processed, failed };
}
