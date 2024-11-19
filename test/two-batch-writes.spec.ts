import { describe, expect, test } from 'vitest';

import { batchWrites, manage } from '../src';

describe('two batch writes', () => {
  test('default', () => {
    class A {
      public b = { c: 0 };
    }
    const ma = manage(new A());
    const [, writeLog] = batchWrites(() => {});
    expect(writeLog.size).toBe(0);
    batchWrites(() => {
      ma.b.c = 1;
    });
    expect(writeLog.size).toBe(0); // writeLog should not change afterwards
  });
});
