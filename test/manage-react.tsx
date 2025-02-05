import React from "react";
import { describe, test } from "vitest";

import { manage } from "../src/index.js";

describe("Manage React", () => {
  test("default", () => {
    const App = <h1>Hello world</h1>;
    manage({ temp: App });
  });
});
