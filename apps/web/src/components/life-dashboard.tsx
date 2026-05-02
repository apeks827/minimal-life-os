"use client";

import { copy, lifeAreaLabels, type Locale } from "@life/shared";
import { useEffect, useMemo, useState } from "react";
import { createConfiguredInboxRepository } from "../lib/repository";
import { logError, logInfo } from "../lib/logger";
import { createBrowserLifeStorage } from "../lib/storage";
import {
  initialLifeState,
  recordsByType,
  todayPlan,
  updateLocale,
  type LifeRecord,
  type LifeState,
} from "../lib/life-store";

const labels = {
  ru: {
    hero: "Соберите жизнь в один спокойный вход.",
    subtitle: "Пишите как есть. MVP сохранит запись локально, разберет ее и покажет в нужных разделах.",
    submit: "Разобрать и добавить в план",
    processing: "Разбираю...",
    today: "План на сегодня",
    inbox: "Журнал входящих",
    empty: "Пока пусто. Добавьте первую мысль, задачу или привычку.",
    auth: "Войти",
    onboarding: "Онбординг",
    settings: "Настройки",
    screens: ["Сегодня", "Задачи", "Цели", "Привычки", "Календарь", "Баланс", "Подсказки"],
    fallback: "Локальная классификация активна. Можно подключить AI позже.",
    suggestions: "Облако подсказок",
    advanced: "Advanced",
    clarification: "Нужно уточнение",
  },
  en: {
    hero: "Collect life into one calm inbox.",
    subtitle: "Write naturally. The MVP saves locally, classifies, and reflects it across sections.",
    submit: "Classify and add to plan",
    processing: "Classifying...",
    today: "Today Plan",
    inbox: "Inbox log",
    empty: "Nothing yet. Add a first thought, task, or habit.",
    auth: "Sign in",
    onboarding: "Onboarding",
    settings: "Settings",
    screens: ["Today", "Tasks", "Goals", "Habits", "Calendar", "Balance", "Suggestions"],
    fallback: "Local classification is active. Connect AI later.",
    suggestions: "Suggestion cloud",
    advanced: "Advanced",
    clarification: "Needs clarification",
  },
} as const;

const typeLabels: Record<string, Record<Locale, string>> = {
  task: { ru: "Задачи", en: "Tasks" },
  goal: { ru: "Цели", en: "Goals" },
  habit: { ru: "Привычки", en: "Habits" },
  event: { ru: "Календарь", en: "Calendar" },
  note: { ru: "Заметки", en: "Notes" },
  memory: { ru: "Память", en: "Memory" },
} as const;

