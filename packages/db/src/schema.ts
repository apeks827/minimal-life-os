import { pgEnum, pgTable, text, timestamp, uuid, jsonb, integer, boolean, date } from "drizzle-orm/pg-core";

export const localeEnum = pgEnum("locale", ["ru", "en"]);
export const inboxStatusEnum = pgEnum("inbox_status", ["pending", "classified", "needs_clarification", "failed"]);
export const entityTypeEnum = pgEnum("entity_type", ["task", "goal", "habit", "note", "event", "memory"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  locale: localeEnum("locale").notNull().default("ru"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  userId: uuid("user_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
  aiEnabled: boolean("ai_enabled").notNull().default(true),
  aiTone: text("ai_tone").notNull().default("gentle"),
  dailyPlanHour: integer("daily_plan_hour").notNull().default(8),
  weekStartsOn: text("week_starts_on").notNull().default("monday"),
});

export const onboardingAnswers = pgTable("onboarding_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  answers: jsonb("answers").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inboxItems = pgTable("inbox_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  rawText: text("raw_text").notNull(),
  status: inboxStatusEnum("status").notNull().default("pending"),
  classification: jsonb("classification"),
  retryable: boolean("retryable").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  inboxItemId: uuid("inbox_item_id").references(() => inboxItems.id),
  title: text("title").notNull(),
  priority: priorityEnum("priority").notNull().default("medium"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  area: text("area"),
  targetDate: date("target_date"),
});

export const habits = pgTable("habits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  recurrence: text("recurrence").notNull().default("daily"),
  active: boolean("active").notNull().default(true),
});

export const habitLogs = pgTable("habit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  habitId: uuid("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  loggedOn: date("logged_on").notNull(),
  value: integer("value").notNull().default(1),
});

export const lifeAreas = pgTable("life_areas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  label: text("label").notNull(),
});

export const balanceScores = pgTable("balance_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  areaKey: text("area_key").notNull(),
  score: integer("score").notNull(),
  scoredOn: date("scored_on").notNull(),
});

export const suggestions = pgTable("suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  source: text("source").notNull().default("system"),
  dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
});

export const memories = pgTable("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  tags: jsonb("tags").notNull().default([]),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
});

export const dailyPlans = pgTable("daily_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  planDate: date("plan_date").notNull(),
  items: jsonb("items").notNull().default([]),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  payload: jsonb("payload").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
