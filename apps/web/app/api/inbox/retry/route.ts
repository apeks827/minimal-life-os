import { hasAiProviderEnv } from "../../../../src/lib/ai-provider";
import { retryInboxBatch, type RetryPersistClient } from "../../../../src/lib/retry-inbox";
import { createSupabaseServerClient } from "../../../../src/lib/supabase-client";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (process.env.CRON_SECRET && token !== process.env.CRON_SECRET) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasAiProviderEnv()) return Response.json({ processed: 0, failed: 0, skipped: "AI provider is not configured" }, { status: 202 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return Response.json({ processed: 0, failed: 0, skipped: "Supabase env is not configured" }, { status: 202 });

  const result = await retryInboxBatch(supabase as unknown as RetryPersistClient);
  return Response.json(result);
}
