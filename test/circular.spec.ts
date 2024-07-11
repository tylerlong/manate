import { manage } from '../src';

describe('circular', () => {
  test('default', () => {
    class A {
      public b = 1;
      public parent: A | null = null;
    }
    const a = new A();
    const b = new A();
    const ma = manage(a);
    const mb = manage(b);
    ma.parent = mb;
    mb.parent = ma;
  });
});
