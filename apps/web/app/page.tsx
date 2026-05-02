import { LifeDashboard } from "../src/components/life-dashboard";
import { loadServerLifeState } from "../src/lib/server-life-state";
import { createSupabaseServerClient } from "../src/lib/supabase-client";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const serverState = supabase && data.user ? await loadServerLifeState(supabase) : undefined;

  return serverState ? <LifeDashboard serverState={serverState} /> : <LifeDashboard />;
}
