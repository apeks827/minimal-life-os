import Link from "next/link";
import type { ReactNode } from "react";

export function SimplePage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-5 py-8 md:px-10">
      <Link href="/" className="w-fit rounded-full bg-white/60 px-4 py-2 text-sm backdrop-blur">← LifeInbox</Link>
      <section className="rounded-[36px] border border-black/10 bg-white/60 p-7 shadow-2xl backdrop-blur">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[var(--moss)]">{eyebrow}</p>
        <h1 className="font-display text-5xl leading-tight">{title}</h1>
        <div className="mt-7 grid gap-4">{children}</div>
      </section>
    </main>
  );
}
