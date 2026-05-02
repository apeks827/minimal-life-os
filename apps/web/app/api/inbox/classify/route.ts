import { classifyInboxText } from "@life/ai";
import { localeSchema } from "@life/shared";
import { callConfiguredAiProvider, hasAiProviderEnv } from "../../../../src/lib/ai-provider";

export async function POST(request: Request) {
  const form = request.headers.get("content-type")?.includes("form");
  const body = form ? Object.fromEntries(await request.formData()) : await request.json();
  const text = String(body.text ?? "").trim();
  const locale = localeSchema.catch("ru").parse(body.locale);
  if (!text) return Response.json({ error: "Text is required" }, { status: 400 });
  const provider = hasAiProviderEnv() ? callConfiguredAiProvider : undefined;
  const result = await classifyInboxText(provider ? { text, locale, provider } : { text, locale });
  if (!hasAiProviderEnv()) result.user_message = result.user_message ?? (locale === "ru" ? "AI провайдер не настроен; запись обработана локально и может быть ретраена позже." : "AI provider is not configured; this was processed locally and can be retried later.");
  return Response.json(result);
}
