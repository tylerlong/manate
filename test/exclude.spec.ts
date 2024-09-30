import { describe, expect, test } from 'vitest';

import { exclude, manage, type ManateEvent } from '../src';

describe('exclude', () => {
  test('exclude beforewards', () => {
    class A {
      public b = 1;
      public parent: A | null = null;
    }
    const a = new A();
    const ma = manage(a);
    const b = new A();
    exclude(b);
    ma.parent = b;

    const eventsCache: string[] = [];
    ma.$e.on((event: ManateEvent) => {
      eventsCache.push(`${event.name} ${event.pathString}`);
    });

    ma.parent.b = 4;
    expect(eventsCache).toEqual(['get parent']);
  });

  test('exclude afterwards', () => {
    class A {
      public b = 1;
      public parent: A | null = null;
    }
    const a = new A();
    const ma = manage(a);
    const b = new A();
    ma.parent = b;

    const eventsCache: string[] = [];
    ma.$e.on((event: ManateEvent) => {
      eventsCache.push(`${event.name} ${event.pathString}`);
    });

    ma.parent.b = 4;
    expect(eventsCache).toEqual(['get parent', 'set parent+b']);

    eventsCache.length = 0;
    exclude(ma.parent);
    ma.parent.b = 4;
    expect(eventsCache).toEqual(['get parent', 'get parent']);
  });

  test('default-1', () => {
    class A {
      public b: B;
    }
    class B {
      public c = 1;
    }

    const a = new A();
    const b = new B();
    a.b = exclude(b);
    const ma = manage(a);
    const eventsCache: string[] = [];
    ma.$e.on((event: ManateEvent) => {
      eventsCache.push(`${event.name} ${event.pathString}`);
    });
    ma.b.c = 4;
    expect(eventsCache).toEqual(['get b']);
  });

  test('default-2', () => {
    class B {
      public c = 1;
    }
    class A {
      public b = exclude(new B());
    }

    const a = new A();
    const ma = manage(a);
    const eventsCache: string[] = [];
    ma.$e.on((event: ManateEvent) => {
      eventsCache.push(`${event.name} ${event.pathString}`);
    });
    ma.b.c = 4;
    expect(eventsCache).toEqual(['get b']);
  });
});
