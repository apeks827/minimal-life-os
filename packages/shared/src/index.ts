import { z } from "zod";

export const localeSchema = z.enum(["ru", "en"]);
export type Locale = z.infer<typeof localeSchema>;

export const lifeAreaSchema = z.enum([
  "health",
  "family",
  "relationships",
  "friends",
  "career",
  "finance",
  "learning",
  "home",
  "rest",
  "hobbies",
  "meaning",
  "emotions",
]);
export type LifeArea = z.infer<typeof lifeAreaSchema>;

export const legacyLifeAreaSchema = z.enum(["growth", "joy"]);
export const anyLifeAreaSchema = z.union([lifeAreaSchema, legacyLifeAreaSchema]);
export type AnyLifeArea = z.infer<typeof anyLifeAreaSchema>;

export const lifeAreaLabels: Record<LifeArea, { ru: string; en: string }> = {
  health: { ru: "Здоровье", en: "Health" },
  family: { ru: "Семья", en: "Family" },
  relationships: { ru: "Отношения", en: "Relationships" },
  friends: { ru: "Друзья", en: "Friends" },
  career: { ru: "Карьера", en: "Career" },
  finance: { ru: "Финансы", en: "Finance" },
  learning: { ru: "Обучение", en: "Learning" },
  home: { ru: "Дом", en: "Home" },
  rest: { ru: "Отдых", en: "Rest" },
  hobbies: { ru: "Хобби", en: "Hobbies" },
  meaning: { ru: "Смысл", en: "Meaning" },
  emotions: { ru: "Эмоции", en: "Emotions" },
};

export const inboxItemTypeSchema = z.enum([
  "task",
  "goal",
  "habit",
  "idea",
  "note",
  "calendar_event",
  "life_problem",
  "interest_hobby",
  "reminder",
  "advice_request",
  "unclear",
  "event",
  "memory",
]);
export type InboxItemType = z.infer<typeof inboxItemTypeSchema>;

export const entityTypeSchema = z.enum(["task", "goal", "habit", "note", "event", "memory"]);
export type EntityType = z.infer<typeof entityTypeSchema>;

export const prioritySchema = z.enum(["low", "medium", "high"]);
export type Priority = z.infer<typeof prioritySchema>;

export const effortSchema = z.enum(["tiny", "small", "medium", "large"]);
export type Effort = z.infer<typeof effortSchema>;

export const suggestionSchema = z.object({
  title: z.string().min(1).max(160),
  action: z.string().min(1).max(240),
  type: inboxItemTypeSchema.default("task"),
  lifeArea: lifeAreaSchema.optional(),
  life_area: lifeAreaSchema.optional(),
});
export type AiSuggestion = z.output<typeof suggestionSchema>;

export const aiEntitySchema = z.object({
  type: inboxItemTypeSchema,
  title: z.string().min(1).max(160),
  summary: z.string().max(600).optional(),
  lifeArea: anyLifeAreaSchema.optional(),
  life_area: lifeAreaSchema.optional(),
  dueAt: z.string().datetime().optional(),
  recurrence: z.string().max(120).optional(),
  priority: prioritySchema.default("medium"),
  effort: effortSchema.default("small"),
  confidence: z.number().min(0).max(1),
  suggested_next_action: z.string().max(240).optional(),
  suggested_due_date: z.string().max(80).optional(),
  needsClarification: z.boolean().default(false),
  needs_clarification: z.boolean().optional(),
  clarificationQuestion: z.string().max(240).optional(),
  clarification_question: z.string().max(240).optional(),
});
export type AiEntity = z.output<typeof aiEntitySchema>;

export const aiClassificationSchema = z.object({
  status: z.enum(["classified", "needs_clarification", "failed"]),
  source: z.enum(["provider", "heuristic"]),
  locale: localeSchema,
  language: localeSchema,
  safetyNote: z.string().optional(),
  retryable: z.boolean().default(false),
  user_message: z.string().max(500).optional(),
  suggestions: z.array(suggestionSchema).default([]),
  items: z.array(aiEntitySchema).min(1),
});
export type AiClassification = z.output<typeof aiClassificationSchema>;

export const onboardingChoiceSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const onboardingAnswerSchema = z.object({
  focus: z.string().min(1),
  painPoints: z.array(z.string()).default([]),
  preferredTone: z.enum(["gentle", "direct", "coach"]).default("gentle"),
  balanceScores: z.partialRecord(lifeAreaSchema, z.number().min(1).max(10)).default({}),
  choices: z.array(onboardingChoiceSchema).default([]),
  openAnswer: z.string().max(1000).optional(),
  energyLevel: z.enum(["low", "medium", "high"]).default("medium"),
});
export type OnboardingAnswer = z.output<typeof onboardingAnswerSchema>;

export const userSettingsSchema = z.object({
  locale: localeSchema.default("ru"),
  language: localeSchema.optional(),
  aiEnabled: z.boolean().default(true),
  aiTone: z.enum(["gentle", "direct", "coach"]).default("gentle"),
  dailyPlanHour: z.number().int().min(0).max(23).default(8),
  dailyTaskCount: z.number().int().min(1).max(12).default(5),
  weekStartsOn: z.enum(["monday", "sunday"]).default("monday"),
  suggestionAggressiveness: z.enum(["low", "medium", "high"]).default("medium"),
  autoIntegrationMode: z.enum(["manual", "ask", "auto"] as const).default("ask"),
  focusAreas: z.array(lifeAreaSchema).default([]),
  protectedAreas: z.array(lifeAreaSchema).default(["health", "relationships", "rest"]),
  notifications: z.object({ enabled: z.boolean().default(false), dailyPlan: z.boolean().default(false) }).default({ enabled: false, dailyPlan: false }),
  privacy: z.object({ storeAiMemory: z.boolean().default(false), allowAnalytics: z.boolean().default(false) }).default({ storeAiMemory: false, allowAnalytics: false }),
  testMode: z.boolean().default(false),
});
export type UserSettings = z.infer<typeof userSettingsSchema>;

export const copy = {
  ru: {
    appName: "LifeInbox",
    inboxPlaceholder: "Напишите что угодно: задачу, мысль, цель, привычку...",
    today: "План на сегодня",
    settings: "Настройки",
    aiFallback: "AI сейчас недоступен, но запись сохранена и разобрана базово.",
  },
  en: {
    appName: "LifeInbox",
    inboxPlaceholder: "Write anything: a task, thought, goal, habit...",
    today: "Today Plan",
    settings: "Settings",
    aiFallback: "AI is unavailable now, but the item is saved and classified locally.",
  },
} as const;

export function detectLocale(text: string, fallback: Locale = "ru"): Locale {
  if (/[а-яё]/i.test(text)) return "ru";
  if (/[a-z]/i.test(text)) return "en";
  return fallback;
}

export function t(locale: Locale, key: keyof typeof copy.ru): string {
  return copy[locale][key];
}

export function normalizeLifeArea(area: AnyLifeArea | undefined): LifeArea | undefined {
  if (!area) return undefined;
  if (area === "growth") return "learning";
  if (area === "joy") return "hobbies";
  return area;
}

export function mapInboxItemTypeToEntityType(type: InboxItemType): EntityType {
  if (type === "calendar_event" || type === "reminder") return "event";
  if (["idea", "life_problem", "interest_hobby", "advice_request", "unclear"].includes(type)) return "note";
  if (type === "memory") return "memory";
  return entityTypeSchema.safeParse(type).success ? (type as EntityType) : "note";
}
