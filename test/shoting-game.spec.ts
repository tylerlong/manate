import { describe, expect, test } from 'vitest';

import { manage } from '../src';
import type { ManateEvent } from '../src/models';

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
    const mg = manage(game);
    const events: string[] = [];
    mg.$e.on((event: ManateEvent) => {
      events.push(event.toString());
    });
    game.gun.bullets.push(new Bullet());
    expect(events).toEqual([
      'get: gun+bullets',
      'get: gun+bullets+length',
      'set: gun+bullets+0',
      'set: gun+bullets+length',
    ]);
    events.length = 0;
    expect(game.gun.bullets.map((b) => b.id)).toEqual([0]); // also trigger gets
    expect(events).toEqual([
      'get: gun+bullets',
      'get: gun+bullets+length',
      'get: gun+bullets+0',
      'get: gun+bullets+0+id',
    ]);
  });
});
