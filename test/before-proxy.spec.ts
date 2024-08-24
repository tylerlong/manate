import { manage } from '../src';
import type { ManateEvent } from '../src/models';

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
    const events: string[] = [];
    ma.$e.on((event: ManateEvent) => {
      events.push(`${event.name}-${event.pathString}`);
    });
    const b = new B();
    ma.b = b;
    b.c = 1;
    expect(events).toEqual(['set-b']);
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
    const events: string[] = [];
    ma.$e.on((event: ManateEvent) => {
      events.push(`${event.name}-${event.pathString}`);
    });
    const b = new B();
    ma.b = b;
    ma.b.c = 1;
    expect(events).toEqual(['set-b', 'get-b', 'set-b+c']);
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
    const events: string[] = [];
    ma.$e.on((event: ManateEvent) => {
      events.push(`${event.name}-${event.pathString}`);
    });
    const b = new B();
    ma.b = b;
    const mb = ma.b;
    mb.c = 1;
    expect(events).toEqual(['set-b', 'get-b', 'set-b+c']);
  });
});
