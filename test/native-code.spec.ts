import { describe, expect, test } from 'vitest';

import { $, manage } from '../src';

describe('native code', () => {
  test('Map', () => {
    class C {
      public b = { d: 0 };
      public m: Map<string, string> = new Map();
    }
    const c = manage(new C());
    expect($(c.b)).toBeDefined();
    expect(() => $(c.m)).toThrow();
  });
});
