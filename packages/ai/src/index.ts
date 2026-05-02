import { AiClassification, InboxItemType, Locale, aiClassificationSchema, detectLocale } from "@life/shared";

const taskWords = ["надо", "сделать", "купить", "позвонить", "write", "call", "buy", "todo"];
const habitWords = ["каждый", "ежеднев", "привыч", "every", "daily", "habit"];
const goalWords = ["хочу", "цель", "науч", "достичь", "goal", "learn", "achieve"];
const eventWords = ["встреч", "завтра", "сегодня в", "calendar", "meeting", "tomorrow", "at "];

export function buildClassifierPrompt(locale: Locale): string {
  const language = locale === "ru" ? "Russian" : "English";
  return [
    `You are LifeInbox, a supportive life OS assistant. Respond in ${language}.`,
    "Classify raw user text into task, goal, habit, note, event, or memory.",
    "Return strict JSON only. Do not make medical, legal, or financial guarantees.",
    "Use a warm tone, avoid shame, pressure, manipulation, or diagnosis.",
  ].join("\n");
}

export function heuristicClassify(text: string, locale: Locale = "ru"): AiClassification {
  const language = detectLocale(text, locale);
  const normalized = text.trim().toLowerCase();
  const type = inferType(normalized);
  const confidence = type === "note" ? 0.58 : 0.74;
  const result: AiClassification = {
    status: confidence < 0.62 ? "needs_clarification" : "classified",
    source: "heuristic",
    locale,
    language,
    retryable: true,
    safetyNote: locale === "ru" ? "Проверьте результат перед действием." : "Review before acting.",
    items: [
      {
        type,
        title: toTitle(text),
        summary: text.trim(),
        confidence,
        priority: "medium",
        needsClarification: confidence < 0.62,
        clarificationQuestion:
          confidence < 0.62
            ? locale === "ru"
              ? "Это задача, заметка или событие?"
              : "Is this a task, note, or event?"
            : undefined,
      },
    ],
  };
  return aiClassificationSchema.parse(result);
}

export async function classifyInboxText(input: {
  text: string;
  locale?: Locale;
  provider?: (text: string, prompt: string) => Promise<unknown>;
}): Promise<AiClassification> {
  const locale = input.locale ?? detectLocale(input.text);
  if (!input.provider) return heuristicClassify(input.text, locale);

  try {
    const raw = await input.provider(input.text, buildClassifierPrompt(locale));
    return aiClassificationSchema.parse({ ...(raw as Record<string, unknown>), source: "provider", locale });
  } catch {
    return heuristicClassify(input.text, locale);
  }
}

export function createDailyPlan(items: Array<{ title: string; priority?: string }>): string[] {
  return items
    .slice()
    .sort((a, b) => (b.priority === "high" ? 1 : 0) - (a.priority === "high" ? 1 : 0))
    .slice(0, 5)
    .map((item, index) => `${index + 1}. ${item.title}`);
}

export function suggestBalanceAction(area: string, locale: Locale = "ru"): string {
  return locale === "ru"
    ? `Выберите один маленький шаг для сферы "${area}" на этой неделе.`
    : `Choose one small step for "${area}" this week.`;
}

function inferType(text: string): InboxItemType {
  if (habitWords.some((word) => text.includes(word))) return "habit";
  if (goalWords.some((word) => text.includes(word))) return "goal";
  if (eventWords.some((word) => text.includes(word))) return "event";
  if (taskWords.some((word) => text.includes(word))) return "task";
  return "note";
}

function toTitle(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, " ");
  return cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned;
}
