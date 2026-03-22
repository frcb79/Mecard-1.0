type LocalStorageRecord = Record<string, string>;

const createMemoryStorage = () => {
  let store: LocalStorageRecord = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      store = {};
    },
    getItem(key: string): string | null {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    key(index: number): string | null {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    },
    removeItem(key: string) {
      delete store[key];
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
  } satisfies Storage;
};

const ensureLocalStorage = () => {
  const maybeStorage = (globalThis as { localStorage?: Partial<Storage> }).localStorage;

  if (
    maybeStorage &&
    typeof maybeStorage.getItem === 'function' &&
    typeof maybeStorage.setItem === 'function' &&
    typeof maybeStorage.clear === 'function'
  ) {
    return;
  }

  Object.defineProperty(globalThis, 'localStorage', {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  });
};

ensureLocalStorage();
