import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { captureReads, manage, runInAction } from '../src';

describe('index', () => {
  test('default', () => {
    const managed = manage({ a: 'hello', b: { c: 'world' } });
    const [, writeLog] = runInAction(() => {
      const [, readLog] = captureReads(() => {
        managed.a = 'world';
        managed.b.c = 'yes!';
      });
      expect(inspect(readLog)).toBe(`Map(1) {
  { a: 'world', b: { c: 'yes!' } } => { get: Map(1) { 'b' => [Object] } }
}`);
    });
    expect(inspect(writeLog)).toBe(`Map(2) {
  { a: 'world', b: { c: 'yes!' } } => Map(1) { 'a' => 0 },
  { c: 'yes!' } => Map(1) { 'c' => 0 }
}`);
  });

  test('subscribe to sub prop', () => {
    const o = { a: 'hello', b: { c: 'world' } };
    const managed = manage(o);
    const [writeLog, readLog] = captureReads(() => {
      const [, writeLog] = runInAction(() => {
        managed.b.c = 'yes!';
        expect(managed.b.c).toBe('yes!');
      });
      return writeLog;
    });
    expect(inspect(writeLog)).toBe(
      `Map(1) { { c: 'yes!' } => Map(1) { 'c' => 0 } }`,
    );
    expect(inspect(readLog)).toBe(`Map(2) {
  { a: 'hello', b: { c: 'yes!' } } => { get: Map(1) { 'b' => [Object] } },
  { c: 'yes!' } => { get: Map(1) { 'c' => 'yes!' } }
}`);
    expect(writeLog.keys().next().value).toBe(Array.from(readLog.keys())[1]);
  });

  test('new obj as prop', () => {
    interface A {
      b?: { c: string };
    }
    const managed = manage<A>({});
    const [, readLog] = captureReads(() => {
      const [, writeLog] = runInAction(() => {
        managed.b = { c: 'hello' };
        managed.b.c = 'world';
      });
      expect(inspect(writeLog)).toBe(
        `Map(2) {
  { b: { c: 'world' } } => Map(1) { 'b' => 1 },
  { c: 'world' } => Map(1) { 'c' => 0 }
}`,
      );
    });
    expect(inspect(readLog)).toBe(
      `Map(1) { { b: { c: 'world' } } => { get: Map(1) { 'b' => [Object] } } }`,
    );
  });

  test('set same obj multiple times', () => {
    interface A {
      b?: { c: string };
    }
    const managed = manage<A>({});
    const [, readLog] = captureReads(() => {
      const [, writeLog] = runInAction(() => {
        managed.b = { c: 'hello' };
        const temp = managed.b;
        managed.b = temp;
        managed.b = temp;
        managed.b.c = 'world';
      });
      expect(inspect(writeLog)).toBe(
        `Map(2) {
  { b: { c: 'world' } } => Map(1) { 'b' => 1 },
  { c: 'world' } => Map(1) { 'c' => 0 }
}`,
      );
    });
    expect(inspect(readLog)).toBe(
      `Map(1) { { b: { c: 'world' } } => { get: Map(1) { 'b' => [Object] } } }`,
    );
  });

  test('to JSON', () => {
    const managed = manage({ a: 'hello', b: { c: 'world' } });
    expect(JSON.stringify(managed)).toBe('{"a":"hello","b":{"c":"world"}}');
  });
});
