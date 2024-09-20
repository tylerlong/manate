import { describe, expect, test } from 'vitest';

import type { ManateEvent } from '../src/models';
import { manage } from '../src';

describe('multiple parent', () => {
  test('default', () => {
    const a = { b: { c: 0 } };
    const ma = manage(a);
    const d = { b: ma.b };
    const md = manage(d);
    const eventsA: string[] = [];
    ma.$e.on((event: ManateEvent) => {
      eventsA.push(event.name + '+' + event.pathString);
    });
    const eventsD: string[] = [];
    md.$e.on((event: ManateEvent) => {
      eventsD.push(event.name + '+' + event.pathString);
    });
    d.b.c = 1;
    expect(eventsA).toEqual(['set+b+c']);
    expect(eventsD).toEqual(['set+b+c']);

    eventsA.length = 0;
    eventsD.length = 0;
    md.b.c = 2;
    expect(eventsA).toEqual(['set+b+c']);
    expect(eventsD).toEqual(['get+b', 'set+b+c']);

    eventsA.length = 0;
    eventsD.length = 0;
    a.b.c = 3;
    expect(eventsA).toEqual(['set+b+c']);
    expect(eventsD).toEqual(['set+b+c']);

    eventsA.length = 0;
    eventsD.length = 0;
    ma.b.c = 4;
    expect(eventsA).toEqual(['get+b', 'set+b+c']);
    expect(eventsD).toEqual(['set+b+c']);
  });
});
