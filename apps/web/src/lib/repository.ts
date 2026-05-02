import type { AiClassification, Locale } from "@life/shared";
import { appendClassification, type LifeState } from "./life-store";
import { hasSupabaseEnv } from "./env";
import type { LifeStorage } from "./storage";

export type ClassifyRequest = { text: string; locale: Locale };

export type InboxRepository = {
  classify(input: ClassifyRequest): Promise<AiClassification>;
  saveClassification(state: LifeState, text: string, classification: AiClassification): Promise<LifeState>;
};

export async function classifyInboxItem(input: ClassifyRequest): Promise<AiClassification> {
  const response = await fetch("/api/inbox/classify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error(`Classification failed: ${response.status}`);
  return (await response.json()) as AiClassification;
}

export function createLocalInboxRepository(storage: LifeStorage): InboxRepository {
  return {
    classify: classifyInboxItem,
    saveClassification: async (state, text, classification) => {
      const next = appendClassification(state, text, classification);
      storage.save(next);
      return next;
    },
  };
}

export type SupabaseInboxRepositoryConfig = {
  saveEndpoint?: string;
};

export function createSupabaseReadyInboxRepository(config: SupabaseInboxRepositoryConfig = {}): InboxRepository {
  const saveEndpoint = config.saveEndpoint ?? "/api/inbox/items";
  return {
    classify: classifyInboxItem,
    saveClassification: async (state, text, classification) => {
      const response = await fetch(saveEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, classification }),
      });
      if (!response.ok) throw new Error(`Inbox persistence failed: ${response.status}`);
      return appendClassification(state, text, classification);
    },
  };
}

export function createConfiguredInboxRepository(storage: LifeStorage): InboxRepository {
  return hasSupabaseEnv() ? createSupabaseReadyInboxRepository() : createLocalInboxRepository(storage);
}
