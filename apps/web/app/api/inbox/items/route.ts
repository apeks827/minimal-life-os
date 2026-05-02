import { aiClassificationSchema } from "@life/shared";
import { z } from "zod";
import { persistClassifiedInbox } from "../../../../src/lib/inbox-persistence";
import { createSupabaseServerClient } from "../../../../src/lib/supabase-client";

const persistRequestSchema = z.object({
  text: z.string().min(1),
  classification: aiClassificationSchema,
});

export async function POST(request: Request) {
  const parsed = persistRequestSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return Response.json({ mode: "local", persisted: false, reason: "Supabase env is not configured" }, { status: 202 });
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const result = await persistClassifiedInbox(supabase, { userId: data.user.id, ...parsed.data });
  return Response.json({ mode: "supabase", persisted: true, ...result });
}
