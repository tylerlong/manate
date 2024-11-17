import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { manage, readEmitter, writeEmitter } from '../src';
import { WriteLog } from '../src/events/types';

describe('index', () => {
  test('default', () => {
    const managed = manage({ a: 'hello', b: { c: 'world' } });
    const writeLogs: WriteLog[] = [];
    writeEmitter.on((e) => {
      writeLogs.push(e);
    });
    const [, readLogs] = readEmitter.run(() => {
      managed.a = 'world';
      managed.b.c = 'yes!';
    });
    expect(inspect(readLogs)).toBe(`Map(1) {
  { a: 'world', b: { c: 'yes!' } } => { get: { b: [Object] }, has: {} }
}`);
    expect(inspect(writeLogs)).toBe(`[
  Map(1) { { a: 'world', b: [Object] } => Map(1) { 'a' => 0 } },
  Map(1) { { c: 'yes!' } => Map(1) { 'c' => 0 } }
]`);
  });

  test('subscribe to sub prop', () => {
    const o = { a: 'hello', b: { c: 'world' } };
    const managed = manage(o);
    const writeLogs: WriteLog[] = [];
    writeEmitter.on((e) => {
      writeLogs.push(e);
    });
    const [, readLogs] = readEmitter.run(() => {
      writeEmitter.batch(() => {
        managed.b.c = 'yes!';
        console.log(managed.b.c);
      });
    });
    expect(writeLogs.length).toBe(1);
    const writeLog = writeLogs[0];
    expect(inspect(writeLog)).toBe(
      `Map(1) { { c: 'yes!' } => Map(1) { 'c' => 0 } }`,
    );
    expect(inspect(readLogs)).toBe(`Map(2) {
  { a: 'hello', b: { c: 'yes!' } } => { get: { b: [Object] }, has: {} },
  { c: 'yes!' } => { get: { c: 'yes!' }, has: {} }
}`);
    const writeKeys = Array.from(writeLog.keys());
    const readKeys = Array.from(readLogs.keys());
    expect(writeKeys[0]).toBe(readKeys[1]);
  });

  test('new obj as prop', () => {
    interface A {
      b?: { c: string };
    }
    const managed = manage<A>({});
    const writeLogs: WriteLog[] = [];
    writeEmitter.on((e) => {
      writeLogs.push(e);
    });
    const [, readLogs] = readEmitter.run(() => {
      writeEmitter.batch(() => {
        managed.b = { c: 'hello' };
        managed.b.c = 'world';
      });
    });
    expect(inspect(readLogs)).toBe(
      `Map(1) { { b: { c: 'world' } } => { get: { b: [Object] }, has: {} } }`,
    );
    expect(inspect(writeLogs)).toBe(`[
  Map(2) {
    { b: [Object] } => Map(1) { 'b' => 1 },
    { c: 'world' } => Map(1) { 'c' => 0 }
  }
]`);
  });

  test('set same obj multiple times', () => {
    interface A {
      b?: { c: string };
    }
    const managed = manage<A>({});

    const writeLogs: WriteLog[] = [];
    writeEmitter.on((e) => {
      writeLogs.push(e);
    });
    const [, readLogs] = readEmitter.run(() => {
      writeEmitter.batch(() => {
        managed.b = { c: 'hello' };
        const temp = managed.b;
        managed.b = temp;
        managed.b = temp;
        managed.b.c = 'world';
      });
    });
    expect(inspect(readLogs)).toBe(
      `Map(1) { { b: { c: 'world' } } => { get: { b: [Object] }, has: {} } }`,
    );
    expect(inspect(writeLogs)).toBe(`[
  Map(2) {
    { b: [Object] } => Map(1) { 'b' => 1 },
    { c: 'world' } => Map(1) { 'c' => 0 }
  }
]`);
  });

  test('to JSON', () => {
    const managed = manage({ a: 'hello', b: { c: 'world' } });
    expect(JSON.stringify(managed)).toBe('{"a":"hello","b":{"c":"world"}}');
  });
});
