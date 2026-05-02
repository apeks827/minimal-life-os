import { initialLifeState, parseState, serializeState, type LifeState } from "./life-store";

export const lifeStorageKey = "lifeinbox.mvp.state";

export type LifeStorage = {
  load(): LifeState;
  save(state: LifeState): void;
};

export function createBrowserLifeStorage(storage: Storage | undefined): LifeStorage {
  return {
    load: () => (storage ? parseState(storage.getItem(lifeStorageKey)) : initialLifeState),
    save: (state) => {
      storage?.setItem(lifeStorageKey, serializeState(state));
    },
  };
}
