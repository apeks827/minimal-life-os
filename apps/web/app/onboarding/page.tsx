import { OnboardingForm } from "../../src/components/onboarding-form";
import { SimplePage } from "../../src/components/simple-page";

export default function OnboardingPage() {
  return (
    <SimplePage eyebrow="Onboarding" title="Настройте LifeInbox под себя">
      <p className="text-black/65">Эти вопросы отражают будущую запись в `onboarding_answers` и начальные scores для колеса баланса.</p>
      <OnboardingForm />
    </SimplePage>
  );
}
