import "@testing-library/jest-dom";
import { isGoodUserInput } from "./isGoodUserInput";

describe("Check is isGoodUserInput", () => {
  it("Equal string", () => {
    const result = isGoodUserInput({ input: "1", correctedMessage: "1" });

    expect(result).toBe(true);
  });

  it("Not equal", () => {
    const result = isGoodUserInput({ input: "1", correctedMessage: "2" });

    expect(result).toBe(false);
  });

  it("Empty corrections", () => {
    expect(isGoodUserInput({ input: "Hello", correctedMessage: "" })).toBe(true);
  });

  it("Almost equal", () => {
    expect(isGoodUserInput({ input: "Hello", correctedMessage: "hello" })).toBe(true);
  });

  it("Almost equal with symbols", () => {
    expect(
      isGoodUserInput({
        input: "Hello, are   -you, here",
        correctedMessage: "Hello? Are, you here",
      })
    ).toBe(true);
  });
});
