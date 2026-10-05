import pricingFile from "../../pricing.json" with { type: "json" };

export type PricingRegion = "singapore" | "beijing";

export type RegionPricing = {
  label: string;
  inputText: number;
  inputAudio: number;
  outputText: number;
  outputAudio: number;
  outputTextIncludedInAudio: boolean;
};

export type TokenTotals = {
  inputTextTokens: number;
  inputAudioTokens: number;
  outputTextTokens: number;
  outputAudioTokens: number;
};

export const emptyTokens = (): TokenTotals => ({
  inputTextTokens: 0,
  inputAudioTokens: 0,
  outputTextTokens: 0,
  outputAudioTokens: 0,
});

export const pricingDocument = pricingFile;

export function pricingForRegion(region: PricingRegion): RegionPricing {
  return pricingFile.regions[region];
}

export function estimateCostUsd(tokens: TokenTotals, pricing: RegionPricing): number {
  const input =
    (tokens.inputTextTokens * pricing.inputText + tokens.inputAudioTokens * pricing.inputAudio) /
    1_000_000;
  const chargeOutputText = !pricing.outputTextIncludedInAudio || tokens.outputAudioTokens === 0;
  const output =
    ((chargeOutputText ? tokens.outputTextTokens * pricing.outputText : 0) +
      tokens.outputAudioTokens * pricing.outputAudio) /
    1_000_000;
  return input + output;
}

export function costPerMinuteUsd(totalCostUsd: number, elapsedMs: number): number | null {
  if (elapsedMs < 1000) return null;
  return totalCostUsd / (elapsedMs / 60_000);
}

/** Project the spend so far across a full hour. Null until the call has run for a second. */
export function costPerHourUsd(totalCostUsd: number, elapsedMs: number): number | null {
  const perMinute = costPerMinuteUsd(totalCostUsd, elapsedMs);
  if (perMinute == null) return null;
  return perMinute * 60;
}

export function tokensPerMinute(tokens: number, elapsedMs: number): number | null {
  if (elapsedMs < 1000) return null;
  return tokens / (elapsedMs / 60_000);
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as UnknownRecord;
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

export type UsageSnapshot = TokenTotals;

/**
 * Read one response.done usage object.
 * Accepts both `input_tokens_details` (Qwen) and `input_token_details` (OpenAI-style).
 * Tokens not covered by the detail fields are kept so the estimate does not drop them.
 */
export function parseUsage(raw: unknown): UsageSnapshot | null {
  const usage = asRecord(raw);
  if (!usage) return null;

  const inputDetails = asRecord(usage.input_tokens_details) ?? asRecord(usage.input_token_details);
  const outputDetails = asRecord(usage.output_tokens_details) ?? asRecord(usage.output_token_details);

  let inputText = num(inputDetails?.text_tokens);
  let inputAudio = num(inputDetails?.audio_tokens);
  let outputText = num(outputDetails?.text_tokens);
  let outputAudio = num(outputDetails?.audio_tokens);

  const inputTotal = num(usage.input_tokens);
  const outputTotal = num(usage.output_tokens);

  if (!inputDetails && !outputDetails) {
    if (inputTotal + outputTotal === 0) return null;
    return {
      inputTextTokens: inputTotal,
      inputAudioTokens: 0,
      outputTextTokens: outputTotal,
      outputAudioTokens: 0,
    };
  }

  const inputRemainder = Math.max(0, inputTotal - inputText - inputAudio);
  const outputRemainder = Math.max(0, outputTotal - outputText - outputAudio);
  if (inputAudio > 0 || outputAudio > 0) inputAudio += inputRemainder;
  else inputText += inputRemainder;
  if (outputAudio > 0) outputAudio += outputRemainder;
  else outputText += outputRemainder;

  if (inputText + inputAudio + outputText + outputAudio === 0) return null;

  return {
    inputTextTokens: inputText,
    inputAudioTokens: inputAudio,
    outputTextTokens: outputText,
    outputAudioTokens: outputAudio,
  };
}
