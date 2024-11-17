/* eslint-disable @typescript-eslint/no-explicit-any */
type WriteEvent = {
  target: object;
  prop: PropertyKey;
};
type GetEvent = WriteEvent & {
  value: any;
};
type HasEvent = WriteEvent & {
  value: boolean;
};
type KeysEvent = {
  target: object;
  value: PropertyKey[];
};

export type WriteLog = Map<object, Set<PropertyKey>>;
export class WriteEventEmitter {
  private writeLog: WriteLog = new Map();
  private batchCounter = 0;
  private ignoreCounter = 0;

  batch<T>(f: () => T): T {
    this.batchCounter++;
    try {
      return f();
    } finally {
      this.batchCounter--;
      if (this.batchCounter === 0 && this.writeLog.size > 0) {
        this.listeners.forEach((listener) => listener(this.writeLog));
        this.writeLog = new Map();
      }
    }
  }

  ignore<T>(f: () => T): T {
    this.ignoreCounter++;
    try {
      return f();
    } finally {
      this.ignoreCounter--;
    }
  }

  private listeners = new Set<(e: WriteLog) => void>();

  on(listener: (e: WriteLog) => void) {
    this.listeners.add(listener);
  }

  off(listener: (e: WriteLog) => void) {
    this.listeners.delete(listener);
  }

  emit(me: WriteEvent) {
    if (this.ignoreCounter > 0) {
      return;
    }
    if (this.batchCounter === 0) {
      this.listeners.forEach((listener) =>
        listener(new Map([[me.target, new Set([me.prop])]])),
      );
    } else {
      if (!this.writeLog.has(me.target)) {
        this.writeLog.set(me.target, new Set());
      }
      this.writeLog.get(me.target)!.add(me.prop);
    }
  }
}

type ReadLog = Map<
  object,
  {
    get: { [prop: PropertyKey]: any };
    has: { [prop: PropertyKey]: boolean };
    keys?: PropertyKey[];
  }
>;
export class ReadEventEmitter {
  private readLogs = new Set<ReadLog>();

  run<T>(f: () => T): [T, ReadLog] {
    const readLog = new Map();
    this.readLogs.add(readLog);
    try {
      const r = f();
      return [r, readLog];
    } finally {
      this.readLogs.delete(readLog);
    }
  }

  emitGet(ge: GetEvent) {
    for (const readLog of this.readLogs.values()) {
      if (!readLog.has(ge.target)) {
        readLog.set(ge.target, { get: {}, has: {} });
      }
      readLog.get(ge.target)!.get[ge.prop] = ge.value;
    }
  }

  emitHas(he: HasEvent) {
    for (const readLog of this.readLogs.values()) {
      if (!readLog.has(he.target)) {
        readLog.set(he.target, { get: {}, has: {} });
      }
      readLog.get(he.target)!.has[he.prop] = he.value;
    }
  }

  emitKeys(ke: KeysEvent) {
    for (const readLog of this.readLogs.values()) {
      if (!readLog.has(ke.target)) {
        readLog.set(ke.target, { get: {}, has: {} });
      }
      readLog.get(ke.target)!.keys = ke.value;
    }
  }
}
