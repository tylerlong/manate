import { describe, expect, test } from 'vitest';

import { manage, runInAction } from '../src';

describe('two batch writes', () => {
  test('default', () => {
    class A {
      public b = { c: 0 };
    }
    const ma = manage(new A());
    const [, writeLog] = runInAction(() => {});
    expect(writeLog.size).toBe(0);
    runInAction(() => {
      ma.b.c = 1;
    });
    expect(writeLog.size).toBe(0); // writeLog should not change afterwards
  });
});
