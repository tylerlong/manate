import { describe, expect, test } from "vitest";
import waitFor from "wait-for-async";

import { debounce } from "../src/wrappers.ts";

describe("debounce", () => {
  test("default", async () => {
    const l: number[] = [];
    const df = debounce(1000)((i: number) => {
      l.push(i);
    });
    df(1);
    await waitFor({ interval: 1 });
    df(2);
    await waitFor({ interval: 1 });
    df(3);
    await waitFor({ interval: 1100 });
    expect(l).to.deep.equal([3]);
  });
});
