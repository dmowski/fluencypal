import "@testing-library/jest-dom";
import { calculateUsagePrice } from "./ai";

describe("calculateUsagePrice", () => {
  const modelGpt4o = "gpt-4o-realtime-preview";

  it("should correctly calculate the usage price (Random)", () => {
    const price = calculateUsagePrice(
      {
        total_tokens: 821,
        input_tokens: 789,
        output_tokens: 32,
        input_token_details: {
          text_tokens: 313,
          audio_tokens: 476,
          cached_tokens: 640,
          cached_tokens_details: {
            text_tokens: 256,
            audio_tokens: 384,
          },
        },
        output_token_details: {
          text_tokens: 9,
          audio_tokens: 23,
        },
      },
      modelGpt4o
    );

    expect(price).toBeDefined();
    expect(typeof price).toBe("number");
    expect(isFinite(price)).toBe(true);

    expect(price).toBe(0.007585);
  });

  it("should correctly calculate the usage price (Output text)", () => {
    const price = calculateUsagePrice(
      {
        total_tokens: 1_000_000,
        input_tokens: 0,
        output_tokens: 1_000_000,
        input_token_details: {
          text_tokens: 0,
          audio_tokens: 0,
          cached_tokens: 0,
          cached_tokens_details: {
            text_tokens: 0,
            audio_tokens: 0,
          },
        },
        output_token_details: {
          text_tokens: 1_000_000,
          audio_tokens: 0,
        },
      },
      modelGpt4o
    );

    expect(price).toBeDefined();
    expect(typeof price).toBe("number");
    expect(isFinite(price)).toBe(true);

    expect(price).toBe(20);
  });

  it("should correctly calculate the usage price (Audio. no Cache)", () => {
    const price = calculateUsagePrice(
      {
        total_tokens: 1_000_000,
        input_tokens: 1_000_000,
        output_tokens: 0,
        input_token_details: {
          text_tokens: 0,
          audio_tokens: 1_000_000,
          cached_tokens: 0,
          cached_tokens_details: {
            text_tokens: 0,
            audio_tokens: 0,
          },
        },
        output_token_details: {
          text_tokens: 0,
          audio_tokens: 0,
        },
      },
      modelGpt4o
    );

    expect(price).toBeDefined();
    expect(typeof price).toBe("number");
    expect(isFinite(price)).toBe(true);

    expect(price).toBe(40);
  });

  it("should correctly calculate the usage price (Audio: full cached)", () => {
    const price = calculateUsagePrice(
      {
        total_tokens: 1_000_000,
        input_tokens: 1_000_000,
        output_tokens: 0,
        input_token_details: {
          text_tokens: 0,
          audio_tokens: 1_000_000,
          cached_tokens: 0,
          cached_tokens_details: {
            text_tokens: 0,
            audio_tokens: 1_000_000,
          },
        },
        output_token_details: {
          text_tokens: 0,
          audio_tokens: 0,
        },
      },
      modelGpt4o
    );

    expect(price).toBeDefined();
    expect(typeof price).toBe("number");
    expect(isFinite(price)).toBe(true);

    expect(price).toBe(2.5);
  });
});
