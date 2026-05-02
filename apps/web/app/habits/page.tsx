import { SectionPage } from "../../src/components/section-page";
import { requireReadyUser } from "../../src/lib/auth-gate";
import { loadServerLifeState } from "../../src/lib/server-life-state";

export default async function Page() {
  const { supabase, user } = await requireReadyUser("/habits");
  const serverState = supabase && user ? await loadServerLifeState(supabase) : undefined;
  return <SectionPage title="Привычки" description="Регулярные действия и минимальные версии привычек." {...(serverState ? { serverState } : {})} />;
}
