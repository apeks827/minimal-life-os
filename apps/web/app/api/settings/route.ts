import { userSettingsSchema } from "@life/shared";
import { createSupabaseServerClient } from "../../../src/lib/supabase-client";

export async function PUT(request: Request) {
  const parsed = userSettingsSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return Response.json({ mode: "local", persisted: false, reason: "Supabase env is not configured" }, { status: 202 });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const settings = parsed.data;
  const profileUpdate = await supabase.from("profiles").update({ locale: settings.locale }).eq("id", data.user.id);
  if (profileUpdate.error) return Response.json({ error: profileUpdate.error.message }, { status: 500 });

  const settingsUpdate = await supabase.from("settings").upsert({
    user_id: data.user.id,
    ai_enabled: settings.aiEnabled,
    ai_tone: settings.aiTone,
    daily_plan_hour: settings.dailyPlanHour,
    week_starts_on: settings.weekStartsOn,
    advanced: {
      dailyTaskCount: settings.dailyTaskCount,
      suggestionAggressiveness: settings.suggestionAggressiveness,
      autoIntegrationMode: settings.autoIntegrationMode,
      focusAreas: settings.focusAreas,
      protectedAreas: settings.protectedAreas,
      notifications: settings.notifications,
      privacy: settings.privacy,
      testMode: settings.testMode,
    },
  });
  if (settingsUpdate.error) return Response.json({ error: settingsUpdate.error.message }, { status: 500 });

  return Response.json({ mode: "supabase", persisted: true });
}
