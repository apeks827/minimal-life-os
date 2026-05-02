import { hasSupabaseEnv } from "../../../src/lib/env";
import { createSupabaseServerClient } from "../../../src/lib/supabase-client";

export async function GET() {
  const supabaseConfigured = hasSupabaseEnv();
  const supabase = await createSupabaseServerClient();
  let authReachable: boolean | null = null;

  if (supabase) {
    const { error } = await supabase.auth.getSession();
    authReachable = !error;
  }

  return Response.json({
    ok: true,
    service: "lifeinbox-web",
    timestamp: new Date().toISOString(),
    dependencies: {
      app: "ok",
      supabase: { configured: supabaseConfigured, authReachable },
      ai: { configured: Boolean(process.env.OPENAI_API_KEY || process.env.AI_PROVIDER_API_KEY) },
    },
  });
}
