/// <reference path="../node_modules/@types/mocha/index.d.ts" /> 

import hello from "../src/hello";
import { expect } from "chai";

describe("Hello function", () => {
  it("should return hello world", () => {
    const result = hello();
    expect(result).to.equal("Hello World!");
  });
});