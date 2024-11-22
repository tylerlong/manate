// @vitest-environment jsdom
import { inspect } from 'util';

import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';

import { capture, manage, runInAction } from '../src';
import { auto } from '../src/react';

describe('multiple parent', () => {
  test('default', () => {
    const a = { b: { c: 0 } };
    const ma = manage(a);
    const d = { b: ma.b };
    const md = manage(d);
    d.b.c = 1;
    let [, writeLog] = runInAction(() => {
      d.b.c = 1;
    });
    expect(inspect(writeLog)).toBe(
      `Map(1) { { c: 1 } => Map(1) { 'c' => 0 } }`,
    );

    [, writeLog] = runInAction(() => {
      const [, readLog] = capture(() => {
        md.b.c = 2;
      });
      expect(inspect(readLog)).toBe(
        `Map(1) { { b: { c: 2 } } => { get: Map(1) { 'b' => [Object] } } }`,
      );
    });
    expect(inspect(writeLog)).toBe(
      `Map(1) { { c: 2 } => Map(1) { 'c' => 0 } }`,
    );

    [, writeLog] = runInAction(() => {
      a.b.c = 3;
    });
    expect(inspect(writeLog)).toBe(
      `Map(1) { { c: 3 } => Map(1) { 'c' => 0 } }`,
    );

    [, writeLog] = runInAction(() => {
      const [, readLog] = capture(() => {
        ma.b.c = 4;
      });
      expect(inspect(readLog)).toBe(
        `Map(1) { { b: { c: 4 } } => { get: Map(1) { 'b' => [Object] } } }`,
      );
    });
    expect(inspect(writeLog)).toBe(
      `Map(1) { { c: 4 } => Map(1) { 'c' => 0 } }`,
    );
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
    const props = manage({ bullet: store.bullets[0] });
    const [, readLog] = capture(() => {
      expect(props.bullet.speed).toBe(10); // trigger get
    });
    expect(inspect(readLog)).toBe(`Map(2) {
  { bullet: Bullet { speed: 10, id: 0 } } => { get: Map(1) { 'bullet' => [Bullet] } },
  Bullet { speed: 10, id: 0 } => { get: Map(1) { 'speed' => 10 } }
}`);
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
      const temp = Object.values(store.bullets).map((bullet) => (
        <BulletComponent key={bullet.id} bullet={bullet} />
      ));
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

  test('plain React', () => {
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
    const BulletComponent = (props: { bullet: Bullet }) => {
      events.push('BulletComponent start');
      const { bullet } = props;
      events.push('BulletComponent end');
      return bullet.speed;
    };

    const App = (props: { store: Store }) => {
      events.push('App start');
      const { store } = props;
      const temp = Object.values(store.bullets).map((bullet) => (
        <BulletComponent key={bullet.id} bullet={bullet} />
      ));
      events.push('App end');
      return temp;
    };

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
