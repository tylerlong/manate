// deno-lint-ignore-file no-explicit-any
import readEmitter from "./events/read-emitter.ts";
import writeEmitter from "./events/write-emitter.ts";

export const mapGet = <V>(target: Map<PropertyKey, V>, prop: PropertyKey) => {
  const r = Reflect.get(target, prop, target);
  if (typeof r === "function") {
    switch (prop) {
      case "get": {
        return (key: PropertyKey) => {
          const r = target.get(key);
          readEmitter.emitGet({ target, prop: key, value: r });
          return r;
        };
      }
      case "set": {
        return (key: PropertyKey, value: any) => {
          const has = target.has(key);
          const r = target.set(key, value);
          writeEmitter.emit({ target, prop: key, value: has ? 0 : 1 });
          return r;
        };
      }
      case "has": {
        return (key: PropertyKey) => {
          const r = target.has(key);
          readEmitter.emitHas({ target, prop: key, value: r });
          return r;
        };
      }
      case "delete": {
        return (key: PropertyKey) => {
          const r = target.delete(key);
          writeEmitter.emit({ target, prop: key, value: r ? -1 : 0 });
          return r;
        };
      }
      case "keys": {
        return () => {
          const r = target.keys();
          readEmitter.emitKeys({ target });
          return r;
        };
      }
      case "clear": {
        return () => {
          for (const key of target.keys()) {
            writeEmitter.emit({ target, prop: key, value: -1 });
          }
          target.clear();
        };
      }
      case "values":
      case "entries":
      case Symbol.iterator:
      case "forEach": {
        return (...args: any[]) => {
          const r = Reflect.get(target, prop).apply(target, args);
          readEmitter.emitKeys({ target });
          for (const key of target.keys()) {
            readEmitter.emitGet({
              target,
              prop: key,
              value: target.get(key),
            });
          }
          return r;
        };
      }
      default: {
        return r.bind(target);
      }
    }
  }
  if (prop === "size") {
    readEmitter.emitKeys({ target });
  }
  return r;
};

export const setGet = (target: Set<PropertyKey>, prop: PropertyKey) => {
  const r = Reflect.get(target, prop, target);
  if (typeof r === "function") {
    switch (prop) {
      case "add": {
        return (key: PropertyKey) => {
          const has = target.has(key);
          const r = target.add(key);
          writeEmitter.emit({ target, prop: key, value: has ? 0 : 1 });
          return r;
        };
      }
      case "has": {
        return (key: PropertyKey) => {
          const r = target.has(key);
          readEmitter.emitHas({ target, prop: key, value: r });
          return r;
        };
      }
      case "delete": {
        return (key: PropertyKey) => {
          const r = target.delete(key);
          writeEmitter.emit({ target, prop: key, value: r ? -1 : 0 });
          return r;
        };
      }
      case "clear": {
        return () => {
          for (const key of target.keys()) {
            writeEmitter.emit({ target, prop: key, value: -1 });
          }
          target.clear();
        };
      }
      case "keys":
      case "values":
      case "entries":
      case Symbol.iterator:
      case "forEach": {
        return (...args: any[]) => {
          const r = Reflect.get(target, prop).apply(target, args);
          readEmitter.emitKeys({ target });
          return r;
        };
      }
      default: {
        return r.bind(target);
      }
    }
  }
  if (prop === "size") {
    readEmitter.emitKeys({ target });
  }
  return r;
};
