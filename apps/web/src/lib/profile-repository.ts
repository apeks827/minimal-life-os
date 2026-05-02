import type { OnboardingAnswer, UserSettings } from "@life/shared";

export async function saveSettings(settings: UserSettings): Promise<"local" | "supabase"> {
  const response = await fetch("/api/settings", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error(`Settings save failed: ${response.status}`);
  const body = (await response.json()) as { mode?: "local" | "supabase" };
  return body.mode ?? "supabase";
}

export async function saveOnboarding(answer: OnboardingAnswer): Promise<"local" | "supabase"> {
  const response = await fetch("/api/onboarding", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(answer),
  });
  if (!response.ok) throw new Error(`Onboarding save failed: ${response.status}`);
  const body = (await response.json()) as { mode?: "local" | "supabase" };
  return body.mode ?? "supabase";
}
