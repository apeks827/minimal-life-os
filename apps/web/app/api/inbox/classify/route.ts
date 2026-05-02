import { classifyInboxText } from "@life/ai";
import { localeSchema, type Locale } from "@life/shared";
import { callConfiguredAiProvider, hasAiProviderEnv } from "../../../../src/lib/ai-provider";
import { clientKey, PayloadTooLargeError, payloadTooLargeResponse, rateLimit, rateLimitResponse, readJsonWithLimit } from "../../../../src/lib/http-guards";
import { createSupabaseServerClient } from "../../../../src/lib/supabase-client";

export async function POST(request: Request) {
  const limited = rateLimit(clientKey(request, "classify"), 30, 60_000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);
  const form = request.headers.get("content-type")?.includes("form");
  let body: Record<string, unknown>;
  try {
    body = form ? Object.fromEntries(await request.formData()) : (await readJsonWithLimit(request, 16_000)) as Record<string, unknown>;
  } catch (cause) {
    if (cause instanceof PayloadTooLargeError) return payloadTooLargeResponse(cause);
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
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
