import { describe, expect, test } from "vitest";

describe("pure set", () => {
  test("default", () => {
    let count = 0;
    const p = new Proxy(new Set<PropertyKey>(), {
      get: (target, prop) => {
        if (prop === "add") {
          return (key: PropertyKey) => {
            target.has(key); // doesn't trigger count += 1 since target is not a proxy
            const r = target.add(key);
            return r;
          };
        }
        const r = Reflect.get(target, prop, target);
        if (typeof r === "function") {
          count += 1;
          return r.bind(target); // must bind, otherwise there will be exception
        }
        return r;
      },
    });
    p.add(1); // doesn't trigger count += 1 since add method is handled specially
    expect(count).toBe(0);
  });

  test("size", () => {
    const methods: string[] = [];
    const p = new Proxy(new Set<PropertyKey>(), {
      get: (target, prop) => {
        const r = Reflect.get(target, prop, target);
        if (typeof r === "function") {
          methods.push(prop as string);
          return r.bind(target); // must bind, otherwise there will be exception
        }
        return r;
      },
    });
    p.add(1); // add is a method
    expect(p.size).toBe(1); // size is not a method
    expect(methods).toEqual(["add"]);
  });

  test("other methods", () => {
    const methods: string[] = [];
    const p = new Proxy(new Set<PropertyKey>(), {
      get: (target, prop) => {
        const r = Reflect.get(target, prop, target);
        if (typeof r === "function") {
          methods.push(prop as string);
          return r.bind(target); // must bind, otherwise there will be exception
        }
        return r;
      },
    });
    p.add(1);
    expect(methods).toEqual(["add"]);

    // todo: more methods will be available to Set: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/isSubsetOf
    // so we may need to handle them just like the `forEach` and `keys` methods in src/map-and-set.ts
    // expect(p.isSubsetOf(new Set())).toBe(false);
  });
});
