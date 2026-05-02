import { createHash, timingSafeEqual } from "node:crypto";
import { hasAiProviderEnv } from "../../../../src/lib/ai-provider";
import { clientKey, rateLimit, rateLimitResponse } from "../../../../src/lib/http-guards";
import { retryInboxBatch, type RetryPersistClient } from "../../../../src/lib/retry-inbox";
import { createSupabaseServerClient } from "../../../../src/lib/supabase-client";

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "retry"), 6, 60_000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (process.env.CRON_SECRET && !safeTokenEqual(token, process.env.CRON_SECRET)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasAiProviderEnv()) return Response.json({ processed: 0, failed: 0, skipped: "AI provider is not configured" }, { status: 202 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return Response.json({ processed: 0, failed: 0, skipped: "Supabase env is not configured" }, { status: 202 });

  const result = await retryInboxBatch(supabase as unknown as RetryPersistClient);
  return Response.json(result);
}

function safeTokenEqual(actual: string | undefined, expected: string): boolean {
  if (!actual) return false;
  const actualHash = createHash("sha256").update(actual).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}
