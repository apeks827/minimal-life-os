import { classifyInboxText } from "@life/ai";
import { localeSchema, type Locale } from "@life/shared";
import { callConfiguredAiProvider, hasAiProviderEnv } from "../../../../src/lib/ai-provider";
import { createSupabaseServerClient } from "../../../../src/lib/supabase-client";

export async function POST(request: Request) {
  const form = request.headers.get("content-type")?.includes("form");
  const body = form ? Object.fromEntries(await request.formData()) : await request.json();
  const text = String(body.text ?? "").trim();
  const requestedLocale = localeSchema.optional().safeParse(body.locale);
  const locale = requestedLocale.success && requestedLocale.data ? requestedLocale.data : await resolveUserLocale();
  if (!text) return Response.json({ error: "Text is required" }, { status: 400 });
  const provider = hasAiProviderEnv() ? callConfiguredAiProvider : undefined;
  const result = await classifyInboxText(provider ? { text, locale, provider } : { text, locale });
  if (!hasAiProviderEnv()) result.user_message = result.user_message ?? (locale === "ru" ? "AI провайдер не настроен; запись обработана локально и может быть ретраена позже." : "AI provider is not configured; this was processed locally and can be retried later.");
  return Response.json(result);
}

async function resolveUserLocale(): Promise<Locale> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return "ru";
  const { data } = await supabase.auth.getUser();
  if (!data.user) return "ru";
  const { data: profile } = await supabase.from("profiles").select("locale").eq("id", data.user.id).maybeSingle();
  return localeSchema.catch("ru").parse((profile as { locale?: unknown } | null)?.locale);
}
