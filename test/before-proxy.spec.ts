import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { manage, writeEmitter } from '../src';
import { WriteLog } from '../src/events/types';

describe('before proxy', () => {
  test("Update an object before it's proxied", () => {
    class A {
      public b: B;
    }

    class B {
      public c = 0;
    }

    const a = new A();
    const ma = manage(a);
    const writeLogs: WriteLog[] = [];
    writeEmitter.on((writeLog: WriteLog) => {
      writeLogs.push(writeLog);
    });
    const b = new B();
    ma.b = b;
    b.c = 1;
    expect(inspect(writeLogs)).toEqual(
      "[ Map(1) { A { b: [B] } => Map(1) { 'b' => 1 } } ]",
    );
  });

  test("Update an object after it's proxied", () => {
    class A {
      public b: B;
    }

    class B {
      public c = 0;
    }

    const a = new A();
    const ma = manage(a);
    const writeLogs: WriteLog[] = [];
    writeEmitter.on((writeLog: WriteLog) => {
      writeLogs.push(writeLog);
    });
    const b = new B();
    ma.b = b;
    ma.b.c = 1;
    expect(inspect(writeLogs)).toEqual(
      `
[
  Map(1) { A { b: [B] } => Map(1) { 'b' => 1 } },
  Map(1) { B { c: 1 } => Map(1) { 'c' => 0 } }
]
`.trim(),
    );
  });

  test("Update an object after it's proxied - 2", () => {
    class A {
      public b: B;
    }

    class B {
      public c = 0;
    }

    const a = new A();
    const ma = manage(a);
    const writeLogs: WriteLog[] = [];
    writeEmitter.on((writeLog: WriteLog) => {
      writeLogs.push(writeLog);
    });
    const b = new B();
    ma.b = b;
    const mb = ma.b;
    mb.c = 1;
    expect(inspect(writeLogs)).toEqual(
      `
[
  Map(1) { A { b: [B] } => Map(1) { 'b' => 1 } },
  Map(1) { B { c: 1 } => Map(1) { 'c' => 0 } }
]
      `.trim(),
    );
  });
});
