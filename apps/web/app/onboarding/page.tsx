import { SimplePage } from "../../src/components/simple-page";

const areas = ["Здоровье", "Карьера", "Отношения", "Финансы", "Рост", "Дом", "Радость", "Смысл"];

export default function OnboardingPage() {
  return (
    <SimplePage eyebrow="Onboarding" title="Настройте LifeInbox под себя">
      <p className="text-black/65">Эти вопросы отражают будущую запись в `onboarding_answers` и начальные scores для колеса баланса.</p>
      <label className="grid gap-2 text-sm">Главный фокус на месяц<textarea className="min-h-24 rounded-2xl border border-black/10 bg-[#fffaf0] p-4" placeholder="Например: восстановить режим и закрыть долги по работе" /></label>
      <div className="grid gap-3 md:grid-cols-2">
        {areas.map((area) => <label key={area} className="rounded-3xl bg-white/55 p-4 text-sm">{area}<input className="mt-3 w-full" type="range" min="1" max="10" defaultValue="6" /></label>)}
      </div>
      <button className="rounded-full bg-[var(--ink)] px-6 py-4 text-left text-white">Сохранить локальный профиль</button>
    </SimplePage>
  );
}