export function LifeDashboard({ serverState }: { serverState?: LifeState }) {
  const [state, setState] = useState<LifeState>(serverState ?? initialLifeState);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const locale = state.settings.locale;
  const l = labels[locale];

  useEffect(() => {
    if (serverState) {
      createBrowserLifeStorage(window.localStorage).save(serverState);
      return;
    }
    setState(createBrowserLifeStorage(window.localStorage).load());
  }, [serverState]);

  const plan = useMemo(() => todayPlan(state.records).slice(0, state.settings.dailyTaskCount), [state.records, state.settings.dailyTaskCount]);
  const screenLinks = ["/today", "/tasks", "/goals", "/habits", "/calendar", "/balance", "/suggestions"];
  const suggestionCloud = state.inbox[0]?.classification.suggestions ?? [
    { title: locale === "ru" ? "Позвонить маме" : "Call mom", action: locale === "ru" ? "Добавить заботливую задачу" : "Add a caring task", type: "task" as const, lifeArea: "family" as const },
    { title: locale === "ru" ? "5 минут английского" : "5 minutes of English", action: locale === "ru" ? "Создать привычку" : "Create a habit", type: "habit" as const, lifeArea: "learning" as const },
    { title: locale === "ru" ? "Разобрать деньги" : "Review money", action: locale === "ru" ? "Добавить финансовый шаг" : "Add a finance step", type: "task" as const, lifeArea: "finance" as const },
  ];

  async function submitInbox() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setError(null);
    try {
      const storage = createBrowserLifeStorage(window.localStorage);
      const repository = createConfiguredInboxRepository(storage);
      const classification = await repository.classify({ text: trimmed, locale });
      const next = await repository.saveClassification(state, trimmed, classification);
      logInfo("inbox_classified", { status: classification.status, items: classification.items.length });
      setState(next);
      setText("");
    } catch (cause) {
      logError("inbox_classification_failed", cause);
      setError(cause instanceof Error ? cause.message : "Classification failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-7 px-5 py-6 md:px-10">
      <nav className="rise flex flex-wrap items-center justify-between gap-3 rounded-full border border-black/10 bg-white/50 px-5 py-3 backdrop-blur">
        <span className="font-display text-2xl">LifeInbox</span>
        <div className="flex items-center gap-2 text-sm">
          <a className="rounded-full bg-white/60 px-3 py-2" href="/auth">{l.auth}</a>
          <a className="rounded-full bg-white/60 px-3 py-2" href="/onboarding">{l.onboarding}</a>
          <a className="rounded-full bg-white/60 px-3 py-2" href="/settings">{l.settings}</a>
          <a className="rounded-full bg-white/60 px-3 py-2" href="/settings#advanced">{l.advanced}</a>
          {screenLinks.map((href, index) => <a key={href} className="rounded-full bg-white/40 px-3 py-2" href={href}>{l.screens[index]}</a>)}
          <button className="rounded-full bg-[var(--ink)] px-3 py-2 text-white" onClick={() => setState((current) => {
              const next = updateLocale(current, locale === "ru" ? "en" : "ru");
              createBrowserLifeStorage(window.localStorage).save(next);
              return next;
            })}>
            {locale.toUpperCase()}
          </button>
        </div>
      </nav>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rise rounded-[36px] border border-black/10 bg-white/60 p-7 shadow-2xl backdrop-blur">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[var(--moss)]">AI inbox</p>
          <h1 className="font-display text-5xl leading-tight md:text-7xl">{l.hero}</h1>
          <p className="mt-5 max-w-2xl text-lg text-black/65">{l.subtitle}</p>
          <div className="mt-8 grid gap-3">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="min-h-36 rounded-[28px] border border-black/10 bg-[#fffaf0] p-5 outline-none"
              placeholder={copy[locale].inboxPlaceholder}
            />
            <button disabled={isLoading} onClick={submitInbox} className="rounded-full bg-[var(--ink)] px-6 py-4 text-left text-white disabled:opacity-60">
              {isLoading ? l.processing : l.submit}
            </button>
            {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-900">{error}. {locale === "ru" ? "Запись можно повторить позже; local-first режим не сломан." : "Retry later; local-first mode is still safe."}</p> : <p className="text-sm text-black/55">{l.fallback}</p>}
            <div className="grid gap-2 rounded-[28px] bg-white/50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-black/45">{l.suggestions}</p>
              <div className="flex flex-wrap gap-2">
                {suggestionCloud.map((suggestion) => (
                  <button key={`${suggestion.title}-${suggestion.action}`} className="rounded-full bg-[#fffaf0] px-4 py-2 text-sm text-black/75" onClick={() => setText(`${suggestion.title} — ${suggestion.action}`)}>
                    {suggestion.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Panel title={l.today} records={plan} locale={locale} empty={l.empty} accent="bg-[var(--clay)]" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title={typeLabels.task?.[locale] ?? "Tasks"} records={recordsByType(state.records, "task")} locale={locale} empty={l.empty} />
        <Panel title={typeLabels.goal?.[locale] ?? "Goals"} records={recordsByType(state.records, "goal")} locale={locale} empty={l.empty} />
        <Panel title={typeLabels.habit?.[locale] ?? "Habits"} records={recordsByType(state.records, "habit")} locale={locale} empty={l.empty} />
        <Panel title={typeLabels.event?.[locale] ?? "Calendar"} records={recordsByType(state.records, "event")} locale={locale} empty={l.empty} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <BalanceWheel locale={locale} records={state.records} />
        <article className="rounded-[32px] border border-black/10 bg-white/55 p-6 backdrop-blur">
          <h2 className="font-display text-3xl">{l.inbox}</h2>
          <div className="mt-4 grid gap-3">
            {state.inbox.length === 0 ? <p className="text-black/55">{l.empty}</p> : state.inbox.map((item) => <InboxItem key={item.id} item={item.text} type={item.classification.items[0]?.type ?? "note"} message={item.classification.user_message} />)}
          </div>
        </article>
      </section>
    </main>
  );
}

function Panel({ title, records, locale, empty, accent = "bg-[var(--moss)]" }: { title: string; records: LifeRecord[]; locale: Locale; empty: string; accent?: string }) {
  return (
    <article className="rise rounded-[32px] border border-black/10 bg-white/55 p-6 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl">{title}</h2>
        <span className={`${accent} rounded-full px-3 py-1 text-sm text-white`}>{records.length}</span>
      </div>
      <div className="mt-4 grid gap-3">
        {records.length === 0 ? <p className="text-black/55">{empty}</p> : records.map((record) => <RecordCard key={record.id} record={record} locale={locale} />)}
      </div>
    </article>
  );
}

function RecordCard({ record, locale }: { record: LifeRecord; locale: Locale }) {
  return (
    <div className="rounded-3xl bg-[#fffaf0]/80 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-black/45">{typeLabels[record.type]?.[locale] ?? record.type} / {Math.round(record.confidence * 100)}%</p>
      <h3 className="mt-2 font-display text-xl">{record.title}</h3>
      {record.needsClarification ? <p className="mt-2 text-sm text-[var(--clay)]">{record.clarificationQuestion}</p> : null}
    </div>
  );
}

function InboxItem({ item, type, message }: { item: string; type: string; message: string | undefined }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl bg-white/60 p-4">
      <span className="text-sm text-black/75">{item}</span>
      <span className="rounded-full bg-black/10 px-3 py-1 text-xs">{type}</span>
      {message ? <span className="text-xs text-black/45">{message}</span> : null}
    </div>
  );
}

function BalanceWheel({ locale, records }: { locale: Locale; records: LifeRecord[] }) {
  const areas = ["health", "family", "relationships", "friends", "career", "finance", "learning", "home", "rest", "hobbies", "meaning", "emotions"] as const;
  return (
    <article className="rounded-[32px] border border-black/10 bg-white/55 p-6 backdrop-blur">
      <h2 className="font-display text-3xl">{locale === "ru" ? "Колесо баланса" : "Balance Wheel"}</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {areas.map((area, index) => (
          <div key={area} className="rounded-[28px] bg-[#fffaf0]/70 p-4">
            <p className="text-sm text-black/55">{lifeAreaLabels[area][locale]}</p>
            <div className="mt-3 h-2 rounded-full bg-black/10"><div className="h-2 rounded-full bg-[var(--moss)]" style={{ width: `${Math.min(100, 25 + records.length * 8 + index * 7)}%` }} /></div>
          </div>
        ))}
      </div>
    </article>
  );
}
