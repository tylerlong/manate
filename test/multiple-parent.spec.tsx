// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import React from 'react';

import type { ManateEvent } from '../src/models';
import { manage } from '../src';
import { auto } from '../src/react';

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

  test('game', () => {
    let id = 0;
    class Bullet {
      public id: number;
      public speed = 10;
      public constructor() {
        this.id = id++;
      }
    }
    class Store {
      public bullets: { [key: number]: Bullet } = {};
    }
    const store = manage(new Store());
    store.bullets[0] = new Bullet();
    const events: string[] = [];
    const props = manage({ bullet: store.bullets[0] });
    store.$e.on((event: ManateEvent) => {
      events.push(event.name + '+' + event.pathString);
    });
    expect(props.bullet.speed).toBe(10); // trigger get
    expect(events).toEqual(['get+bullets+0+speed']);
  });

  test('game with React', () => {
    let id = 0;
    class Bullet {
      public id: number;
      public speed = 10;
      public constructor() {
        this.id = id++;
      }
    }
    class Store {
      public bullets: { [key: number]: Bullet } = {};
    }

    const events: string[] = [];
    const BulletComponent = auto((props: { bullet: Bullet }) => {
      events.push('BulletComponent start');
      const { bullet } = props;
      events.push('BulletComponent end');
      return bullet.speed;
    });

    const App = auto((props: { store: Store }) => {
      events.push('App start');
      const { store } = props;
      const temp = Object.values(store.bullets).map((bullet) => <BulletComponent key={bullet.id} bullet={bullet} />);
      events.push('App end');
      return temp;
    });

    const store = manage(new Store());
    store.bullets[0] = new Bullet();
    store.bullets[1] = new Bullet();

    render(<App store={store} />);
    expect(events).toEqual([
      'App start',
      'App end',
      'BulletComponent start',
      'BulletComponent end',
      'BulletComponent start',
      'BulletComponent end',
    ]);
    cleanup();

    // this test case proves that React is "async"
  });
});
