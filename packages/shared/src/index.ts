import { z } from "zod";

export const localeSchema = z.enum(["ru", "en"]);
export type Locale = z.infer<typeof localeSchema>;

export const lifeAreaSchema = z.enum([
  "health",
  "career",
  "relationships",
  "finance",
  "growth",
  "home",
  "joy",
  "meaning",
]);
export type LifeArea = z.infer<typeof lifeAreaSchema>;

export const inboxItemTypeSchema = z.enum(["task", "goal", "habit", "note", "event", "memory"]);
export type InboxItemType = z.infer<typeof inboxItemTypeSchema>;

export const prioritySchema = z.enum(["low", "medium", "high"]);
export type Priority = z.infer<typeof prioritySchema>;

export const aiEntitySchema = z.object({
  type: inboxItemTypeSchema,
  title: z.string().min(1).max(160),
  summary: z.string().max(600).optional(),
  lifeArea: lifeAreaSchema.optional(),
  dueAt: z.string().datetime().optional(),
  recurrence: z.string().max(120).optional(),
  priority: prioritySchema.default("medium"),
  confidence: z.number().min(0).max(1),
  needsClarification: z.boolean().default(false),
  clarificationQuestion: z.string().max(240).optional(),
});
export type AiEntity = z.infer<typeof aiEntitySchema>;

export const aiClassificationSchema = z.object({
  status: z.enum(["classified", "needs_clarification", "failed"]),
  source: z.enum(["provider", "heuristic"]),
  locale: localeSchema,
  language: localeSchema,
  safetyNote: z.string().optional(),
  retryable: z.boolean().default(false),
  items: z.array(aiEntitySchema).min(1),
});
export type AiClassification = z.infer<typeof aiClassificationSchema>;

export const onboardingAnswerSchema = z.object({
  focus: z.string().min(1),
  painPoints: z.array(z.string()).default([]),
  preferredTone: z.enum(["gentle", "direct", "coach"]).default("gentle"),
  balanceScores: z.partialRecord(lifeAreaSchema, z.number().min(1).max(10)).default({}),
});
export type OnboardingAnswer = z.infer<typeof onboardingAnswerSchema>;

export const userSettingsSchema = z.object({
  locale: localeSchema.default("ru"),
  aiEnabled: z.boolean().default(true),
  aiTone: z.enum(["gentle", "direct", "coach"]).default("gentle"),
  dailyPlanHour: z.number().int().min(0).max(23).default(8),
  weekStartsOn: z.enum(["monday", "sunday"]).default("monday"),
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
