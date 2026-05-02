import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "./env";
import { createSupabaseServerClient } from "./supabase-client";

export async function requireReadyUser(currentPath: string) {
  if (!hasSupabaseEnv()) return { supabase: null, user: null };
  const supabase = await createSupabaseServerClient();
  const { data, error } = supabase ? await supabase.auth.getUser() : { data: { user: null }, error: null };
  if (error || !data.user) redirect(`/auth?next=${encodeURIComponent(currentPath)}`);

  const { data: onboarding } = await supabase!.from("onboarding_answers").select("id").limit(1).maybeSingle();
  if (!onboarding && currentPath !== "/onboarding") redirect("/onboarding");
  return { supabase, user: data.user };
}
