import { SettingsForm } from "../../src/components/settings-form";
import { SimplePage } from "../../src/components/simple-page";

export default function SettingsPage() {
  return (
    <SimplePage eyebrow="Settings" title="Поведение AI и интерфейса">
      <p className="text-black/65">Настройки в MVP синхронизированы с shared schema и будут сохраняться в таблицу `settings` при подключении Supabase.</p>
      <SettingsForm />
    </SimplePage>
  );
}
