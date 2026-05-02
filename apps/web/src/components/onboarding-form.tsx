"use client";

import type { LifeArea, OnboardingAnswer } from "@life/shared";
import { useEffect, useState } from "react";
import { initialLifeState, updateOnboarding, type LifeState } from "../lib/life-store";
import { saveOnboarding } from "../lib/profile-repository";
import { createBrowserLifeStorage } from "../lib/storage";

const areas: Array<{ key: LifeArea; label: string }> = [
  { key: "health", label: "Здоровье" },
  { key: "career", label: "Карьера" },
  { key: "relationships", label: "Отношения" },
  { key: "finance", label: "Финансы" },
  { key: "growth", label: "Рост" },
  { key: "home", label: "Дом" },
  { key: "joy", label: "Радость" },
  { key: "meaning", label: "Смысл" },
];

const defaultAnswer: OnboardingAnswer = {
  focus: "",
  painPoints: [],
  preferredTone: "gentle",
  balanceScores: {},
};

export function OnboardingForm() {
  const [state, setState] = useState<LifeState>(initialLifeState);
  const [answer, setAnswer] = useState<OnboardingAnswer>(defaultAnswer);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = createBrowserLifeStorage(window.localStorage).load();
    setState(loaded);
    setAnswer(loaded.onboarding ?? defaultAnswer);
  }, []);

  function patch(next: Partial<OnboardingAnswer>) {
    setAnswer((current) => ({ ...current, ...next }));
    setSaved(false);
    setMessage(null);
  }

  function setScore(key: LifeArea, score: number) {
    patch({ balanceScores: { ...answer.balanceScores, [key]: score } });
  }

  async function save() {
    const normalized = { ...answer, focus: answer.focus.trim() || "Собрать систему жизни" };
    const next = updateOnboarding(state, normalized);
    createBrowserLifeStorage(window.localStorage).save(next);
    setState(next);
    try {
      const mode = await saveOnboarding(normalized);
      setMessage(mode === "supabase" ? "Профиль сохранен в Supabase." : "Профиль сохранен локально.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Не удалось сохранить профиль на сервере.");
    }
    setSaved(true);
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm">
        Главный фокус на месяц
        <textarea className="min-h-24 rounded-2xl border border-black/10 bg-[#fffaf0] p-4" value={answer.focus} onChange={(event) => patch({ focus: event.target.value })} placeholder="Например: восстановить режим и закрыть долги по работе" />
      </label>
      <label className="grid gap-2 text-sm">
        Тон поддержки
        <select className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" value={answer.preferredTone} onChange={(event) => patch({ preferredTone: event.target.value as OnboardingAnswer["preferredTone"] })}>
          <option value="gentle">Мягкий</option>
          <option value="direct">Прямой</option>
          <option value="coach">Коуч</option>
        </select>
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        {areas.map((area) => (
          <label key={area.key} className="rounded-3xl bg-white/55 p-4 text-sm">
            <span className="flex justify-between"><span>{area.label}</span><span>{answer.balanceScores[area.key] ?? 6}/10</span></span>
            <input className="mt-3 w-full" type="range" min="1" max="10" value={answer.balanceScores[area.key] ?? 6} onChange={(event) => setScore(area.key, Number(event.target.value))} />
          </label>
        ))}
      </div>
      <button className="rounded-full bg-[var(--ink)] px-6 py-4 text-left text-white" onClick={save}>Сохранить локальный профиль</button>
      {saved && message ? <p className="text-sm text-[var(--moss)]">{message}</p> : null}
    </div>
  );
}
