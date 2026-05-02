import { AuthForm } from "../../src/components/auth-form";
import { SimplePage } from "../../src/components/simple-page";

export default function AuthPage() {
  return (
    <SimplePage eyebrow="Supabase Auth" title="Вход и регистрация">
      <p className="text-black/65">Если Supabase env настроен, форма выполнит реальный login/signup. Без env основной поток работает в local MVP mode.</p>
      <AuthForm />
    </SimplePage>
  );
}
