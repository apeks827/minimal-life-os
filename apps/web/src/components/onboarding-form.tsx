"use client";

import { type LifeArea, type OnboardingAnswer } from "@life/shared";
import { useEffect, useState } from "react";
import { areaOptions, dictionaries, onboardingQuestions } from "../lib/i18n";
import { initialLifeState, updateOnboarding, type LifeState } from "../lib/life-store";
import { saveOnboarding } from "../lib/profile-repository";
import { createBrowserLifeStorage } from "../lib/storage";


const defaultAnswer: OnboardingAnswer = {
  focus: "",
  painPoints: [],
  preferredTone: "gentle",
  balanceScores: {},
  choices: [],
  energyLevel: "medium",
};

export function OnboardingForm() {
  const [state, setState] = useState<LifeState>(initialLifeState);
  const [answer, setAnswer] = useState<OnboardingAnswer>(defaultAnswer);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const locale = state.settings.locale;
  const l = dictionaries[locale];
  const areas = areaOptions(locale);
  const questions = onboardingQuestions[locale];

  useEffect(() => {
    const loaded = createBrowserLifeStorage(window.localStorage).load();
    setState(loaded);
    setAnswer({ ...defaultAnswer, ...loaded.onboarding });
  }, []);

  function patch(next: Partial<OnboardingAnswer>) {
    setAnswer((current) => ({ ...current, ...next }));
    setSaved(false);
    setMessage(null);
  }

  function setChoice(id: string, question: string, selected: string) {
    const choices = [...answer.choices.filter((choice) => choice.id !== id), { id, question, answer: selected }];
    patch({ choices, preferredTone: selected === "direct" || selected === "coach" || selected === "gentle" ? selected : answer.preferredTone, energyLevel: ["Низко", "Low"].includes(selected) ? "low" : ["Высоко", "High"].includes(selected) ? "high" : answer.energyLevel });
  }

  function setScore(key: LifeArea, score: number) {
    patch({ balanceScores: { ...answer.balanceScores, [key]: score } });
  }

  async function save() {
    const normalized = { ...answer, focus: answer.focus.trim() || (locale === "ru" ? "Собрать систему жизни" : "Build a life system") };
    const next = updateOnboarding(state, normalized);
    createBrowserLifeStorage(window.localStorage).save(next);
    setState(next);
    try {
      const mode = await saveOnboarding(normalized);
      setMessage(mode === "supabase" ? l.onboardingSavedSupabase : l.onboardingSavedLocal);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : l.onboardingSaveFailed);
    }
    setSaved(true);
  }

  return (
    <div className="grid gap-5">
      <label className="grid gap-2 text-sm">
        {l.mainFocus}
        <textarea className="min-h-24 rounded-2xl border border-black/10 bg-[#fffaf0] p-4" value={answer.focus} onChange={(event) => patch({ focus: event.target.value })} placeholder={l.mainFocusPlaceholder} />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        {questions.map(([id, question, options]) => (
          <div key={id} className="rounded-3xl bg-white/55 p-4 text-sm">
            <p className="font-semibold">{question}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {options.map((option) => {
                const active = answer.choices.some((choice) => choice.id === id && choice.answer === option);
                return <button key={option} className={`rounded-full px-3 py-2 ${active ? "bg-[var(--ink)] text-white" : "bg-[#fffaf0]"}`} onClick={() => setChoice(id, question, option)}>{option}</button>;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {areas.map((area) => (
          <label key={area.key} className="rounded-3xl bg-white/55 p-4 text-sm">
            <span className="flex justify-between"><span>{area.label}</span><span>{answer.balanceScores[area.key] ?? 6}/10</span></span>
            <input className="mt-3 w-full" type="range" min="1" max="10" value={answer.balanceScores[area.key] ?? 6} onChange={(event) => setScore(area.key, Number(event.target.value))} />
          </label>
        ))}
      </div>

      <label className="grid gap-2 text-sm">
        {l.extra}
        <textarea className="min-h-20 rounded-2xl border border-black/10 bg-[#fffaf0] p-4" value={answer.openAnswer ?? ""} onChange={(event) => patch({ openAnswer: event.target.value })} placeholder={l.extraPlaceholder} />
      </label>

      <button className="rounded-full bg-[var(--ink)] px-6 py-4 text-left text-white" onClick={save}>{l.saveProfile}</button>
      {saved && message ? <p className="text-sm text-[var(--moss)]">{message}</p> : null}
    </div>
  );
}
