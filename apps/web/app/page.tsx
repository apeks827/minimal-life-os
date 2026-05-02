import { LifeDashboard } from "../src/components/life-dashboard";
import { requireReadyUser } from "../src/lib/auth-gate";
import { loadServerLifeState } from "../src/lib/server-life-state";

export default async function HomePage() {
  const { supabase, user } = await requireReadyUser("/");
  const serverState = supabase && user ? await loadServerLifeState(supabase) : undefined;
  return serverState ? <LifeDashboard serverState={serverState} /> : <LifeDashboard />;
}
