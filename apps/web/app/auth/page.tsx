import { SimplePage } from "../../src/components/simple-page";

export default function AuthPage() {
  return (
    <SimplePage eyebrow="Supabase Auth" title="Вход и регистрация">
      <p className="text-black/65">MVP готовит форму под Supabase Auth. Сейчас основной поток работает локально без блокировки входом.</p>
      <label className="grid gap-2 text-sm">Email<input className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" placeholder="you@example.com" /></label>
      <label className="grid gap-2 text-sm">Password<input className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" type="password" placeholder="••••••••" /></label>
      <button className="rounded-full bg-[var(--ink)] px-6 py-4 text-left text-white">Продолжить локально</button>
    </SimplePage>
  );
}
