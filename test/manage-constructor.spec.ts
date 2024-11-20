import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { manage, runInAction } from '../src';

describe('manage constructor', () => {
  test('default', () => {
    class A {
      b = 0;

      constructor() {}
    }

    const a = manage(new A());
    const [, writeLog] = runInAction(() => {
      a.b = 1;
    });
    expect(inspect(writeLog)).toBe(
      `Map(1) { A { b: 1 } => Map(1) { 'b' => 0 } }`,
    );
  });

  test('auto manage', () => {
    class A {
      b = 0;

      constructor() {
        return manage(this);
      }
    }

    const a = new A();
    const [, writeLog] = runInAction(() => {
      a.b = 1;
    });
    expect(inspect(writeLog)).toBe(
      `Map(1) { A { b: 1 } => Map(1) { 'b' => 0 } }`,
    );
  });
});
