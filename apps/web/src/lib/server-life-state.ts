import type { AiClassification, AiEntity, Locale, OnboardingAnswer, UserSettings } from "@life/shared";
import { defaultSettings, initialLifeState, type InboxRecord, type LifeRecord, type LifeState } from "./life-store";

type SelectResult<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

type SupabaseReader = {
  from(table: string): {
    select(columns?: string): { order(column: string, options?: { ascending?: boolean }): SelectResult<unknown> };
  };
};

type DbInbox = { id: string; raw_text: string; classification: AiClassification | null; created_at: string };
type DbTask = { id: string; inbox_item_id: string | null; title: string; priority: LifeRecord["priority"]; due_at: string | null };
type DbGoal = { id: string; inbox_item_id: string | null; title: string; area: LifeRecord["lifeArea"] | null; target_date: string | null };
type DbHabit = { id: string; inbox_item_id: string | null; title: string; recurrence: string | null };
type DbEvent = { id: string; inbox_item_id: string | null; title: string; starts_at: string | null };
type DbMemory = { id: string; inbox_item_id: string | null; content: string; tags: string[] | null };
type DbSettings = Partial<UserSettings>;
type DbProfile = { locale: Locale | null };
type DbOnboarding = { answers: OnboardingAnswer; created_at: string };
type DbBalanceScore = { area_key: keyof OnboardingAnswer["balanceScores"]; score: number; scored_on: string };

export async function loadServerLifeState(supabase: SupabaseReader): Promise<LifeState> {
  const [inbox, tasks, goals, habits, events, memories, settings, profiles, onboarding, balanceScores] = await Promise.all([
    selectOrdered<DbInbox>(supabase, "inbox_items", "id, raw_text, classification, created_at"),
    selectOrdered<DbTask>(supabase, "tasks", "id, inbox_item_id, title, priority, due_at"),
    selectOrdered<DbGoal>(supabase, "goals", "id, inbox_item_id, title, area, target_date"),
    selectOrdered<DbHabit>(supabase, "habits", "id, inbox_item_id, title, recurrence"),
    selectOrdered<DbEvent>(supabase, "events", "id, inbox_item_id, title, starts_at"),
    selectOrdered<DbMemory>(supabase, "memories", "id, inbox_item_id, content, tags"),
    selectOrdered<DbSettings>(supabase, "settings", "aiEnabled:ai_enabled, aiTone:ai_tone, dailyPlanHour:daily_plan_hour, weekStartsOn:week_starts_on"),
    selectOrdered<DbProfile>(supabase, "profiles", "locale"),
    selectOrdered<DbOnboarding>(supabase, "onboarding_answers", "answers, created_at"),
    selectOrdered<DbBalanceScore>(supabase, "balance_scores", "area_key, score, scored_on"),
  ]);

  const inboxRecords = inbox.map(toInboxRecord);
  const createdAtByInbox = new Map(inboxRecords.map((item) => [item.id, item.createdAt]));
  const records: LifeRecord[] = [
    ...tasks.map((item) => taskToRecord(item, createdAtByInbox)),
    ...goals.map((item) => goalToRecord(item, createdAtByInbox)),
    ...habits.map((item) => habitToRecord(item, createdAtByInbox)),
    ...events.map((item) => eventToRecord(item, createdAtByInbox)),
    ...memories.map((item) => memoryToRecord(item, createdAtByInbox)),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    ...initialLifeState,
    inbox: inboxRecords,
    records,
    settings: { ...defaultSettings, ...settings[0], locale: profiles[0]?.locale ?? settings[0]?.locale ?? defaultSettings.locale },
    onboarding: mergeOnboarding(onboarding[0]?.answers, balanceScores),
  };
}

async function selectOrdered<T>(supabase: SupabaseReader, table: string, columns: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select(columns).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

function toInboxRecord(item: DbInbox): InboxRecord {
  return {
    id: item.id,
    text: item.raw_text,
    classification: item.classification ?? emptyClassification(item.raw_text),
    createdAt: item.created_at,
  };
}

function taskToRecord(item: DbTask, createdAtByInbox: Map<string, string>): LifeRecord {
  return baseRecord(item.id, item.inbox_item_id, createdAtByInbox, { type: "task", title: item.title, priority: item.priority, dueAt: item.due_at ?? undefined });
}

function goalToRecord(item: DbGoal, createdAtByInbox: Map<string, string>): LifeRecord {
  return baseRecord(item.id, item.inbox_item_id, createdAtByInbox, { type: "goal", title: item.title, priority: "medium", lifeArea: item.area ?? undefined, dueAt: item.target_date ?? undefined });
}

function habitToRecord(item: DbHabit, createdAtByInbox: Map<string, string>): LifeRecord {
  return baseRecord(item.id, item.inbox_item_id, createdAtByInbox, { type: "habit", title: item.title, priority: "medium", recurrence: item.recurrence ?? undefined });
}

function eventToRecord(item: DbEvent, createdAtByInbox: Map<string, string>): LifeRecord {
  return baseRecord(item.id, item.inbox_item_id, createdAtByInbox, { type: "event", title: item.title, priority: "medium", dueAt: item.starts_at ?? undefined });
}

function memoryToRecord(item: DbMemory, createdAtByInbox: Map<string, string>): LifeRecord {
  return baseRecord(item.id, item.inbox_item_id, createdAtByInbox, { type: item.tags?.includes("note") ? "note" : "memory", title: item.content.slice(0, 120), summary: item.content, priority: "low" });
}

function baseRecord(id: string, inboxId: string | null, createdAtByInbox: Map<string, string>, item: Partial<AiEntity> & Pick<AiEntity, "type" | "title">): LifeRecord {
  return { ...item, id, inboxId: inboxId ?? id, createdAt: createdAtByInbox.get(inboxId ?? "") ?? new Date(0).toISOString(), priority: item.priority ?? "medium", confidence: item.confidence ?? 1, effort: item.effort ?? "small", needsClarification: item.needsClarification ?? false };
}

function emptyClassification(text: string): AiClassification {
  return { status: "classified", source: "heuristic", locale: "ru", language: "ru", retryable: false, suggestions: [], items: [{ type: "note", title: text.slice(0, 120), priority: "low", effort: "small", confidence: 1, needsClarification: false }] };
}

function mergeOnboarding(answer: OnboardingAnswer | undefined, scores: DbBalanceScore[]): OnboardingAnswer | null {
  if (!answer && scores.length === 0) return null;
  const balanceScores = scores.reduce<OnboardingAnswer["balanceScores"]>((acc, item) => ({ ...acc, [item.area_key]: item.score }), answer?.balanceScores ?? {});
  return {
    focus: answer?.focus ?? "",
    painPoints: answer?.painPoints ?? [],
    preferredTone: answer?.preferredTone ?? "gentle",
    balanceScores,
    choices: answer?.choices ?? [],
    energyLevel: answer?.energyLevel ?? "medium",
    openAnswer: answer?.openAnswer,
  };
}
