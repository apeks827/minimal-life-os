import { SimplePage } from "../../src/components/simple-page";

export default function SettingsPage() {
  return (
    <SimplePage eyebrow="Settings" title="Поведение AI и интерфейса">
      <p className="text-black/65">Настройки в MVP синхронизированы с shared schema и будут сохраняться в таблицу `settings` при подключении Supabase.</p>
      <label className="grid gap-2 text-sm">Язык<select className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" defaultValue="ru"><option value="ru">Русский</option><option value="en">English</option></select></label>
      <label className="grid gap-2 text-sm">Тон AI<select className="rounded-2xl border border-black/10 bg-[#fffaf0] p-4" defaultValue="gentle"><option value="gentle">Мягкий</option><option value="direct">Прямой</option><option value="coach">Коуч</option></select></label>
      <label className="flex items-center gap-3 rounded-3xl bg-white/55 p-4 text-sm"><input type="checkbox" defaultChecked /> Включить AI, если доступен ключ провайдера</label>
      <button className="rounded-full bg-[var(--ink)] px-6 py-4 text-left text-white">Сохранить настройки</button>
    </SimplePage>
  );
}
