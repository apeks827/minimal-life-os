"use client";

import { type LifeArea, type UserSettings } from "@life/shared";
import { useEffect, useState } from "react";
import { areaOptions, dictionaries } from "../lib/i18n";
import { initialLifeState, updateSettings, type LifeState } from "../lib/life-store";
import { saveSettings } from "../lib/profile-repository";
import { createBrowserLifeStorage } from "../lib/storage";


export function SettingsForm() {
  const [state, setState] = useState<LifeState>(initialLifeState);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const locale = state.settings.locale;
  const l = dictionaries[locale];
  const areas = areaOptions(locale);

  useEffect(() => {
    setState(createBrowserLifeStorage(window.localStorage).load());
  }, []);

  function patch(settings: Partial<UserSettings>) {
    setState((current) => updateSettings(current, settings));
    setSaved(false);
    setMessage(null);
  }

  function toggleArea(field: "focusAreas" | "protectedAreas", area: LifeArea) {
    const current = state.settings[field];
    patch({ [field]: current.includes(area) ? current.filter((item) => item !== area) : [...current, area] });
  }

  async function save() {
    createBrowserLifeStorage(window.localStorage).save(state);
    try {
      const mode = await saveSettings(state.settings);
      setMessage(mode === "supabase" ? l.settingsSavedSupabase : l.settingsSavedLocal);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : l.settingsSaveFailed);
    }
    setSaved(true);
  }

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 rounded-[32px] bg-white/45 p-5">
        <h2 className="font-display text-3xl">{l.basicSettings}</h2>
        <Select label={l.language} value={state.settings.locale} onChange={(value) => patch({ locale: value as UserSettings["locale"], language: value as UserSettings["locale"] })} options={["ru", "en"]} />
        <Select label={l.aiTone} value={state.settings.aiTone} onChange={(value) => patch({ aiTone: value as UserSettings["aiTone"] })} options={["gentle", "direct", "coach"]} />
        <label className="grid gap-2 text-sm">{l.dailyPlanHour}<input className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" type="number" min="0" max="23" value={state.settings.dailyPlanHour} onChange={(event) => patch({ dailyPlanHour: Number(event.target.value) })} /></label>
        <label className="grid gap-2 text-sm">{l.dailyTaskLimit}<input className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" type="number" min="1" max="12" value={state.settings.dailyTaskCount} onChange={(event) => patch({ dailyTaskCount: Number(event.target.value) })} /></label>
      </section>

      <section id="advanced" className="grid gap-4 rounded-[32px] bg-white/45 p-5">
        <h2 className="font-display text-3xl">Advanced Settings</h2>
        <Select label={l.suggestionAggressiveness} value={state.settings.suggestionAggressiveness} onChange={(value) => patch({ suggestionAggressiveness: value as UserSettings["suggestionAggressiveness"] })} options={["low", "medium", "high"]} />
        <Select label={l.autoIntegration} value={state.settings.autoIntegrationMode} onChange={(value) => patch({ autoIntegrationMode: value as UserSettings["autoIntegrationMode"] })} options={["manual", "ask", "auto"]} />
        <AreaPicker title={l.focusAreas} areas={areas} selected={state.settings.focusAreas} onToggle={(area) => toggleArea("focusAreas", area)} />
        <AreaPicker title={l.protectedAreas} areas={areas} selected={state.settings.protectedAreas} onToggle={(area) => toggleArea("protectedAreas", area)} />
        <label className="flex items-center gap-3 rounded-3xl bg-white/55 p-4 text-sm"><input type="checkbox" checked={state.settings.aiEnabled} onChange={(event) => patch({ aiEnabled: event.target.checked })} />{l.aiEnabled}</label>
        <label className="flex items-center gap-3 rounded-3xl bg-white/55 p-4 text-sm"><input type="checkbox" checked={state.settings.notifications.enabled} onChange={(event) => patch({ notifications: { ...state.settings.notifications, enabled: event.target.checked } })} />{l.notifications}</label>
        <label className="flex items-center gap-3 rounded-3xl bg-white/55 p-4 text-sm"><input type="checkbox" checked={state.settings.privacy.storeAiMemory} onChange={(event) => patch({ privacy: { ...state.settings.privacy, storeAiMemory: event.target.checked } })} />{l.storeAiMemory}</label>
        <label className="flex items-center gap-3 rounded-3xl bg-white/55 p-4 text-sm"><input type="checkbox" checked={state.settings.testMode} onChange={(event) => patch({ testMode: event.target.checked })} />{l.testMode}</label>
        <div className="grid gap-2 md:grid-cols-2">
          <button className="rounded-full bg-[#fffaf0] px-6 py-4 text-left" onClick={() => setMessage(l.exportUnavailable)}>{l.exportData}</button>
          <button className="rounded-full bg-[#fffaf0] px-6 py-4 text-left" onClick={() => setMessage(l.resetMemoryUnavailable)}>{l.resetAiMemory}</button>
        </div>
      </section>

      <button className="rounded-full bg-[var(--ink)] px-6 py-4 text-left text-white" onClick={save}>{l.saveSettings}</button>
      {saved && message ? <p className="text-sm text-[var(--moss)]">{message}</p> : null}
      {!saved && message ? <p className="text-sm text-[var(--moss)]">{message}</p> : null}
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-sm">{label}<select className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function AreaPicker({ title, areas, selected, onToggle }: { title: string; areas: Array<{ key: LifeArea; label: string }>; selected: LifeArea[]; onToggle: (area: LifeArea) => void }) {
  return <div className="grid gap-2"><p className="text-sm font-semibold">{title}</p><div className="flex flex-wrap gap-2">{areas.map((area) => <button key={area.key} className={`rounded-full px-3 py-2 text-sm ${selected.includes(area.key) ? "bg-[var(--ink)] text-white" : "bg-[#fffaf0]"}`} onClick={() => onToggle(area.key)}>{area.label}</button>)}</div></div>;
}
