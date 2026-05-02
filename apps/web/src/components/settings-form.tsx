"use client";

import type { UserSettings } from "@life/shared";
import { useEffect, useState } from "react";
import { initialLifeState, updateSettings, type LifeState } from "../lib/life-store";
import { createBrowserLifeStorage } from "../lib/storage";

export function SettingsForm() {
  const [state, setState] = useState<LifeState>(initialLifeState);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setState(createBrowserLifeStorage(window.localStorage).load());
  }, []);

  function patch(settings: Partial<UserSettings>) {
    setState((current) => updateSettings(current, settings));
    setSaved(false);
  }

  function save() {
    createBrowserLifeStorage(window.localStorage).save(state);
    setSaved(true);
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm">
        Язык
        <select className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" value={state.settings.locale} onChange={(event) => patch({ locale: event.target.value as UserSettings["locale"] })}>
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        Тон AI
        <select className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" value={state.settings.aiTone} onChange={(event) => patch({ aiTone: event.target.value as UserSettings["aiTone"] })}>
          <option value="gentle">Мягкий</option>
          <option value="direct">Прямой</option>
          <option value="coach">Коуч</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm">
        Час дневного плана
        <input className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" type="number" min="0" max="23" value={state.settings.dailyPlanHour} onChange={(event) => patch({ dailyPlanHour: Number(event.target.value) })} />
      </label>
      <label className="flex items-center gap-3 rounded-3xl bg-white/55 p-4 text-sm">
        <input type="checkbox" checked={state.settings.aiEnabled} onChange={(event) => patch({ aiEnabled: event.target.checked })} />
        Включить AI, если доступен ключ провайдера
      </label>
      <button className="rounded-full bg-[var(--ink)] px-6 py-4 text-left text-white" onClick={save}>Сохранить настройки</button>
      {saved ? <p className="text-sm text-[var(--moss)]">Настройки сохранены локально.</p> : null}
    </div>
  );
}
