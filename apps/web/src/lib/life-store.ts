import type { AiClassification, AiEntity, Locale, OnboardingAnswer, UserSettings } from "@life/shared";
import { mapInboxItemTypeToEntityType, normalizeLifeArea } from "@life/shared";

export type LifeRecord = AiEntity & {
  id: string;
  inboxId: string;
  createdAt: string;
  completedAt?: string | null;
};

export type InboxRecord = {
  id: string;
  text: string;
  classification: AiClassification;
  createdAt: string;
  completedAt?: string | null;
};

export type LifeState = {
  inbox: InboxRecord[];
  records: LifeRecord[];
  settings: UserSettings;
  onboarding: OnboardingAnswer | null;
};

export const defaultSettings: UserSettings = {
  locale: "ru",
  language: "ru",
  aiEnabled: true,
  aiTone: "gentle",
  dailyPlanHour: 8,
  dailyTaskCount: 5,
  weekStartsOn: "monday",
  suggestionAggressiveness: "medium",
  autoIntegrationMode: "ask",
  focusAreas: [],
  protectedAreas: ["health", "relationships", "rest"],
  notifications: { enabled: false, dailyPlan: false },
  privacy: { storeAiMemory: false, allowAnalytics: false },
  testMode: false,
};

export const initialLifeState: LifeState = {
  inbox: [],
  records: [],
  settings: defaultSettings,
  onboarding: null,
};

export function appendClassification(state: LifeState, text: string, classification: AiClassification): LifeState {
  const now = new Date().toISOString();
  const inboxId = cryptoSafeId("inbox");
  const records = classification.items.map((item) => {
    const entityType = mapInboxItemTypeToEntityType(item.type);
    const lifeArea = normalizeLifeArea(item.life_area ?? item.lifeArea);
    return {
      ...item,
      type: entityType,
      lifeArea,
      life_area: lifeArea,
      id: cryptoSafeId(entityType),
      inboxId,
      createdAt: now,
    };
  });

  return {
    ...state,
    inbox: [{ id: inboxId, text, classification, createdAt: now }, ...state.inbox],
    records: [...records, ...state.records],
  };
}

export function updateLocale(state: LifeState, locale: Locale): LifeState {
  return updateSettings(state, { locale, language: locale });
}

export function toggleRecordCompleted(state: LifeState, recordId: string): LifeState {
  const now = new Date().toISOString();
  return {
    ...state,
    records: state.records.map((record) => (record.id === recordId ? { ...record, completedAt: record.completedAt ? null : now } : record)),
  };
}

export function deleteRecord(state: LifeState, recordId: string): LifeState {
  return { ...state, records: state.records.filter((record) => record.id !== recordId) };
}

export function updateSettings(state: LifeState, settings: Partial<UserSettings>): LifeState {
  return { ...state, settings: { ...state.settings, ...settings } };
}

export function updateOnboarding(state: LifeState, onboarding: OnboardingAnswer): LifeState {
  return {
    ...state,
    onboarding,
    settings: { ...state.settings, aiTone: onboarding.preferredTone },
  };
}

export function todayPlan(records: LifeRecord[]): LifeRecord[] {
  const weight = { high: 3, medium: 2, low: 1 } as const;
  return records
    .filter((record) => ["task", "event", "habit"].includes(record.type) && !record.completedAt)
    .slice()
    .sort((a, b) => weight[b.priority] - weight[a.priority])
    .slice(0, 6);
}

export function recordsByType(records: LifeRecord[], type: LifeRecord["type"]): LifeRecord[] {
  return records.filter((record) => record.type === type);
}

export function serializeState(state: LifeState): string {
  return JSON.stringify(state);
}

export function parseState(raw: string | null): LifeState {
  if (!raw) return initialLifeState;
  try {
    const parsed = JSON.parse(raw) as Partial<LifeState>;
    return {
      inbox: Array.isArray(parsed.inbox) ? parsed.inbox : [],
      records: Array.isArray(parsed.records) ? parsed.records : [],
      settings: { ...defaultSettings, ...parsed.settings },
      onboarding: parsed.onboarding ?? null,
    };
  } catch {
    return initialLifeState;
  }
}

function cryptoSafeId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
