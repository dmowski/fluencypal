import "@testing-library/jest-dom";
import { getWordsFromText } from "./getWordsFromText";

describe("getWordsFromText", () => {
  const modelGpt4o = "gpt-4o-realtime-preview";

  it("Simple string", () => {
    const result = getWordsFromText("hello world");
    expect(result).toEqual({
      hello: 1,
      world: 1,
    });
  });

  it("Advanced string", () => {
    const result = getWordsFromText(
      "hello World. hello world? And - hello world! Привет мир.",
    );
    expect(result).toEqual({
      hello: 3,
      world: 3,
      and: 1,
      привет: 1,
      мир: 1,
    });
  });
});
