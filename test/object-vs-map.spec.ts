import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { captureReads, manage } from '../src';

describe('Object vs Map', () => {
  test('object', () => {
    const o = manage({ a: 1, b: 2, c: 3 });
    let [, readLogs] = captureReads(() => {
      expect(Object.keys(o).length).toBe(3);
    });
    expect(inspect(readLogs)).toBe(
      `Map(1) { { a: 1, b: 2, c: 3 } => { get: {}, has: {}, keys: true } }`,
    );

    [, readLogs] = captureReads(() => {
      expect(Object.values(o).length).toBe(3);
    });
    expect(inspect(readLogs)).toBe(
      `Map(1) {
  { a: 1, b: 2, c: 3 } => { get: { a: 1, b: 2, c: 3 }, has: {}, keys: true }
}`,
    );

    [, readLogs] = captureReads(() => {
      expect(Object.entries(o).length).toBe(3);
    });
    expect(inspect(readLogs)).toBe(
      `Map(1) {
  { a: 1, b: 2, c: 3 } => { get: { a: 1, b: 2, c: 3 }, has: {}, keys: true }
}`,
    );
  });

  test('maps', () => {
    const o = manage(
      new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ]),
    );

    let [, readLogs] = captureReads(() => {
      expect(Array.from(o.keys()).length).toBe(3);
    });
    expect(inspect(readLogs)).toBe(`Map(1) {
  Map(3) { 'a' => 1, 'b' => 2, 'c' => 3 } => { get: {}, has: {}, keys: true }
}`);

    [, readLogs] = captureReads(() => {
      expect(Array.from(o.values()).length).toBe(3);
    });
    expect(inspect(readLogs)).toBe(`Map(1) {
  Map(3) { 'a' => 1, 'b' => 2, 'c' => 3 } => { get: { a: 1, b: 2, c: 3 }, has: {}, keys: true }
}`);

    [, readLogs] = captureReads(() => {
      expect(Array.from(o.entries()).length).toBe(3);
    });
    expect(inspect(readLogs)).toBe(`Map(1) {
  Map(3) { 'a' => 1, 'b' => 2, 'c' => 3 } => { get: { a: 1, b: 2, c: 3 }, has: {}, keys: true }
}`);

    [, readLogs] = captureReads(() => {
      const iterator1 = o[Symbol.iterator]();
      for (const item of iterator1) {
        expect(item).toBeDefined();
      }
    });
    expect(inspect(readLogs)).toBe(`Map(1) {
  Map(3) { 'a' => 1, 'b' => 2, 'c' => 3 } => { get: { a: 1, b: 2, c: 3 }, has: {}, keys: true }
}`);

    [, readLogs] = captureReads(() => {
      o.forEach((v, k) => {
        expect(v).toBeDefined();
        expect(k).toBeDefined();
      });
    });
    expect(inspect(readLogs)).toBe(`Map(1) {
  Map(3) { 'a' => 1, 'b' => 2, 'c' => 3 } => { get: { a: 1, b: 2, c: 3 }, has: {}, keys: true }
}`);
  });

  test('map size', () => {
    const o = manage(
      new Map([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ]),
    );

    expect(o.size).toBe(3);
  });

  test('map proxy', () => {
    const map = new Map<string, number>();
    map.set('a', 1);
    const mm = new Proxy(map, {
      get: (target: Map<string, number>, prop: PropertyKey) => {
        const r = Reflect.get(target, prop, target);
        return r;
      },
    });
    expect(mm.size).toBe(1);
  });
});
