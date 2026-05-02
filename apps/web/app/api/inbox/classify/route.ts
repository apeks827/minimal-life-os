import { classifyInboxText } from "@life/ai";
import { localeSchema } from "@life/shared";

export async function POST(request: Request) {
  const form = request.headers.get("content-type")?.includes("form");
  const body = form ? Object.fromEntries(await request.formData()) : await request.json();
  const text = String(body.text ?? "").trim();
  const locale = localeSchema.catch("ru").parse(body.locale);
  if (!text) return Response.json({ error: "Text is required" }, { status: 400 });
  const result = await classifyInboxText({ text, locale });
  return Response.json(result);
}
