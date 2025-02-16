import "@testing-library/jest-dom";
import { calculateUsagePrice, UsageEvent } from "./ai";

describe("calculateUsagePrice", () => {
  const mockUsageEvent: UsageEvent = {
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
  };

  const model = "gpt-4o-realtime-preview";

  it("should correctly calculate the usage price", () => {
    const price = calculateUsagePrice(mockUsageEvent, model);

    expect(price).toBeDefined();
    expect(typeof price).toBe("number");
    expect(isFinite(price)).toBe(true);

    expect(price).toBe(0.007585);
  });
});
