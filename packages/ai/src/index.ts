import {
  AiClassification,
  InboxItemType,
  LifeArea,
  Locale,
  UserSettings,
  aiClassificationSchema,
  detectLocale,
  lifeAreaLabels,
} from "@life/shared";

const taskWords = ["надо", "сделать", "купить", "позвонить", "оплатить", "write", "call", "buy", "todo", "pay"];
const habitWords = ["каждый", "ежеднев", "привыч", "трениров", "every", "daily", "habit", "workout"];
const goalWords = ["хочу", "цель", "науч", "достичь", "goal", "learn", "achieve"];
const eventWords = ["встреч", "завтра", "сегодня в", "созвон", "calendar", "meeting", "tomorrow", "at "];
const problemWords = ["проблем", "тревож", "выгор", "не знаю", "problem", "anxious", "burnout", "stuck"];
const adviceWords = ["посоветуй", "как лучше", "что делать", "advice", "how should", "what should"];
const hobbyWords = ["хобби", "интерес", "гитара", "рисовать", "hobby", "interest", "guitar", "drawing"];
const financeWords = ["деньг", "бюджет", "долг", "оплат", "money", "budget", "debt", "pay"];
const familyWords = ["мам", "пап", "родител", "семь", "mom", "mother", "dad", "family"];
const learningWords = ["англий", "учить", "курс", "learn", "english", "course"];

export function buildClassifierPrompt(locale: Locale): string {
  const language = locale === "ru" ? "Russian" : "English";
  return [
    `You are LifeInbox, a supportive life OS assistant. Respond in ${language}.`,
    "Use user goals, history, balance, energy, and settings context when provided.",
    "Classify raw text into: task, goal, habit, idea, note, calendar_event, life_problem, interest_hobby, reminder, advice_request, unclear.",
    "Return strict JSON only with fields: status, source, locale, language, user_message, suggestions, items[].",
    "Each item must include type, title, summary, life_area, priority, effort, confidence, suggested_next_action, suggested_due_date, and clarification fields when needed.",
    "Do not make medical, legal, or financial guarantees. Use safe, non-shaming wording and suggest small next actions.",
  ].join("\n");
}

