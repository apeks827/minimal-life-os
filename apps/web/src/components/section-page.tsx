import { LifeDashboard } from "./life-dashboard";
import type { LifeState } from "../lib/life-store";

export function SectionPage({ title, description, serverState }: { title: string; description: string; serverState?: LifeState | undefined }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-6 md:px-10">
      <section className="rounded-[36px] border border-black/10 bg-white/60 p-7 shadow-2xl backdrop-blur">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[var(--moss)]">LifeInbox screen</p>
        <h1 className="font-display text-5xl leading-tight">{title}</h1>
        <p className="mt-4 max-w-2xl text-black/65">{description}</p>
      </section>
      {serverState ? <LifeDashboard serverState={serverState} /> : <LifeDashboard />}
    </main>
  );
}
