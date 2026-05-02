import { onboardingAnswerSchema } from "@life/shared";
import { createSupabaseServerClient } from "../../../src/lib/supabase-client";

export async function PUT(request: Request) {
  const parsed = onboardingAnswerSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  if (!supabase) return Response.json({ mode: "local", persisted: false, reason: "Supabase env is not configured" }, { status: 202 });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const answer = parsed.data;
  const onboardingInsert = await supabase.from("onboarding_answers").insert({ user_id: data.user.id, answers: answer });
  if (onboardingInsert.error) return Response.json({ error: onboardingInsert.error.message }, { status: 500 });

  const settingsUpdate = await supabase.from("settings").upsert({ user_id: data.user.id, ai_tone: answer.preferredTone });
  if (settingsUpdate.error) return Response.json({ error: settingsUpdate.error.message }, { status: 500 });

  const today = new Date().toISOString().slice(0, 10);
  const scoreRows = Object.entries(answer.balanceScores).map(([area_key, score]) => ({ user_id: data.user.id, area_key, score, scored_on: today }));
  if (scoreRows.length > 0) {
    const scoreInsert = await supabase.from("balance_scores").insert(scoreRows);
    if (scoreInsert.error) return Response.json({ error: scoreInsert.error.message }, { status: 500 });
  }

  return Response.json({ mode: "supabase", persisted: true });
}
