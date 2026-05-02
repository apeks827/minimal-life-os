"use client";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-screen max-w-3xl place-items-center px-6 text-center">
      <div className="rounded-[36px] border border-black/10 bg-white/65 p-8 shadow-2xl backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--moss)]">LifeInbox fallback</p>
        <h1 className="mt-3 font-display text-5xl">Что-то пошло не так</h1>
        <p className="mt-4 text-black/65">Мы сохранили безопасный режим. Попробуйте обновить экран или продолжайте в local-first режиме.</p>
        <p className="mt-3 text-xs text-black/40">{error.digest ?? error.message}</p>
        <button className="mt-6 rounded-full bg-[var(--ink)] px-6 py-3 text-white" onClick={reset}>Повторить</button>
      </div>
    </main>
  );
}
