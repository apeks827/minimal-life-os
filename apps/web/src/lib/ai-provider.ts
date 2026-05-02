export async function callConfiguredAiProvider(text: string, prompt: string): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_PROVIDER_API_KEY;
  if (!apiKey) throw new Error("AI provider is not configured");

  const baseUrl = process.env.AI_PROVIDER_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.AI_PROVIDER_MODEL || "gpt-4.1-mini";
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: text },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) throw new Error(`AI provider failed: ${response.status}`);
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI provider returned empty content");
  return JSON.parse(content) as unknown;
}

export function hasAiProviderEnv(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || process.env.AI_PROVIDER_API_KEY);
}
