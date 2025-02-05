// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, test } from "vitest";

import { manage } from "../src";
import { auto, c2f } from "../src/react";

class Store {
  public hanzi: Hanzi;
  public hanzis = [new Hanzi("刘"), new Hanzi("春"), new Hanzi("涛")];
  public index = 0;

  public constructor() {
    this.hanzi = this.hanzis[0];
  }

  public changeHanzi() {
    this.index += 1;
    if (this.index > 2) {
      this.index = 0;
    }
    this.hanzi = this.hanzis[this.index];
  }
}

class Hanzi {
  public hanzi: string;

  public constructor(hanzi: string) {
    this.hanzi = hanzi;
  }
}

const store = manage(new Store());

class _App extends React.Component<{ store: Store }> {
  public render() {
    const store = this.props.store;
    return (
      <>
        <button onClick={() => store.changeHanzi()}>Change Hanzi</button>
        <HanziComponent hanzi={store.hanzi} />
      </>
    );
  }
}
const App = auto(c2f(_App));

const renderHistory: string[] = [];
class _HanziComponent extends React.Component<{ hanzi: Hanzi }> {
  public render() {
    const { hanzi } = this.props;
    renderHistory.push(hanzi.hanzi);
    return hanzi.hanzi;
  }
}
const HanziComponent = auto(c2f(_HanziComponent));

describe("React", () => {
  test("default", async () => {
    render(<App store={store} />);
    const changeButton = screen.getByText("Change Hanzi");
    expect(renderHistory).toEqual(["刘"]);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(["刘", "春"]);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(["刘", "春", "涛"]);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(["刘", "春", "涛", "刘"]);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(["刘", "春", "涛", "刘", "春"]);
    await userEvent.click(changeButton);
    expect(renderHistory).toEqual(["刘", "春", "涛", "刘", "春", "涛"]);
    cleanup();
  });
});
