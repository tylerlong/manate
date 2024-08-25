import { describe, expect, test } from 'vitest';

import { manage } from '../src';
import type { Managed } from '../src/models';

describe('native code', () => {
  test('Map', () => {
    class C {
      public b = { d: 0 };
      public m: Map<string, string> = new Map();
    }
    const c = manage(new C());
    expect((c.b as Managed<{ d: number }>).$e).toBeDefined();
    expect((c.m as Managed<Map<string, string>>).$e).not.toBeDefined();
  });
});
