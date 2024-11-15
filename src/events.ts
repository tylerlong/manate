/* eslint-disable @typescript-eslint/no-explicit-any */
export type WriteEvent = {
  target: object;
  prop: PropertyKey;
};
export type GetEvent = WriteEvent & {
  value: any;
};
export type HasEvent = WriteEvent & {
  value: boolean;
};
export type KeysEvent = {
  target: object;
  value: PropertyKey[];
};

export type WriteCache = Map<object, Set<PropertyKey>>;
export class WriteEventEmitter {
  private cache: WriteCache = new Map();
  private batchCounter = 0;

  public batch<T>(f: () => T): T {
    this.batchCounter++;
    try {
      return f();
    } finally {
      this.batchCounter--;
      if (this.batchCounter === 0 && this.cache.size > 0) {
        console.log('emit cache', this.cache);
        this.listeners.forEach((listener) => listener(this.cache));
        this.cache.clear();
      }
    }
  }

  listeners = new Set<(e: WriteEvent | WriteCache) => void>();

  on(listener: (e: WriteEvent | WriteCache) => void) {
    this.listeners.add(listener);
  }

  off(listener: (e: WriteEvent | WriteCache) => void) {
    this.listeners.delete(listener);
  }

  emit(me: WriteEvent) {
    if (this.batchCounter === 0) {
      this.listeners.forEach((listener) => listener(me));
    } else {
      if (!this.cache.has(me.target)) {
        this.cache.set(me.target, new Set());
      }
      this.cache.get(me.target)!.add(me.prop);
    }
  }
}

type ReadCache = Map<
  object,
  {
    get: { [prop: PropertyKey]: any };
    has: { [prop: PropertyKey]: boolean };
    keys?: PropertyKey[];
  }
>;
export class ReadEventEmitter {
  private caches = new Set<ReadCache>();

  run<T>(f: () => T): [T, ReadCache] {
    const readCache = new Map();
    this.caches.add(readCache);
    try {
      const r = f();
      return [r, readCache];
    } finally {
      this.caches.delete(readCache);
    }
  }

  emitGet(ge: GetEvent) {
    for (const cache of this.caches.values()) {
      if (!cache.has(ge.target)) {
        cache.set(ge.target, { get: {}, has: {} });
      }
      cache.get(ge.target)!.get[ge.prop] = ge.value;
    }
  }

  emitHas(he: HasEvent) {
    for (const cache of this.caches.values()) {
      if (!cache.has(he.target)) {
        cache.set(he.target, { get: {}, has: {} });
      }
      cache.get(he.target)!.has[he.prop] = he.value;
    }
  }

  emitKeys(ke: KeysEvent) {
    for (const cache of this.caches.values()) {
      if (!cache.has(ke.target)) {
        cache.set(ke.target, { get: {}, has: {} });
      }
      cache.get(ke.target)!.keys = ke.value;
    }
  }
}
