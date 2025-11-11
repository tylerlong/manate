import { describe, expect, test } from "vitest";

import { autoRun, manage } from "../src/index.js";

describe("sanguosha", () => {
  test("normal function", () => {
    class Hero {
      hp = 4;
      takeDamage(damage: number) {
        this.hp -= damage;
      }
    }
    const hero = manage(new Hero());
    const history: number[] = [];
    const autoRunner = autoRun(() => history.push(hero.hp));
    autoRunner.start();
    expect(history).toEqual([4]);
    hero.takeDamage(1);
    expect(history).toEqual([4, 3]);
  });

  test("arrow function", () => {
    class Hero {
      hp = 4;
      takeDamage = (damage: number) => {
        this.hp -= damage;
      };
    }
    const hero = manage(new Hero());
    const history: number[] = [];
    const autoRunner = autoRun(() => history.push(hero.hp));
    autoRunner.start();
    expect(history).toEqual([4]);
    hero.takeDamage(1);
    expect(history).toEqual([4]); // arrow function does not trigger autoRun
  });
});
