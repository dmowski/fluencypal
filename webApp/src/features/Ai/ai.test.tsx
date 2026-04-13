import '@testing-library/jest-dom';
import { calculateTextUsagePrice, calculateUsagePrice, TextAiModel } from './ai';

describe('Calculate real time price', () => {
  const modelGpt4o = 'gpt-4o-realtime-preview';

  it('should correctly calculate the usage price (Random)', () => {
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
      modelGpt4o,
    );

    expect(price).toBeDefined();
    expect(typeof price).toBe('number');
    expect(isFinite(price)).toBe(true);

    const aiPrice = 0.007585;
    const priceWithProfit = aiPrice;

    expect(price).toBe(priceWithProfit);
  });

  it('should correctly calculate the usage price (Output text)', () => {
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
      modelGpt4o,
    );
    const aiPrice = 20;
    const priceWithProfit = aiPrice;

    expect(price).toBeDefined();
    expect(typeof price).toBe('number');
    expect(isFinite(price)).toBe(true);

    expect(price).toBe(priceWithProfit);
  });

  it('should correctly calculate the usage price (Audio. no Cache)', () => {
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
      modelGpt4o,
    );
    const aiPrice = 40;
    const priceWithProfit = aiPrice;
    expect(price).toBeDefined();
    expect(typeof price).toBe('number');
    expect(isFinite(price)).toBe(true);

    expect(price).toBe(priceWithProfit);
  });

  it('should correctly calculate the usage price (Audio: full cached)', () => {
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
      modelGpt4o,
    );
    const aiPrice = 2.5;
    const priceWithProfit = aiPrice;
    expect(price).toBeDefined();
    expect(typeof price).toBe('number');
    expect(isFinite(price)).toBe(true);

    expect(price).toBe(priceWithProfit);
  });
});

describe('Calculate text price', () => {
  const modelGpt4o: TextAiModel = 'gpt-4o';

  it('should correctly calculate the usage price for 1M input', () => {
    const price = calculateTextUsagePrice(
      {
        text_cached_input: 0,
        text_input: 1_000_000,
        text_output: 0,
      },
      modelGpt4o,
    );

    expect(price).toBeDefined();
    expect(typeof price).toBe('number');
    expect(isFinite(price)).toBe(true);

    const aiPrice = 2.5;
    const priceWithProfit = aiPrice;
    expect(price).toBe(priceWithProfit);
  });

  it('should correctly calculate the usage price for 1M input and 1M output', () => {
    const price = calculateTextUsagePrice(
      {
        text_cached_input: 0,
        text_input: 1_000_000,
        text_output: 1_000_000,
      },
      modelGpt4o,
    );

    expect(price).toBeDefined();
    expect(typeof price).toBe('number');
    expect(isFinite(price)).toBe(true);
    const aiPrice = 12.5;
    const priceWithProfit = aiPrice;
    expect(price).toBe(priceWithProfit);
  });

  it('should correctly calculate the usage price for 1M input and 1M output and 1M cache ', () => {
    const price = calculateTextUsagePrice(
      {
        text_cached_input: 1_000_000,
        text_input: 1_000_000,
        text_output: 1_000_000,
      },
      modelGpt4o,
    );

    expect(price).toBeDefined();
    expect(typeof price).toBe('number');
    expect(isFinite(price)).toBe(true);

    const aiPrice = 11.25;
    const priceWithProfit = aiPrice;
    expect(price).toBe(priceWithProfit);
  });

  it('should correctly calculate the usage price for 1M input  and 1M cache ', () => {
    const price = calculateTextUsagePrice(
      {
        text_cached_input: 1_000_000,
        text_input: 1_000_000,
        text_output: 0,
      },
      modelGpt4o,
    );

    expect(price).toBeDefined();
    expect(typeof price).toBe('number');
    expect(isFinite(price)).toBe(true);
    const aiPrice = 1.25;
    const priceWithProfit = aiPrice;
    expect(price).toBe(priceWithProfit);
  });
});
