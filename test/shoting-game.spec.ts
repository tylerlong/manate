import { inspect } from 'util';

import { describe, expect, test } from 'vitest';

import { capture, manage, runInAction } from '../src';

describe('shot gaming', () => {
  test('default', () => {
    class Game {
      public gun = new Gun();
    }

    class Gun {
      public bullets: Bullet[] = [];
    }
    let id = 0;

    class Bullet {
      public id;

      public constructor() {
        this.id = id++;
      }
    }
    const game = new Game();
    manage(game);

    let [, writeLog] = runInAction(() => {
      const [, readLog] = capture(() => {
        game.gun.bullets.push(new Bullet());
      });
      expect(inspect(readLog)).toBe(`Map(2) {
  Gun { bullets: [ [Bullet] ] } => { get: Map(1) { 'bullets' => [Array] } },
  [ Bullet { id: 0 } ] => { get: Map(1) { 'length' => 0 } }
}`);
    });
    expect(inspect(writeLog)).toBe(
      `Map(1) { [ Bullet { id: 0 } ] => Map(2) { '0' => 1, 'length' => 0 } }`,
    );

    [, writeLog] = runInAction(() => {
      const [, readLog] = capture(() => {
        expect(game.gun.bullets.map((b) => b.id)).toEqual([0]); // also trigger gets
      });
      expect(inspect(readLog)).toBe(`Map(3) {
  Gun { bullets: [ [Bullet] ] } => { get: Map(1) { 'bullets' => [Array] } },
  [ Bullet { id: 0 } ] => {
    get: Map(2) { 'length' => 1, '0' => [Bullet] },
    has: Map(1) { '0' => true }
  },
  Bullet { id: 0 } => { get: Map(1) { 'id' => 0 } }
}`);
    });
    expect(inspect(writeLog)).toBe(`Map(0) {}`); // because no write operation
  });
});
