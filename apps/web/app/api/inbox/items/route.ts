import { aiClassificationSchema } from "@life/shared";
import { z } from "zod";
import { clientKey, PayloadTooLargeError, payloadTooLargeResponse, rateLimit, rateLimitResponse, readJsonWithLimit } from "../../../../src/lib/http-guards";
import { persistClassifiedInbox, type SupabaseLike } from "../../../../src/lib/inbox-persistence";
import { createSupabaseServerClient } from "../../../../src/lib/supabase-client";

const persistRequestSchema = z.object({
  text: z.string().min(1),
  classification: aiClassificationSchema,
  idempotencyKey: z.string().min(8).max(120).optional(),
});

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "inbox-items"), 60, 60_000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);
  let body: unknown;
  try {
    body = await readJsonWithLimit(request, 32_000);
  } catch (cause) {
    if (cause instanceof PayloadTooLargeError) return payloadTooLargeResponse(cause);
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = persistRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return Response.json({ mode: "local", persisted: false, reason: "Supabase env is not configured" }, { status: 202 });
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const result = await persistClassifiedInbox(supabase as unknown as SupabaseLike, { userId: data.user.id, ...parsed.data });
  return Response.json({ mode: "supabase", persisted: true, ...result });
}