export function heuristicClassify(text: string, locale: Locale = "ru"): AiClassification {
  const language = detectLocale(text, locale);
  const normalized = text.trim().toLowerCase();
  const type = inferType(normalized);
  const lifeArea = inferLifeArea(normalized);
  const confidence = type === "unclear" ? 0.42 : type === "note" ? 0.58 : 0.78;
  const dueDate = inferDueDate(normalized);
  const result: AiClassification = {
    status: confidence < 0.62 ? "needs_clarification" : "classified",
    source: "heuristic",
    locale,
    language,
    retryable: true,
    safetyNote: locale === "ru" ? "Проверьте результат перед действием." : "Review before acting.",
    user_message: userMessage(type, locale, confidence),
    suggestions: generateSuggestionCloud({ locale, lowBalanceAreas: lifeArea ? [lifeArea] : [] }).slice(0, confidence < 0.62 ? 3 : 2),
    items: [
      {
        type,
        title: toTitle(text),
        summary: text.trim(),
        lifeArea,
        life_area: lifeArea,
        dueAt: dueDate?.iso,
        suggested_due_date: dueDate?.label,
        effort: inferEffort(normalized),
        confidence,
        priority: inferPriority(normalized, type),
        suggested_next_action: nextAction(type, locale),
        needsClarification: confidence < 0.62,
        needs_clarification: confidence < 0.62,
        clarificationQuestion: confidence < 0.62 ? clarificationQuestion(locale) : undefined,
        clarification_question: confidence < 0.62 ? clarificationQuestion(locale) : undefined,
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

export function generateSuggestionCloud(input: {
  locale: Locale;
  lowBalanceAreas?: LifeArea[];
  energy?: "low" | "medium" | "high";
  settings?: Partial<UserSettings>;
}): AiClassification["suggestions"] {
  const areas: LifeArea[] = input.lowBalanceAreas?.length ? input.lowBalanceAreas : input.settings?.focusAreas?.length ? input.settings.focusAreas : ["health", "relationships", "learning"];
  const gentle = input.energy === "low" || input.settings?.suggestionAggressiveness === "low";
  return areas.slice(0, 3).map((area) => ({
    title: input.locale === "ru" ? `Маленький шаг: ${lifeAreaLabels[area].ru}` : `Small step: ${lifeAreaLabels[area].en}`,
    action: input.locale === "ru" ? (gentle ? "Запланировать 5 минут без давления" : "Добавить один конкретный шаг на сегодня") : gentle ? "Plan five no-pressure minutes" : "Add one concrete step for today",
    type: "task",
    lifeArea: area,
    life_area: area,
  }));
}

export function createDailyPlan(items: Array<{ title: string; priority?: string; type?: string }>, settings: Partial<UserSettings> = {}): string[] {
  const limit = settings.dailyTaskCount ?? 5;
  return items
    .slice()
    .sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority))
    .slice(0, limit)
    .map((item, index) => `${index + 1}. ${item.title}`);
}

export function suggestBalanceAction(area: LifeArea | string, locale: Locale = "ru"): string {
  const label = lifeAreaLabels[area as LifeArea]?.[locale] ?? area;
  return locale === "ru" ? `Выберите один маленький шаг для сферы "${label}" на этой неделе.` : `Choose one small step for "${label}" this week.`;
}

export function createBalanceCoach(input: { scores: Partial<Record<LifeArea, number>>; locale?: Locale }): string[] {
  const locale = input.locale ?? "ru";
  return Object.entries(input.scores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([area]) => suggestBalanceAction(area, locale));
}

function inferType(text: string): InboxItemType {
  if (adviceWords.some((word) => text.includes(word))) return "advice_request";
  if (problemWords.some((word) => text.includes(word))) return "life_problem";
  if (habitWords.some((word) => text.includes(word))) return "habit";
  if (goalWords.some((word) => text.includes(word))) return "goal";
  if (eventWords.some((word) => text.includes(word))) return "calendar_event";
  if (hobbyWords.some((word) => text.includes(word))) return "interest_hobby";
  if (taskWords.some((word) => text.includes(word))) return "task";
  if (text.length < 4) return "unclear";
  return "note";
}

function inferLifeArea(text: string): LifeArea | undefined {
  if (financeWords.some((word) => text.includes(word))) return "finance";
  if (familyWords.some((word) => text.includes(word))) return "family";
  if (learningWords.some((word) => text.includes(word))) return "learning";
  if (hobbyWords.some((word) => text.includes(word))) return "hobbies";
  if (problemWords.some((word) => text.includes(word))) return "emotions";
  if (text.includes("здоров") || text.includes("health")) return "health";
  if (text.includes("работ") || text.includes("career")) return "career";
  return undefined;
}

function inferPriority(text: string, type: InboxItemType): "low" | "medium" | "high" {
  if (text.includes("срочно") || text.includes("urgent") || text.includes("долг")) return "high";
  if (["note", "idea", "interest_hobby"].includes(type)) return "low";
  return "medium";
}

function inferEffort(text: string): "tiny" | "small" | "medium" | "large" {
  if (text.includes("5 минут") || text.includes("five minutes")) return "tiny";
  if (text.includes("проект") || text.includes("project")) return "large";
  return "small";
}

function inferDueDate(text: string): { iso: string; label: string } | undefined {
  const date = new Date();
  if (text.includes("завтра") || text.includes("tomorrow")) date.setDate(date.getDate() + 1);
  else if (!text.includes("сегодня") && !text.includes("today")) return undefined;
  return { iso: date.toISOString(), label: date.toISOString().slice(0, 10) };
}

function nextAction(type: InboxItemType, locale: Locale): string {
  const ru: Record<string, string> = {
    task: "Добавить в задачи и выбрать время",
    goal: "Сформулировать первый маленький шаг",
    habit: "Выбрать минимальную версию привычки",
    calendar_event: "Проверить дату и добавить в календарь",
    life_problem: "Записать один безопасный следующий шаг",
    advice_request: "Сформулировать контекст и варианты",
  };
  const en: Record<string, string> = {
    task: "Add to tasks and choose a time",
    goal: "Define the first small step",
    habit: "Choose the smallest habit version",
    calendar_event: "Confirm the date and add to calendar",
    life_problem: "Write one safe next step",
    advice_request: "Clarify context and options",
  };
  return (locale === "ru" ? ru[type] : en[type]) ?? (locale === "ru" ? "Сохранить как заметку" : "Save as a note");
}

function userMessage(type: InboxItemType, locale: Locale, confidence: number): string {
  if (confidence < 0.62) return locale === "ru" ? "Я не уверен в типе записи, уточните действие." : "I am not fully sure what this is; please clarify.";
  return locale === "ru" ? `Разобрал запись как ${type}.` : `Classified this as ${type}.`;
}

function clarificationQuestion(locale: Locale): string {
  return locale === "ru" ? "Что с этим нужно сделать: запланировать, сохранить или обсудить?" : "What should happen next: schedule, save, or discuss?";
}

function priorityWeight(priority?: string): number {
  return priority === "high" ? 3 : priority === "medium" ? 2 : 1;
}

function toTitle(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, " ");
  return cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned;
}
