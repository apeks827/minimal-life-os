import { hasSupabaseEnv } from "../../../src/lib/env";
import { createSupabaseServerClient } from "../../../src/lib/supabase-client";

export async function GET() {
  const supabaseConfigured = hasSupabaseEnv();
  const supabase = await createSupabaseServerClient();
  let authReachable: boolean | null = null;
  let dbReachable: boolean | null = null;

  if (supabase) {
    const { error } = await supabase.auth.getSession();
    authReachable = !error;
    const probe = await supabase.from("profiles").select("id").limit(1);
    dbReachable = !probe.error;
  }

  return Response.json({
    ok: true,
    version: process.env.npm_package_version ?? "0.1.0",
    buildSha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? "local",
    degraded: !supabaseConfigured || !Boolean(process.env.OPENAI_API_KEY || process.env.AI_PROVIDER_API_KEY),
    service: "lifeinbox-web",
    timestamp: new Date().toISOString(),
    dependencies: {
      app: "ok",
      supabase: { configured: supabaseConfigured, authReachable, dbReachable },
      ai: { configured: Boolean(process.env.OPENAI_API_KEY || process.env.AI_PROVIDER_API_KEY), model: process.env.AI_PROVIDER_MODEL ?? "gpt-4o-mini" },
      retry: { cronProtected: Boolean(process.env.CRON_SECRET) },
    },
  });
}
